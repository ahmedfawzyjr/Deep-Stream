from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr

from app.db.postgres import get_db_session
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db_session)):
    # Check if user already exists
    stmt = select(User).where(User.email == user_data.email)
    res = await db.execute(stmt)
    existing_user = res.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, hashed_password=hashed_pw, role="user")
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    access = create_access_token(new_user.id)
    refresh = create_refresh_token(new_user.id)

    return TokenResponse(access_token=access, refresh_token=refresh)

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db_session)):
    stmt = select(User).where(User.email == user_data.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)

    return TokenResponse(access_token=access, refresh_token=refresh)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_req: RefreshRequest):
    try:
        payload = decode_token(refresh_req.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type")
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid claims")

        access = create_access_token(user_id)
        refresh = create_refresh_token(user_id)

        return TokenResponse(access_token=access, refresh_token=refresh)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
