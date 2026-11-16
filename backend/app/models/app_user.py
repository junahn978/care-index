from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Uuid, func, text
from datetime import datetime
import uuid
from backend.app.models.base import Base

class AppUser(Base):
    __tablename__ = "app_users"

    __table_args__ = (
        # emails compare case-insensitively, so uniqueness is on lower(email), not email
        Index("index_app_users_lower_email", text("lower(email)"), unique=True),
    )

    # same value as auth.users.id and the token's sub, so it has to be a uuid too.
    # Deleting the Supabase sign-in record deletes this row with it.
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        primary_key=True
    )
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    # set directly in the database, never through the app (ADR 0007)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    # set by an Admin. A Suspended person gets 403 on every route (ADR 0007)
    is_suspended: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )
