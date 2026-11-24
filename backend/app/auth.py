import jwt
from dataclasses import dataclass
from uuid import UUID
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.app.config import SUPABASE_URL
from backend.app.db import get_db
from backend.app.services.allowed_email import is_email_allowed
from backend.app.services.app_user import get_or_create_app_user

SUPABASE_ISSUER = f"{SUPABASE_URL}/auth/v1"

jwks_client = jwt.PyJWKClient(f"{SUPABASE_ISSUER}/.well-known/jwks.json")
bearer = HTTPBearer()

def verify_access_token(token: str):
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token, 
            signing_key.key, 
            algorithms=["ES256"], 
            audience="authenticated", 
            issuer=SUPABASE_ISSUER, 
            options={"require": ["exp", "iss", "aud", "sub"]}, 
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token expired")

    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

# the signed-in person, as routes (and later can()) see them.
# Frozen and separate from the AppUser row, so a route can't flip is_admin by assigning to it and committing
@dataclass(frozen=True)
class CurrentUser:
    id: UUID
    email: str
    # their full name from the sign-in token, or None if they have none. Shown to other people, such as in an
    # Invitation email, and always next to their email, since they can set it to anything
    full_name: str | None
    is_admin: bool
    is_suspended: bool
    is_allowlisted: bool

# the full name in the token's user_metadata (from Google, or the sign-up form) with its whitespace tidied, or None
# when it's missing or blank. The person can set user_metadata to anything, so a full name that isn't text counts
# as missing, and it's only ever shown to people, never used to decide access
def full_name_from(payload: dict) -> str | None:
    full_name = (payload.get("user_metadata") or {}).get("full_name")
    tidied = " ".join(full_name.split()) if isinstance(full_name, str) else ""
    return tidied or None

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> CurrentUser:
    payload = verify_access_token(creds.credentials)

    # the token's email, not app_users.email: the token is what Supabase just vouched for.
    # Looked up on every request and never stored, so removing an email from allowed_emails takes effect on the next request
    email = (payload.get("email") or "").lower()
    is_allowlisted = is_email_allowed(db, email)

    # a valid token isn't enough, the email it was issued to must be in the allowed_emails table.
    # Every route gets the user through here, so this protects all of them.
    # 403, not 401: the user is signed in, just not allowed, and the frontend shows "access denied" for it.
    # Both 403s here carry a stable code, so the frontend can tell them apart without matching the message text
    if not is_allowlisted:
        raise HTTPException(status.HTTP_403_FORBIDDEN, {"code": "not_on_allowlist", "message": "Not authorized"})

    # FastAPI never sees the sign-in itself, so the first request after it creates the app_users row.
    # get_db is cached per request, so this is the same session the route gets
    user_id = UUID(payload["sub"])
    app_user = get_or_create_app_user(db, user_id, email)

    # checked here, before any route runs, so no route can forget it (ADR 0007)
    if app_user.is_suspended:
        raise HTTPException(status.HTTP_403_FORBIDDEN, {"code": "account_suspended", "message": "Account suspended"})

    return CurrentUser(
        id=user_id,
        email=email,
        full_name=full_name_from(payload),
        is_admin=app_user.is_admin,
        is_suspended=app_user.is_suspended,
        is_allowlisted=is_allowlisted,
    )
