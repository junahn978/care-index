import enum
from sqlalchemy import CheckConstraint, Enum, String, ForeignKey, Index
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Gender(enum.Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint("age >= 1 AND age <= 150", name="check_age_range"),
        Index("index_users_last_first_name", "last_name", "first_name")
    )

    # supabase auth alraedy creates unique id when user authenticates (auth.users.id)
    id: Mapped[str] = mapped_column(ForeignKey("auth.users.id"), primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False)
    age: Mapped[int] = mapped_column(nullable=False)
    gender: Mapped[Gender] = mapped_column(
        Enum(
            Gender, 
            name="gender_type",
            values_callable=lambda e: [m.value for m in e]
        )
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
