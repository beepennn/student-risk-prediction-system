from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.schemas.auth import TokenResponse
from fastapi.security import OAuth2PasswordRequestForm

from app.services.auth_service import login_user
from app.core.dependencies import get_current_user
from app.models.user import User
from app.auth.roles import require_admin

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