"""Authentication router - simple JWT-based auth."""

import hashlib
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings
from app.models import SignupRequest, LoginRequest, AuthResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

# In-memory user store (replace with DB in production)
_users: dict[str, dict] = {}


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to extract and validate the current user from JWT."""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        if user_id not in _users:
            raise HTTPException(status_code=401, detail="User not found")
        return _users[user_id]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    # Check if email already exists
    for user in _users.values():
        if user["email"] == req.email:
            raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": req.name,
        "email": req.email,
        "password_hash": _hash_password(req.password),
        "role": req.role.value,
    }
    _users[user_id] = user

    token = _create_token(user_id)
    return AuthResponse(
        token=token,
        user=UserOut(id=user_id, name=req.name, email=req.email, role=req.role),
    )


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    password_hash = _hash_password(req.password)
    for user in _users.values():
        if user["email"] == req.email and user["password_hash"] == password_hash:
            token = _create_token(user["id"])
            return AuthResponse(
                token=token,
                user=UserOut(
                    id=user["id"],
                    name=user["name"],
                    email=user["email"],
                    role=user["role"],
                ),
            )
    raise HTTPException(status_code=401, detail="Invalid email or password")


@router.get("/me", response_model=UserOut)
async def get_me(user: dict = Depends(get_current_user)):
    return UserOut(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
    )
