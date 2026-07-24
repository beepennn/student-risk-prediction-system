from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal

from app.core.dependencies import require_admin
from app.models.user import User

from app.services.analytics_service import (
    get_dashboard_summary,
    get_risk_distribution,
    get_prediction_trends,
    get_department_risk_distribution,
    get_semester_risk_distribution,
    get_recent_predictions,
    get_notification_statistics,
    get_notification_trends,
    get_intervention_statistics,
    get_intervention_trends,
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_dashboard_summary(db)


@router.get("/risk-distribution")
def risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_risk_distribution(db)


@router.get("/prediction-trends")
def prediction_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_prediction_trends(db)


@router.get("/department-risk-distribution")
def department_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_department_risk_distribution(db)


@router.get("/semester-risk-distribution")
def semester_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_semester_risk_distribution(db)


@router.get("/recent-predictions")
def recent_predictions(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_recent_predictions(
        db,
        limit,
    )


@router.get("/notification-statistics")
def notification_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_notification_statistics(db)


@router.get("/notification-trends")
def notification_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_notification_trends(db)

@router.get("/intervention-statistics")
def intervention_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_intervention_statistics(db)


@router.get("/intervention-trends")
def intervention_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_intervention_trends(db)