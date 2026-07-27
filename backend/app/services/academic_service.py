from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.academic_record import AcademicRecord
from app.models.student import Student
from app.schemas.academic_record import AcademicRecordCreate


def get_academic_records(db: Session):
    return db.query(AcademicRecord).all()


def get_academic_record(
    db: Session,
    record_id: int,
):
    record = (
        db.query(AcademicRecord)
        .filter(AcademicRecord.id == record_id)
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Academic record not found.",
        )

    return record


def create_academic_record(
    db: Session,
    academic_record: AcademicRecordCreate,
):
    student = (
        db.query(Student)
        .filter(Student.id == academic_record.student_id)
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    existing_record = (
        db.query(AcademicRecord)
        .filter(
            AcademicRecord.student_id == academic_record.student_id,
            AcademicRecord.semester == academic_record.semester,
        )
        .first()
    )

    if existing_record:
        raise HTTPException(
            status_code=400,
            detail="Academic record already exists for this semester.",
        )

    db_record = AcademicRecord(
        **academic_record.model_dump()
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return db_record


def get_latest_academic_record(
    db: Session,
    student_id: int,
):
    record = (
        db.query(AcademicRecord)
        .filter(
            AcademicRecord.student_id == student_id
        )
        .order_by(
            AcademicRecord.created_at.desc()
        )
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Academic record not found.",
        )

    return record