from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import (
    get_users,
    get_user,
    create_user,
    update_user,
    set_user_status,
    delete_user,
)

from app.core.dependencies import require_admin
from app.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[UserResponse])
def read_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_users(db)


@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_user(db, user_id)

@router.post("/", response_model=UserResponse)
def add_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_user(
        db,
        user,
        current_user.id,
    )


@router.put("/{user_id}")
def edit_user(
    user_id: int,
    updated_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return update_user(
        db,
        user_id,
        updated_data,
        current_user.id,
    )


@router.patch("/{user_id}/status")
def change_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return set_user_status(
        db,
        user_id,
        is_active,
    )


@router.delete("/{user_id}")
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return delete_user(
        db,
        user_id,
        current_user.id,
    )
