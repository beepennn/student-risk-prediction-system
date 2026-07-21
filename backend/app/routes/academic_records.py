from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.schemas.academic_record import (
    AcademicRecordCreate,
    AcademicRecordResponse,
)
from app.services.academic_service import (
    get_academic_records,
    get_academic_record,
    create_academic_record,
)

from app.core.dependencies import require_teacher
from app.models.user import User

router = APIRouter(
    prefix="/academic-records",
    tags=["Academic Records"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[AcademicRecordResponse])
def read_academic_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_academic_records(db)


@router.get("/{record_id}", response_model=AcademicRecordResponse)
def read_academic_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_academic_record(db, record_id)


@router.post("/", response_model=AcademicRecordResponse)
def add_academic_record(
    academic_record: AcademicRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return create_academic_record(db, academic_record)