from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate


def create_student(db: Session, student: StudentCreate):
    # Check if roll number already exists
    existing_student = (
        db.query(Student)
        .filter(Student.roll_number == student.roll_number)
        .first()
    )

    if existing_student:
        raise HTTPException(
            status_code=400,
            detail="Student with this roll number already exists."
        )

    db_student = Student(**student.model_dump())

    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    return db_student


def get_students(db: Session):
    return db.query(Student).all()


def get_student_by_id(db: Session, student_id: int):
    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found."
        )

    return student


def update_student(
    db: Session,
    student_id: int,
    student_update: StudentUpdate,
):
    student = get_student_by_id(db, student_id)

    update_data = student_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)

    return student


def delete_student(db: Session, student_id: int):
    student = get_student_by_id(db, student_id)

    db.delete(student)
    db.commit()

    return {
        "message": "Student deleted successfully."
    }