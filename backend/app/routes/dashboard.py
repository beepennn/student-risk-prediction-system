from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.core.dependencies import require_teacher
from app.models.user import User
from app.services.dashboard_service import get_teacher_dashboard

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/teacher")
def teacher_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_teacher_dashboard(db)