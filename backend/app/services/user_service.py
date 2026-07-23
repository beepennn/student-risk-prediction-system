from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password
from app.services.audit_service import create_audit_log


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
    admin_id: int,
):
    user_data = user.model_dump()

    user_data["password_hash"] = hash_password(
        user.password_hash
    )

    db_user = User(**user_data)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="CREATE",
        entity="User",
        entity_id=db_user.id,
    )

    return db_user


def update_user(
    db: Session,
    user_id: int,
    updated_data: dict,
    admin_id: int,
):
    db_user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if "password_hash" in updated_data:
        updated_data["password_hash"] = hash_password(
            updated_data["password_hash"]
        )

    for key, value in updated_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="UPDATE",
        entity="User",
        entity_id=db_user.id,
    )

    return db_user


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
    admin_id: int,
):
    db_user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    deleted_id = db_user.id

    db.delete(db_user)
    db.commit()

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="DELETE",
        entity="User",
        entity_id=deleted_id,
    )

    return {
        "message": "User deleted successfully."
    }
