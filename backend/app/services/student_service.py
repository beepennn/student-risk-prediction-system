from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.user import User
from app.schemas.student import StudentCreate


def get_students(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: str | None = None,
    semester: int | None = None,
    department: str | None = None,
):
    query = db.query(Student)

    if search:
        query = (
            query.join(Student.user)
            .filter(
                or_(
                    User.full_name.ilike(f"%{search}%"),
                    Student.roll_number.ilike(f"%{search}%"),
                )
            )
        )

    if semester is not None:
        query = query.filter(
            Student.semester == semester
        )

    if department:
        query = query.filter(
            Student.department.ilike(f"%{department}%")
        )

    return (
        query.offset(skip)
        .limit(limit)
        .all()
    )


def get_student(db: Session, student_id: int):
    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    return student


def create_student(
    db: Session,
    student: StudentCreate,
):
    db_student = Student(
        **student.model_dump()
    )

    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    return db_student


def get_student_by_user_id(
    db: Session,
    user_id: int,
):
    return (
        db.query(Student)
        .filter(Student.user_id == user_id)
        .first()
    )