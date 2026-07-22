from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal

from app.core.dependencies import require_teacher
from app.models.user import User

from app.schemas.teacher import StudentProfileResponse
from app.services.teacher_service import (
    get_student_profile,
    get_teacher_dashboard,
    get_teacher_interventions,
)

router = APIRouter(
    prefix="/teacher",
    tags=["Teacher"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/students/{student_id}/profile",
    response_model=StudentProfileResponse,
)
def read_student_profile(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_student_profile(
        db,
        student_id,
    )

@router.get("/dashboard")
def read_teacher_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_teacher_dashboard(
        db=db,
        teacher_id=current_user.id,
    )

@router.get("/interventions")
def read_teacher_interventions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_teacher_interventions(
        db,
        current_user.id,
    )