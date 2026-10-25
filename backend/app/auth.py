import os
import jwt
from fastapi import HTTPException
from fastapi.security import HTTPBearer

allowable_list = ["junahn45@gmail.com"]

SUPABASE_URL = os.getenv("SUPABASE_URL")
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

# browser sends the access toeken (JWT) in the header, decode using PyJWT and at minimum, verify the following information:
#   "iss, aud, exp, signature, then read sub"
#   additionally, we will also need to check if the email is listed in our allowable_list of emails allowed to sign up


# our API server will:
    # check signature/exp/aud via JWKS (no DB call)
    # Owner/Share authorization
#(token near expiry) Browser ──refresh token──▶ Supabase ──▶ new JWT + new refresh token

