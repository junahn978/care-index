from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from backend.app.services.email import AccessLevel

# schema for POST /invitations: the email to invite, and the Access Level the Delegation would have
class InvitationCreate(BaseModel):
    # strips surrounding whitespace and refuses values of the wrong type, like the Doctor Card schemas
    model_config = ConfigDict(str_strip_whitespace=True, strict=True)

    # must be shaped like an email address, so a malformed one gets a 422 here instead of a failed send. Nothing is
    # looked up, but special-use domains such as .test and .local are refused too
    email: EmailStr
    access_level: AccessLevel

    # lowercased, like the signed-in emails it's compared with. The invitations table refuses anything else
    @field_validator("email")
    @classmethod
    def lowercase(cls, value: str) -> str:
        return value.lower()

# schema for the Invitation in responses. It has no token_hash field, so neither the token nor its hash
# can be returned, even by mistake
class InvitationResponse(BaseModel):
    id: int
    owner_id: UUID
    invited_email: str
    access_level: AccessLevel
    status: str
    expires_at: datetime
    created_at: datetime
    accepted_at: datetime | None
    cancelled_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
