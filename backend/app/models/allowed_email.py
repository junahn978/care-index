from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import CheckConstraint, DateTime, String, func
from datetime import datetime
from typing import Optional
from backend.app.models.base import Base

# the Allowlist: emails permitted to become Members
class AllowedEmail(Base):
    __tablename__ = "allowed_emails"

    __table_args__ = (
        # stored lowercased, so a plain lookup on the primary key is case-insensitive
        CheckConstraint("email = lower(email)", name="check_allowed_emails_lowercase"),
    )

    email: Mapped[str] = mapped_column(String(254), primary_key=True)
    note: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )
