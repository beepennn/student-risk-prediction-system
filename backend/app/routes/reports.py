from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.services.report_service import get_dashboard_summary
from app.services.report_service import get_high_risk_students
from app.services.report_service import get_students_by_department
from app.services.report_service import get_students_by_semester
from app.services.report_service import get_medium_risk_students
from app.services.report_service import get_low_risk_students
from app.services.report_service import get_latest_predictions
from app.services.report_service import get_intervention_summary

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard-summary")
def dashboard_summary(
    db: Session = Depends(get_db),
):
    return get_dashboard_summary(db)

@router.get("/high-risk-students")
def high_risk_students(
    db: Session = Depends(get_db),
):
    return get_high_risk_students(db)

@router.get("/students-by-department")
def students_by_department(
    db: Session = Depends(get_db),
):
    return get_students_by_department(db)

@router.get("/students-by-semester")
def students_by_semester(
    db: Session = Depends(get_db),
):
    return get_students_by_semester(db)

@router.get("/medium-risk-students")
def medium_risk_students(
    db: Session = Depends(get_db),
):
    return get_medium_risk_students(db)

@router.get("/low-risk-students")
def low_risk_students(
    db: Session = Depends(get_db),
):
    return get_low_risk_students(db)

@router.get("/latest-predictions")
def latest_predictions(
    db: Session = Depends(get_db),
):
    return get_latest_predictions(db)

@router.get("/intervention-summary")
def intervention_summary(
    db: Session = Depends(get_db),
):
    return get_intervention_summary(db)