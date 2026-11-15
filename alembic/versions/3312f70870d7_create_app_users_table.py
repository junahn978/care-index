"""create app_users table

Revision ID: 3312f70870d7
Revises: bd2136b8cc01
Create Date: 2026-11-15 09:41:23.880823

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3312f70870d7'
down_revision: Union[str, Sequence[str], None] = 'bd2136b8cc01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "app_users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("is_admin", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("status", sa.String(length=20), server_default=sa.text("'active'"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("status IN ('active', 'suspended')", name="check_app_users_status"),
        sa.ForeignKeyConstraint(["id"], ["auth.users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("index_app_users_lower_email", "app_users", [sa.text("lower(email)")], unique=True)

    # Supabase's Data API reaches every table in public, and anyone holding the public anon key can call it.
    # RLS with no policies lets nobody through that way. FastAPI connects as the table's owner, so RLS doesn't apply to it
    op.execute("ALTER TABLE app_users ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("index_app_users_lower_email", table_name="app_users")
    op.drop_table("app_users")
