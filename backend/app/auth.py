import jwt
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.app.config import SUPABASE_URL

allowable_list = ["junahn45@gmail.com"]
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
    return UUID(payload["sub"])
