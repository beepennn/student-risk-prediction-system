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

from app.schemas.dashboard import (
    DashboardSummaryResponse,
    InterventionSummaryResponse,
    DepartmentSummaryResponse,
    SemesterSummaryResponse,
    LatestPredictionResponse,
)

from app.core.dependencies import require_teacher
from app.models.user import User

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


@router.get(
    "/dashboard-summary",
    response_model=DashboardSummaryResponse,
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_dashboard_summary(db)

@router.get("/high-risk-students")
def high_risk_students(
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "prediction_date",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_high_risk_students(
        db=db,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )

@router.get(
    "/students-by-department",
    response_model=list[DepartmentSummaryResponse],
)
def students_by_department(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_students_by_department(db)

@router.get(
    "/students-by-semester",
    response_model=list[SemesterSummaryResponse],
)
def students_by_semester(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_students_by_semester(db)

@router.get("/medium-risk-students")
def medium_risk_students(
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "prediction_date",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_medium_risk_students(
        db=db,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )

@router.get("/low-risk-students")
def low_risk_students(
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "prediction_date",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_low_risk_students(
        db=db,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )

@router.get(
    "/latest-predictions",
    response_model=list[LatestPredictionResponse],
)
def latest_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_latest_predictions(db)

@router.get(
    "/intervention-summary",
    response_model=InterventionSummaryResponse,
)
def intervention_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_intervention_summary(db)