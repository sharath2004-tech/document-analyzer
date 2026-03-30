"""Authentication router - JWT-based auth with MongoDB Atlas."""

import hashlib
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings
from app.database import get_db
from app.models import SignupRequest, LoginRequest, AuthResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to extract and validate the current user from JWT."""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        db = get_db()
        user = await db["users"].find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    db = get_db()
    existing = await db["users"].find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": req.name,
        "email": req.email,
        "password_hash": _hash_password(req.password),
        "role": req.role.value,
    }
    await db["users"].insert_one(user)

    token = _create_token(user_id)
    return AuthResponse(
        token=token,
        user=UserOut(id=user_id, name=req.name, email=req.email, role=req.role),
    )


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    db = get_db()
    password_hash = _hash_password(req.password)
    user = await db["users"].find_one(
        {"email": req.email, "password_hash": password_hash}, {"_id": 0}
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

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


@router.get("/me", response_model=UserOut)
async def get_me(user: dict = Depends(get_current_user)):
    return UserOut(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
    )
