from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.user import User
from app.core.security import verify_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    user = (
        db.query(User)
        .filter(User.id == int(payload["sub"]))
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user

def require_admin(
    current_user: User = Depends(get_current_user),
):
    if current_user.role.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user


def require_teacher(
    current_user: User = Depends(get_current_user),
):
    if current_user.role.lower() not in [
        "teacher",
        "admin",
    ]:
        raise HTTPException(
            status_code=403,
            detail="Teacher access required",
        )

    return current_user


def require_student(
    current_user: User = Depends(get_current_user),
):
    if current_user.role.lower() != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required",
        )

    return current_user