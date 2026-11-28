import logging
from fastapi import APIRouter, Depends, HTTPException, status
from resend.exceptions import ResendError
from sqlalchemy.orm import Session
from backend.app.auth import CurrentUser, get_current_user
from backend.app.authorization import can
from backend.app.db import get_db
from backend.app.models.invitation import Invitation
from backend.app.schemas.invitations import InvitationCreate, InvitationListItem, InvitationResponse
from backend.app.services.invitation import (
    PendingInvitationExists,
    cancel_invitation,
    get_invitation,
    get_invitation_for_update,
    is_delegate,
    list_invitations,
    resend_invitation,
    send_invitation,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/invitations",
    tags=["Invitations"]
)


# the 502 for when Resend refused the Invitation email or didn't answer, so nothing was saved or changed. message is
# what the Owner reads: Send's by default, and Resend passes its own. First the server's log says why, like a bad API
# key, a timeout or a rate limit. Only Resend's own code, type and message go in, not the token, the link or the
# invited email, and %r keeps a message with line breaks on one line. No traceback, since Resend failed, not this code
def email_not_sent(
    error: ResendError,
    message: str = "The Invitation email couldn't be sent, so nothing was saved. Try again",
) -> HTTPException:
    logger.warning(
        "Resend didn't take the Invitation email: code=%s type=%s message=%r",
        error.code, error.error_type, error.message,
    )
    return HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail={"code": "email_not_sent", "message": message},
    )


# the Invitation with this id, locked until this request commits or rolls back, once it's known to be the caller's to
# manage and pending, expired or not. Resend and Cancel both start here, so they refuse the same way: someone else's
# Invitation, or one that doesn't exist, is a 404, and one that isn't pending is a 409. Each route words two of the
# 409s its own way, so it passes in what the Owner reads for a cancelled Invitation and for any other status
def lock_pending_invitation(
    db: Session,
    invitation_id: int,
    user: CurrentUser,
    *,
    cancelled_message: str,
    not_pending_message: str,
) -> Invitation:
    # an unlocked read first, so an unauthorized caller never locks or waits on someone else's row
    invitation = get_invitation(db, invitation_id)

    # someone else's Invitation gets the same answer as one that doesn't exist, so an id reveals nothing
    if invitation is None or not can(user, "manage_delegations", invitation.owner_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    # authorized, so now lock the row until this request commits or rolls back, and read it afresh: populate_existing
    # overwrites what the unlocked read loaded
    invitation = get_invitation_for_update(db, invitation_id)
    # gone in between, like when its Owner's account was deleted
    if invitation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    # the status is checked only after the lock, so it's the current one, and nothing else can change it until this
    # request commits or rolls back. Only a pending Invitation gets through, expired or not
    if invitation.status == "accepted":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "invitation_accepted", "message": "This Invitation has already been accepted"},
        )
    if invitation.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "invitation_cancelled", "message": cancelled_message},
        )
    # nor anything else that isn't pending. Like can(), it fails closed, so a status added later can't be resent or
    # cancelled by mistake
    if invitation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "invitation_not_pending", "message": not_pending_message},
        )

    return invitation


# the Owner invites one email to their Doctor Cards at one Access Level. Each refusal carries a stable code,
# like the 403s in auth.py, so the frontend can tell the two 409s apart without matching the message text
@router.post(
    "",
    response_model=InvitationResponse,
    status_code=201,
    summary="Send an Invitation",
)
def post_invitation(invitation: InvitationCreate, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    # always the caller's own Delegations for now, but can() still decides
    if not can(user, "manage_delegations", user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    # nobody can invite themselves, Admins included (ADR 0007). Both emails are lowercase
    if invitation.email == user.email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"code": "cannot_invite_yourself", "message": "You can't invite yourself"},
        )

    # nor someone who already holds an active Delegation from them
    if is_delegate(db, user.id, invitation.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "already_a_delegate", "message": "This person is already your Delegate"},
        )

    try:
        return send_invitation(db, invitation, user)
    # a pending Invitation to this email already exists, expired or not, so the Owner should Resend that one
    except PendingInvitationExists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "invitation_pending", "message": "You've already invited this email. Use Resend instead"},
        )
    # Resend refused the email or didn't answer, and send_invitation saved nothing
    except ResendError as error:
        raise email_not_sent(error)


# the Owner's Invitations, newest first, each shown as pending, expired, accepted or cancelled
@router.get(
    "",
    response_model=list[InvitationListItem],
    status_code=200,
    summary="List your Invitations",
)
def get_invitations(db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    # always the caller's own Invitations for now, but can() still decides
    if not can(user, "manage_delegations", user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    return list_invitations(db, user.id)


# emails a pending Invitation, expired or not, a new link that works for 7 days from now. The old link stops working
@router.post(
    "/{invitation_id}/resend",
    response_model=InvitationResponse,
    status_code=200,
    summary="Resend an Invitation",
)
def post_resend_invitation(invitation_id: int, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    invitation = lock_pending_invitation(
        db,
        invitation_id,
        user,
        cancelled_message="This Invitation was cancelled. Send a new one instead",
        not_pending_message="Only a pending Invitation can be resent",
    )

    try:
        return resend_invitation(db, invitation, user)
    # Resend refused the email or didn't answer, and resend_invitation changed nothing, so the old link still works
    except ResendError as error:
        raise email_not_sent(error, "The Invitation email couldn't be resent, so nothing was changed. Try again")


# cancels a pending Invitation, expired or not, so it can't be accepted anymore. No email goes out
@router.post(
    "/{invitation_id}/cancel",
    response_model=InvitationResponse,
    status_code=200,
    summary="Cancel an Invitation",
)
def post_cancel_invitation(invitation_id: int, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    invitation = lock_pending_invitation(
        db,
        invitation_id,
        user,
        cancelled_message="This Invitation has already been cancelled",
        not_pending_message="Only a pending Invitation can be cancelled",
    )

    return cancel_invitation(db, invitation, user)
