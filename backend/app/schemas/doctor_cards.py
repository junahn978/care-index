from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

#schema for doctor-Cards base share field
class DoctorCardBase(BaseModel):
    #strips all white space and strict type checking
    model_config = ConfigDict(str_strip_whitespace=True, strict=True)

    doctor_name: str = Field(min_length=1, max_length=100)
    clinic_name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=32)
    website: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None, max_length=1000)

    #address fields
    street_address_1: str = Field(min_length=1, max_length=150)
    street_address_2: Optional[str] = Field(None, max_length=150)
    city: str = Field(min_length=1, max_length=100)
    state_province: str = Field(min_length=1, max_length=50)
    zip_code: Optional[str] = Field(None, max_length=20)
    country: str = Field(min_length=1, max_length=50)

#schema for POST (creating new card)
class DoctorCardCreate(DoctorCardBase):
    pass

#schema for PATCH (updating exsisting card), all fields are optional
class DoctorCardUpdate(DoctorCardBase):
    doctor_name: Optional[str] = Field(None, min_length=1, max_length=100)
    street_address_1: Optional[str] = Field(min_length=1, max_length=150)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state_province: Optional[str] = Field(None, min_length=1, max_length=50)
    country: Optional[str] = Field(None, min_length=1, max_length=50)

#schema for output response
class DoctorCardResponse(DoctorCardBase):
    pass