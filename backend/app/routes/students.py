from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.core.dependencies import require_teacher
from app.models.user import User
from app.schemas.student import StudentCreate, StudentResponse
from app.services.student_service import (
    get_students,
    get_student,
    create_student,
)

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[StudentResponse])
def read_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_students(db)


@router.get("/{student_id}", response_model=StudentResponse)
def read_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_student(db, student_id)

@router.post("/", response_model=StudentResponse)
def add_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return create_student(db, student)