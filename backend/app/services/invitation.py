import hashlib
import secrets
from collections.abc import Sequence
from datetime import timedelta
from uuid import UUID
from sqlalchemy import RowMapping, and_, case, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from backend.app.auth import CurrentUser
from backend.app.config import FRONTEND_URL
from backend.app.models.app_user import AppUser
from backend.app.models.delegation import Delegation
from backend.app.models.invitation import Invitation
from backend.app.schemas.invitations import InvitationCreate
from backend.app.services.audit_log import log_action
from backend.app.services.email import send_invitation_email

# how long an Invitation's link works (ADR 0007). The email tells the invitee the same 7 days
INVITATION_LIFETIME = timedelta(days=7)

# the status the Owner sees. Expired isn't stored (ADR 0007): an Invitation works while it's under 7 days old, so a
# pending one has expired once expires_at is the database's now() or earlier. The database's clock, since it set
# expires_at. Accepted and cancelled Invitations keep their status, whatever expires_at says
shown_status = case(
    (and_(Invitation.status == "pending", Invitation.expires_at <= func.now()), "expired"),
    else_=Invitation.status,
)


# the Owner already has a pending Invitation to this email, expired or not, so they should Resend that one
class PendingInvitationExists(Exception):
    pass


# whether email (lowercase) belongs to someone who holds an active Delegation from this Owner
def is_delegate(db: Session, owner_id: UUID, email: str) -> bool:
    query = (
        select(Delegation.id)
        .join(AppUser, AppUser.id == Delegation.delegate_id)
        .where(
            Delegation.owner_id == owner_id,
            Delegation.status == "active",
            # app_users compares emails case-insensitively: its unique index is on lower(email)
            func.lower(AppUser.email) == email,
        )
    )
    return db.scalar(query) is not None


# a new random token and its SHA-256. The raw token goes in the emailed link and is kept nowhere else. Only its
# hash is stored, so someone who reads the invitations table still can't accept an Invitation
def new_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    return token, hashlib.sha256(token.encode()).hexdigest()


# emails the link with the raw token, then commits everything the session holds (ADR 0007), so the Owner is told
# it was sent only once Resend has taken the email. Send and Resend both end here. Returns the Invitation as saved
def email_then_commit(db: Session, invitation: Invitation, owner: CurrentUser, token: str) -> Invitation:
    link = f"{FRONTEND_URL}/accept-invitation#token={token}"
    try:
        send_invitation_email(invitation.invited_email, owner, invitation.access_level, link)
    except Exception:
        # any failure, not just ResendError, undoes the INSERT or UPDATE already sent, and the same error goes on to
        # the route. The log entry was only added to the session (autoflush is off), so it never reached the database
        db.rollback()
        raise

    db.commit()
    db.refresh(invitation)

    return invitation


# saves the Invitation, logs it, emails the link, then commits (ADR 0007), so the Owner is told it was sent only
# once Resend has taken the email. Raises PendingInvitationExists, or whatever error the email failed with
# (ResendError when Resend refuses it or doesn't answer), and either way nothing is saved. Returns the saved
# Invitation, which holds the token's hash, never the token
def send_invitation(db: Session, invitation_in: InvitationCreate, owner: CurrentUser) -> Invitation:
    token, token_hash = new_token()
    invitation = Invitation(
        owner_id=owner.id,
        invited_email=invitation_in.email,
        access_level=invitation_in.access_level,
        token_hash=token_hash,
        # 7 days on from the database's now(), the clock expiry is checked against. The database fills in the
        # rest: status pending, created_at now(), and accepted_at and cancelled_at empty
        expires_at=func.now() + INVITATION_LIFETIME,
    )
    db.add(invitation)

    try:
        # sends the INSERT so Postgres assigns the id the log entry needs. A second pending Invitation to the same
        # email is refused here by the unique index, before any email goes out, even if two Sends arrive at once
        db.flush()
    except IntegrityError as error:
        db.rollback()
        # only that unique index means a pending Invitation exists. Any other IntegrityError is re-raised as it is,
        # even one whose driver error has no diag to read, rather than hidden behind an AttributeError
        if getattr(getattr(error.orig, "diag", None), "constraint_name", None) == "index_invitations_pending_owner_email":
            raise PendingInvitationExists from error
        raise

    # who was invited and at which Access Level, never the token: the log is permanent
    log_action(
        db,
        owner,
        "send_invitation",
        owner_id=owner.id,
        details={
            "invitation_id": invitation.id,
            "invited_email": invitation_in.email,
            "access_level": invitation_in.access_level,
        },
    )

    return email_then_commit(db, invitation, owner, token)


