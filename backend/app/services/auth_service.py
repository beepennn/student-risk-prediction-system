from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import verify_password
from app.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
)


def login_user(
    db: Session,
    email: str,
    password: str,
):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    payload = {
        "sub": str(user.id),
        "role": user.role,
    }

    access_token = create_access_token(payload)

    refresh_token = create_refresh_token(payload)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }