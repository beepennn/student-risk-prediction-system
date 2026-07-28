from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    OAuth2PasswordRequestForm,
)

from sqlalchemy.orm import Session

from app.database.connection import (
    SessionLocal,
)

from app.schemas.auth import (
    ForgotPasswordRequest,
    GenericMessageResponse,
    PasswordResetTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
)

from app.services.auth_service import (
    login_user,
    request_password_reset,
    reset_user_password,
    validate_password_reset_token,
)

from app.core.dependencies import (
    get_current_user,
)

from app.models.user import User

from app.auth.roles import (
    require_admin,
)

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
        db=db,
        email=form_data.username,
        password=form_data.password,
    )

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Invalid email or password, "
                "or the account is inactive."
            ),
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    return token

@router.post(
    "/forgot-password",
    response_model=(
        GenericMessageResponse
    ),
)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    request_password_reset(
        db=db,
        email=request.email,
    )

    return {
        "message": (
            "If an active account exists for "
            "that email address, a password "
            "reset link has been sent."
        )
    }


@router.post(
    "/validate-reset-token",
    response_model=(
        GenericMessageResponse
    ),
)
def validate_reset_token(
    request: PasswordResetTokenRequest,
    db: Session = Depends(get_db),
):
    validate_password_reset_token(
        db=db,
        token=request.token,
    )

    return {
        "message": (
            "Password reset link is valid."
        )
    }


@router.post(
    "/reset-password",
    response_model=(
        GenericMessageResponse
    ),
)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    reset_user_password(
        db=db,
        token=request.token,
        new_password=(
            request.new_password
        ),
    )

    return {
        "message": (
            "Your password has been reset "
            "successfully. You can now log in."
        )
    }


@router.post("/refresh")
def refresh_access_token(
    refresh_token: str,
):
    payload = verify_token(
        refresh_token
    )

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required.",
        )

    new_access_token = (
        create_access_token(
            {
                "sub": payload["sub"],
                "role": payload["role"],
            }
        )
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


@router.get("/me")
def current_user(
    user: User = Depends(
        get_current_user
    ),
):
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }


@router.get("/admin-test")
def admin_test(
    user: User = Depends(
        require_admin
    ),
):
    return {
        "message": (
            "Admin access granted"
        ),
        "email": user.email,
        "role": user.role,
    }