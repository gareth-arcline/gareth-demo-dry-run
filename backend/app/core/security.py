import jwt
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from functools import lru_cache
from .config import settings
from ..models.user import CurrentUser

security = HTTPBearer()

@lru_cache(maxsize=1)
def get_jwks():
    """Fetch Microsoft's public keys for token validation."""
    jwks_url = f"https://login.microsoftonline.com/{settings.AZURE_TENANT_ID}/discovery/v2.0/keys"
    try:
        response = httpx.get(jwks_url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch Azure AD keys: {str(e)}"
        )

def get_public_key(token: str):
    """Get the public key for the token's key ID."""
    jwks = get_jwks()
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")

    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to find appropriate key"
    )

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> CurrentUser:
    """Validate JWT token and return current user."""
    token = credentials.credentials

    try:
        public_key = get_public_key(token)
        # Accept both the client ID and api:// URI as valid audiences
        valid_audiences = [
            settings.AZURE_CLIENT_ID,
            f"api://{settings.AZURE_CLIENT_ID}",
        ]
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=valid_audiences,
            issuer=f"https://sts.windows.net/{settings.AZURE_TENANT_ID}/"
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    # Check group membership if ALLOWED_GROUPS is configured
    if settings.allowed_groups_list:
        user_groups = payload.get("groups", [])
        if not any(g in settings.allowed_groups_list for g in user_groups):
            raise HTTPException(status_code=403, detail="Access denied")

    return CurrentUser(
        oid=payload.get("oid", ""),
        name=payload.get("name", ""),
        email=payload.get("preferred_username", ""),
        groups=payload.get("groups", [])
    )
