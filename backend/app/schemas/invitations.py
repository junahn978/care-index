from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from backend.app.models.invitation import AccessLevel

# every Invitation status, the same values as the CHECK constraint on invitations. Expired isn't one: it's a pending
# Invitation whose expires_at has passed
InvitationStatus = Literal["pending", "accepted", "cancelled"]

# the status the Owner sees in the list: the stored ones, plus expired for a pending Invitation whose 7 days are up
ShownInvitationStatus = Literal["pending", "expired", "accepted", "cancelled"]

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

# the fields every Invitation response has. There's no token_hash field, so neither the token nor its hash
# can be returned, even by mistake
class InvitationResponseBase(BaseModel):
    id: int
    owner_id: UUID
    invited_email: str
    access_level: AccessLevel
    expires_at: datetime
    created_at: datetime
    accepted_at: datetime | None
    cancelled_at: datetime | None

    model_config = ConfigDict(from_attributes=True)

# schema for the Invitation that Send (POST /invitations), Resend and Cancel answer with. Its status is the stored one:
# pending after a Send or a Resend, cancelled after a Cancel
class InvitationResponse(InvitationResponseBase):
    status: InvitationStatus

# schema for each Invitation GET /invitations lists. Its status is the one the Owner sees, so it can be expired
class InvitationListItem(InvitationResponseBase):
    status: ShownInvitationStatus

# schema for POST /invitations/accept: the token from the emailed link
class InvitationAccept(BaseModel):
    # refuses values of the wrong type, like the other request schemas, and strips surrounding whitespace, which a
    # token never has
    model_config = ConfigDict(str_strip_whitespace=True, strict=True)

    # any text: a made-up or cut-short token gets the same 404 "Invalid or expired invitation" as an expired one,
    # which is what the person should read, rather than a 422
    token: str

# schema for what POST /invitations/accept answers with: whose Doctor Cards the new Delegation covers, and at which
# Access Level, for the page that confirms it
class InvitationAcceptResponse(BaseModel):
    owner_email: str
    access_level: AccessLevel
