from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import CheckConstraint, func


class Base(DeclarativeBase):
    pass

class Address():
    street_address_1: Mapped[str] = mapped_column(String(150))
    street_address_2: Mapped[str] = mapped_column(String(150))
    city: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(50))
    zip_code: Mapped[str] = mapped_column(String(20))
    country: Mapped[str] = mapped_column(String(50))

class DoctorCards(Base):
    __tablename__ = "doctor_cards"

    __table_args__ = (
        CheckConstraint(
            func.char_length(func.trim(doctor_name)) >= 1,
            name= "check_doctor_name_not_empty"
            )
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey=("auth.user.id"))
    doctor_name: Mapped[str] = mapped_column(String(100), nullable=False)
    clinic_name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(32))
    address: Mapped[str] = 
    website: Mapped[str]
    notes: Mapped[str]
    created_at: Mapped[str]
    updated_at: Mapped[str]