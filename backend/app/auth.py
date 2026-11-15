import jwt
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

def get_current_user_id(creds: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> UUID:
    payload = verify_access_token(creds.credentials)

    # a valid token isn't enough, the email it was issued to must be in the allowed_emails table.
    # Every route gets the user through here, so this protects all of them.
    # 403, not 401: the user is signed in, just not allowed, and the frontend shows "access denied" for it
    email = (payload.get("email") or "").lower()
    if not is_email_allowed(db, email):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorized")

    # FastAPI never sees the sign-in itself, so the first request after it creates the app_users row.
    # get_db is cached per request, so this is the same session the route gets
    user_id = UUID(payload["sub"])
    get_or_create_app_user(db, user_id, email)

    return user_id
