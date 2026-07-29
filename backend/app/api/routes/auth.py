from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import create_token, get_current_user, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/auth")


class Credentials(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    token: str
    email: str


class MeResponse(BaseModel):
    email: str


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(credentials: Credentials, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    if len(credentials.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")
    email = credentials.email.lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(email=email, password_hash=hash_password(credentials.password))
    db.add(user)
    db.commit()
    return TokenResponse(token=create_token(user.id), email=user.email)


@router.post("/login", response_model=TokenResponse)
def login(credentials: Credentials, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == credentials.email.lower()))
    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    return TokenResponse(token=create_token(user.id), email=user.email)


@router.get("/me", response_model=MeResponse)
def me(user: Annotated[User, Depends(get_current_user)]) -> MeResponse:
    return MeResponse(email=user.email)
