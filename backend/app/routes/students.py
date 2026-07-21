from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.core.dependencies import (
    require_teacher,
    get_current_user,
)
from app.models.user import User
from app.schemas.student import StudentCreate, StudentResponse
from app.services.student_service import (
    get_students,
    get_student,
    create_student,
    get_student_by_user_id,
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


@router.get("/me", response_model=StudentResponse)
def get_my_profile(
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

    return student


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