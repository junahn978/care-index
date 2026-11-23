from typing import Literal
from uuid import UUID
from sqlalchemy.orm import Session
from backend.app.auth import CurrentUser
from backend.app.models.audit_log import AuditLog

# every action the Audit Log records, the same list as the CHECK constraint on audit_log.action.
# Rows can never be corrected, so a wrong action name is refused instead of kept forever
AuditAction = Literal[
    "add_card", "edit_card", "delete_card",
    "send_invitation", "resend_invitation", "cancel_invitation", "accept_invitation",
]


# adds one Audit Log entry to the caller's transaction. It never flushes or commits: the caller's single
# commit saves the entry together with the change it records, so both are saved or neither is
def log_action(
    db: Session,
    actor: CurrentUser,
    action: AuditAction,
    *,
    owner_id: UUID | None = None,
    card_id: int | None = None,
    details: dict | None = None,
) -> None:
    db.add(AuditLog(
        actor_id=actor.id,
        actor_email=actor.email,
        action=action,
        owner_id=owner_id,
        card_id=card_id,
        details=details,
    ))