# the Invitation with this id, or None if there's none, read without a lock, so it never waits on another request.
# Only for deciding who may act on it, which is safe because an Invitation's owner_id never changes. Its status can,
# so that's checked on the row get_invitation_for_update locks
def get_invitation(db: Session, invitation_id: int) -> Invitation | None:
    return db.get(Invitation, invitation_id)


# the Invitation with this id, or None if there's none, locked until this request commits or rolls back
# (SELECT ... FOR UPDATE). Resend and Cancel lock it here. Anything else that changes an Invitation, like Accept, must
# lock it the same way, so it waits for this request and then sees what it saved, instead of acting on the old row.
# populate_existing reads the row afresh even if the session already holds this Invitation, as it does after
# get_invitation
def get_invitation_for_update(db: Session, invitation_id: int) -> Invitation | None:
    return db.get(Invitation, invitation_id, with_for_update=True, populate_existing=True)


# gives a pending Invitation, expired or not, a new token that works for 7 days from now, logs it, emails the new
# link, then commits (ADR 0007). The new hash replaces the old one, so the old link stops working, but only once the email
# has gone: if it fails, everything rolls back and the old link still works. Raises whatever error the email
# failed with (ResendError when Resend refuses it or doesn't answer). invitation is the row the route locked and
# checked
def resend_invitation(db: Session, invitation: Invitation, owner: CurrentUser) -> Invitation:
    token, token_hash = new_token()
    invitation.token_hash = token_hash
    # 7 days on from the database's now(), like a new Invitation. created_at stays: it's when the Invitation was
    # first sent, so a Resend doesn't move it up the list
    invitation.expires_at = func.now() + INVITATION_LIFETIME
    # sends the UPDATE before the email, so a database error stops the Resend before any email goes out
    db.flush()

    # the same details as a Send, never the token: the log is permanent
    log_action(
        db,
        owner,
        "resend_invitation",
        owner_id=invitation.owner_id,
        details={
            "invitation_id": invitation.id,
            "invited_email": invitation.invited_email,
            "access_level": invitation.access_level,
        },
    )

    return email_then_commit(db, invitation, owner, token)


# cancels a pending Invitation, expired or not, logs it, then commits. No email goes out. Once cancelled it can't be
# accepted (ADR 0007), since Accept must take only a pending Invitation, and the Owner can invite the same email again.
# invitation is the row the route locked and checked. Returns the Invitation as saved
def cancel_invitation(db: Session, invitation: Invitation, owner: CurrentUser) -> Invitation:
    invitation.status = "cancelled"
    # the database's now(), like the Invitation's other times
    invitation.cancelled_at = func.now()
    # sends the UPDATE now, before the log entry, as Send and Resend do. Left to the commit, SQLAlchemy would send the
    # log entry's INSERT first
    db.flush()

    # the same details as a Send or a Resend, never the token's hash: the log is permanent
    log_action(
        db,
        owner,
        "cancel_invitation",
        owner_id=invitation.owner_id,
        details={
            "invitation_id": invitation.id,
            "invited_email": invitation.invited_email,
            "access_level": invitation.access_level,
        },
    )

    # one commit saves the change and its log entry, so both are saved or neither is
    db.commit()
    db.refresh(invitation)

    return invitation


# the Owner's Invitations, newest first, each with the status they see. All of them, with no paging: an Owner sends
# a handful. Nothing is logged, since the Audit Log records Invitation changes (ADR 0007) and reading isn't one
def list_invitations(db: Session, owner_id: UUID) -> Sequence[RowMapping]:
    query = (
        # exactly the fields the list shows, with status as the Owner sees it. token_hash isn't selected, so it
        # never even leaves the database
        select(
            Invitation.id,
            Invitation.owner_id,
            Invitation.invited_email,
            Invitation.access_level,
            shown_status.label("status"),
            Invitation.expires_at,
            Invitation.created_at,
            Invitation.accepted_at,
            Invitation.cancelled_at,
        )
        .where(Invitation.owner_id == owner_id)
        # newest first. Two Invitations can share a created_at (a transaction has one now()), so the id breaks the tie
        .order_by(Invitation.created_at.desc(), Invitation.id.desc())
    )
    return db.execute(query).mappings().all()
