from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password


def get_users(db: Session):
    return db.query(User).all()


def get_user(
    db: Session,
    user_id: int,
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return user


def create_user(
    db: Session,
    user: UserCreate,
):
    user_data = user.model_dump()

    user_data["password_hash"] = hash_password(
        user.password_hash
    )

    db_user = User(**user_data)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def update_user(
    db: Session,
    user_id: int,
    updated_data: dict,
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if "password_hash" in updated_data:
        updated_data["password_hash"] = hash_password(
            updated_data["password_hash"]
        )

    for key, value in updated_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)

    return user


def set_user_status(
    db: Session,
    user_id: int,
    is_active: bool,
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return user


def delete_user(
    db: Session,
    user_id: int,
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully."
    }