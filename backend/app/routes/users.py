from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import (
    get_users,
    get_user,
    create_user,
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
def read_user(user_id: int, db: Session = Depends(get_db)):
    return get_user(db, user_id)


@router.post("/", response_model=UserResponse)
def add_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_user(db, user)