from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import CheckConstraint, func


class Base(DeclarativeBase):
    pass

class AddressMixin:
    street_address_1: Mapped[str] = mapped_column(String(150))
    street_address_2: Mapped[str] = mapped_column(String(150))
    city: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(50))
    zip_code: Mapped[str] = mapped_column(String(20))
    country: Mapped[str] = mapped_column(String(50))

class DoctorCards(Base, Address):
    __tablename__ = "doctor_cards"

    __table_args__ = (
        #Checking the string attributes of DoctorCarrds are not empty after trimming whitespace
        CheckConstraint(
            func.char_length(func.trim(doctor_name)) >= 1,name= "check_doctor_name_not_empty"
        ),

        CheckConstraint(
            func.char_length(func.trim(clinic_name)) >= 1,name= "check_clinic_name_not_empty"
        ),

        CheckConstraint(
            func.char_length(func.trim(phone)) >= 1,name= "check_phone_not_empty"
        ),

        CheckConstraint(
            func.char_length(func.trim(website)) >= 1,name= "check_website_not_empty"
        ),  

        CheckConstraint(
            func.char_length(func.trim(notes)) >= 1,name= "check_notes_not_empty"
        ),
        
        # Checking the AddressMixin attributes of DoctorCards are not empty after trimming whitespace
        CheckConstraint(
            func.char_length(func.trim(street_address_1)) >= 1, name= "check_street_address_1_not_empty"
        ), 

        CheckConstraint(
            func.char_length(func.trim(street_address_2)) >= 1, name= "check_street_address_2_not_empty"
        ), 

        CheckConstraint(
            func.char_length(func.trim(city)) >= 1, name= "check_city_not_empty"
        ),  

        CheckConstraint(
            func.char_length(func.trim(state)) >= 1, name= "check_state_not_empty"
        ),

        CheckConstraint(
            func.char_length(func.trim(zip_code)) >= 1, name= "check_zip_code_not_empty"
        ),

        CheckConstraint(
            func.char_length(func.trim(country)) >= 1, name= "check_country_not_empty"
        )
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("auth.user.id"))
    #doctor_name: Mapped[str] = mapped_column(String(100), nullable=False)
    #clinic_name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(32))
    website: Mapped[str] = mapped_column(String(255))
    notes: Mapped[str] = mapped_column(String(1000))
    created_at: Mapped[str]
    updated_at: Mapped[str]