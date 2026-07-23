from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.core.dependencies import require_admin
from app.models.user import User

from app.services.admin_service import (
    get_department_statistics,
    get_semester_statistics,
    get_teacher_statistics,
    get_risk_trend,
    get_system_activity,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard/departments")
def department_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_department_statistics(db)

@router.get("/dashboard/semesters")
def semester_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_semester_statistics(db)

@router.get("/dashboard/teachers")
def teacher_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_teacher_statistics(db)

@router.get("/dashboard/risk-trend")
def risk_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_risk_trend(db)

@router.get("/dashboard/system-activity")
def system_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_system_activity(db)