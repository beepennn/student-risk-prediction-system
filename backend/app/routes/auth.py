from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database.connection import SessionLocal
from app.schemas.auth import TokenResponse
from app.services.auth_service import login_user
from app.core.dependencies import get_current_user
from app.models.user import User
from app.auth.roles import require_admin
from app.auth.jwt_handler import (
    verify_token,
    create_access_token,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    token = login_user(
        db,
        form_data.username,
        form_data.password,
    )

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return token


@router.post("/refresh")
def refresh_access_token(
    refresh_token: str,
):
    payload = verify_token(refresh_token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=401,
            detail="Refresh token required",
        )

    new_access_token = create_access_token(
        {
            "sub": payload["sub"],
            "role": payload["role"],
        }
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


@router.get("/me")
def current_user(
    user: User = Depends(get_current_user),
):
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
    }


@router.get("/admin-test")
def admin_test(
    user: User = Depends(require_admin),
):
    return {
        "message": "Admin access granted",
        "email": user.email,
        "role": user.role,
    }