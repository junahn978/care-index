import hashlib
import secrets
from datetime import timedelta
from uuid import UUID
from resend.exceptions import ResendError
from sqlalchemy import func, select
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


# saves the Invitation, logs it, emails the link, then commits (ADR 0007), so the Owner is told it was sent only
# once Resend has taken the email. Raises PendingInvitationExists, or ResendError when the email fails, and either
# way nothing is saved. Returns the saved Invitation, which holds the token's hash, never the token
def send_invitation(db: Session, invitation_in: InvitationCreate, owner: CurrentUser) -> Invitation:
    # the raw token goes in the emailed link and is kept nowhere else. Only its hash is stored, so someone who
    # reads the invitations table still can't accept an Invitation
    token = secrets.token_urlsafe(32)
    invitation = Invitation(
        owner_id=owner.id,
        invited_email=invitation_in.email,
        access_level=invitation_in.access_level,
        token_hash=hashlib.sha256(token.encode()).hexdigest(),
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
        if error.orig.diag.constraint_name == "index_invitations_pending_owner_email":
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

    link = f"{FRONTEND_URL}/accept-invitation#token={token}"
    try:
        send_invitation_email(invitation_in.email, owner, invitation_in.access_level, link)
    except ResendError:
        # undoes the INSERT. The log entry was only added to the session (autoflush is off), so it never
        # reached the database
        db.rollback()
        raise

    db.commit()
    db.refresh(invitation)

    return invitation
