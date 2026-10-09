"""change user_id to native uuid

Revision ID: bd2136b8cc01
Revises: e9e003b20838
Create Date: 2026-10-08 20:11:49.949328

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bd2136b8cc01'
down_revision: Union[str, Sequence[str], None] = 'e9e003b20838'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
   # 1. Update any existing test rows with invalid text to a valid UUID string first
    op.execute("UPDATE doctor_card SET user_id = '00000000-0000-0000-0000-000000000001' WHERE user_id = 'test-user-id' OR user_id IS NULL")

    # 2. Alter the column with explicit cast USING user_id::uuid
    op.execute("ALTER TABLE doctor_card ALTER COLUMN user_id TYPE UUID USING user_id::uuid")

    # 3. Set not null
    op.alter_column('doctor_card', 'user_id', nullable=False)

def downgrade() -> None:
   op.execute("ALTER TABLE doctor_card ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::text")
