from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.services.student_service import (
    create_student,
    get_students,
    get_student_by_id,
    update_student,
    delete_student,
)

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


@router.post("/", response_model=StudentResponse)
def create_new_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
):
    return create_student(db, student)


@router.get("/", response_model=list[StudentResponse])
def read_students(
    db: Session = Depends(get_db),
):
    return get_students(db)


@router.get("/{student_id}", response_model=StudentResponse)
def read_student(
    student_id: int,
    db: Session = Depends(get_db),
):
    return get_student_by_id(db, student_id)


@router.put("/{student_id}", response_model=StudentResponse)
def update_existing_student(
    student_id: int,
    student: StudentUpdate,
    db: Session = Depends(get_db),
):
    return update_student(db, student_id, student)


@router.delete("/{student_id}")
def remove_student(
    student_id: int,
    db: Session = Depends(get_db),
):
    return delete_student(db, student_id)