from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.core.dependencies import require_admin
from app.models.user import User

from app.services.export_service import (
    export_students_csv,
    export_predictions_csv,
    export_interventions_csv,
    export_notifications_csv,
)

router = APIRouter(
    prefix="/export",
    tags=["Export"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/students.csv")
def export_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return export_students_csv(db)


@router.get("/predictions.csv")
def export_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return export_predictions_csv(db)


@router.get("/interventions.csv")
def export_interventions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return export_interventions_csv(db)


@router.get("/notifications.csv")
def export_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return export_notifications_csv(db)