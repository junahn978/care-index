from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import CheckConstraint, func, DateTime, String, ForeignKey
from datetime import datetime
from typing import Optional

class Base(DeclarativeBase):
    pass

class AddressMixin:
    street_address_1: Mapped[str] = mapped_column(String(150))
    street_address_2: Mapped[Optional[str]] = mapped_column(String(150))
    city: Mapped[str] = mapped_column(String(100))
    state_province: Mapped[str] = mapped_column(String(50))
    zip_code: Mapped[Optional[str]] = mapped_column(String(20))
    country: Mapped[str] = mapped_column(String(50))

class DoctorCards(Base, AddressMixin):
    __tablename__ = "doctor_cards"

    __table_args__ = (
        #Checking the string attributes of DoctorCarrds are not empty after trimming whitespace
        CheckConstraint("char_length(trim(doctor_name)) >= 1", name="check_doctor_name_not_empty"),
        CheckConstraint("char_length(trim(clinic_name)) >= 1",name= "check_clinic_name_not_empty"),
        CheckConstraint("char_length(trim(phone)) >= 1",name= "check_phone_not_empty"),
        CheckConstraint("char_length(trim(website)) >= 1",name= "check_website_not_empty"), 
        CheckConstraint("char_length(trim(notes)) >= 1",name= "check_notes_not_empty"),
        
        # Checking the AddressMixin attributes of DoctorCards are not empty after trimming whitespace
        CheckConstraint("char_length(trim(street_address_1)) >= 1", name= "check_street_address_1_not_empty"),
        CheckConstraint("char_length(trim(street_address_2)) >= 1", name= "check_street_address_2_not_empty"), 
        CheckConstraint("char_length(trim(city)) >= 1", name= "check_city_not_empty"),  
        CheckConstraint("char_length(trim(state_province)) >= 1", name= "check_state_province_not_empty"),
        CheckConstraint("char_length(trim(zip_code)) >= 1", name= "check_zip_code_not_empty"),
        CheckConstraint("char_length(trim(country)) >= 1", name= "check_country_not_empty")
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[Optional[str]] = mapped_column(String(36))
    doctor_name: Mapped[str] = mapped_column(String(100))
    clinic_name: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(32))
    website: Mapped[Optional[str]] = mapped_column(String(255))
    notes: Mapped[Optional[str]] = mapped_column(String(1000))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    # this only works for update requests handled by SQLAlchemy, not for direct SQL updates
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )