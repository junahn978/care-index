import jwt
from uuid import UUID
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.app.config import SUPABASE_URL, ALLOWED_EMAILS

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

def get_current_user_id(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> UUID: 
    payload = verify_access_token(creds.credentials)

    # a valid token isn't enough, the email it was issued to must be on the allowlist.
    # Every route gets the user through here, so this protects all of them
    email = (payload.get("email") or "").lower()
    if email not in ALLOWED_EMAILS:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authorized")

    return UUID(payload["sub"])
