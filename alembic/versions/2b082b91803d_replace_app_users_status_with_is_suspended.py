"""replace app_users status with is_suspended

Revision ID: 2b082b91803d
Revises: 4425432cf3ca
Create Date: 2026-11-15 15:53:52.060218

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b082b91803d'
down_revision: Union[str, Sequence[str], None] = '4425432cf3ca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # only two states exist, so a boolean says it with no strings to misspell
    op.add_column(
        "app_users",
        sa.Column("is_suspended", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    # carry over anyone already suspended before the old column goes
    op.execute("UPDATE app_users SET is_suspended = (status = 'suspended')")
    op.drop_constraint("check_app_users_status", "app_users", type_="check")
    op.drop_column("app_users", "status")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        "app_users",
        sa.Column("status", sa.String(length=20), server_default=sa.text("'active'"), nullable=False),
    )
    op.execute("UPDATE app_users SET status = CASE WHEN is_suspended THEN 'suspended' ELSE 'active' END")
    op.create_check_constraint("check_app_users_status", "app_users", "status IN ('active', 'suspended')")
    op.drop_column("app_users", "is_suspended")
