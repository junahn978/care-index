"""create allowed_emails table

Revision ID: 4425432cf3ca
Revises: 3312f70870d7
Create Date: 2026-11-15 11:32:18.159372

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4425432cf3ca'
down_revision: Union[str, Sequence[str], None] = '3312f70870d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "allowed_emails",
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("note", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("email = lower(email)", name="check_allowed_emails_lowercase"),
        sa.PrimaryKeyConstraint("email"),
    )

    # same as app_users: no policies, so Supabase's Data API can't read or add emails
    op.execute("ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY")

    # No seed rows here: the repo is public, so the allowed emails are inserted into each database directly


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("allowed_emails")
