from sqlalchemy.orm import Session

from app.models.academic_record import AcademicRecord
from app.schemas.academic_record import AcademicRecordCreate


def get_academic_records(db: Session):
    return db.query(AcademicRecord).all()


def get_academic_record(db: Session, record_id: int):
    return (
        db.query(AcademicRecord)
        .filter(AcademicRecord.id == record_id)
        .first()
    )


def create_academic_record(
    db: Session,
    academic_record: AcademicRecordCreate,
):
    db_record = AcademicRecord(**academic_record.model_dump())

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return db_record