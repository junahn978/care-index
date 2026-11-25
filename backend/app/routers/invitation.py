import logging
from fastapi import APIRouter, Depends, HTTPException, status
from resend.exceptions import ResendError
from sqlalchemy.orm import Session
from backend.app.auth import CurrentUser, get_current_user
from backend.app.authorization import can
from backend.app.db import get_db
from backend.app.schemas.invitations import InvitationCreate, InvitationListItem, InvitationResponse
from backend.app.services.invitation import PendingInvitationExists, is_delegate, list_invitations, send_invitation

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/invitations",
    tags=["Invitations"]
)

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
        # so the server's log says why, like a bad API key, a timeout or a rate limit. Only Resend's own code, type
        # and message go in, not the token, the link or the invited email, and %r keeps a message with line breaks
        # on one line. No traceback, since Resend failed, not this code
        logger.warning(
            "Resend didn't take the Invitation email: code=%s type=%s message=%r",
            error.code, error.error_type, error.message,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"code": "email_not_sent", "message": "The Invitation email couldn't be sent, so nothing was saved. Try again"},
        )


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
