"""add invitation actions to audit_log

Revision ID: c26d3c3bb3eb
Revises: 9ba6b9d2b334
Create Date: 2026-11-22 18:02:19.615339

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c26d3c3bb3eb'
down_revision: Union[str, Sequence[str], None] = '9ba6b9d2b334'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Postgres can't edit a CHECK in place, so it's dropped and added back with the four Invitation actions.
    # Dropping it locks audit_log until the migration commits, so no entry can be added while it's missing
    op.drop_constraint("check_audit_log_action", "audit_log", type_="check")
    op.create_check_constraint(
        "check_audit_log_action",
        "audit_log",
        "action IN ('add_card', 'edit_card', 'delete_card', "
        "'send_invitation', 'resend_invitation', 'cancel_invitation', 'accept_invitation')",
    )


def downgrade() -> None:
    """Downgrade schema."""
    # adding the old CHECK back checks every existing entry, and entries can't be deleted. So once any
    # Invitation action has been logged, this fails rather than leave entries the constraint wouldn't allow
    op.drop_constraint("check_audit_log_action", "audit_log", type_="check")
    op.create_check_constraint(
        "check_audit_log_action",
        "audit_log",
        "action IN ('add_card', 'edit_card', 'delete_card')",
    )
