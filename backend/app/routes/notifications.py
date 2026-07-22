from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
)
from app.services.notification_service import (
    get_notifications,
    get_notification,
    create_notification,
    get_student_notifications,
)

from app.services.student_service import (
    get_student_by_user_id,
)

from app.core.dependencies import (
    require_teacher,
    get_current_user,
)

from app.models.user import User

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[NotificationResponse])
def read_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_notifications(db)

@router.get(
    "/me",
    response_model=list[NotificationResponse],
)
def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = get_student_by_user_id(
        db,
        current_user.id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found.",
        )

    return get_student_notifications(
        db,
        student.id,
    )

@router.get("/{notification_id}", response_model=NotificationResponse)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_notification(db, notification_id)


@router.post("/", response_model=NotificationResponse)
def add_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return create_notification(db, notification)