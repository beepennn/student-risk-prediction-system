from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.schemas.prediction import (
    PredictionCreate,
    PredictionResponse,
)
from app.services.prediction_service import (
    get_predictions,
    get_prediction,
    create_prediction,
)
from app.services.ml_service import predict_student_risk
from app.database.connection import SessionLocal
from app.services.academic_service import get_latest_academic_record
from app.services.prediction_service import save_prediction
from app.services.recommendation_service import generate_recommendation
from app.services.notification_service import generate_notification

from app.core.dependencies import require_teacher
from app.models.user import User

router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[PredictionResponse])
def read_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_predictions(db)


@router.get("/{prediction_id}", response_model=PredictionResponse)
def read_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_prediction(db, prediction_id)


@router.post("/", response_model=PredictionResponse)
def add_prediction(
    prediction: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return create_prediction(db, prediction)

@router.post("/generate/{student_id}")
def generate_prediction(
    student_id: int,
    current_user: User = Depends(require_teacher),
):
    db = SessionLocal()

    try:
        academic = get_latest_academic_record(db, student_id)

        if academic is None:
            return {
                "error": "No academic record found for this student."
            }

        student_features = {
            "attendance": academic.attendance,
            "internal_marks": academic.internal_marks,
            "assignment_score": academic.assignment_score,
            "quiz_score": academic.quiz_score,
            "previous_gpa": academic.previous_gpa,
        }

        prediction = predict_student_risk(student_features)

        saved_prediction = save_prediction(
            db,
            student_id,
            prediction,
        )
        recommendation = generate_recommendation(
            db,
            saved_prediction,
        )
        generate_notification(
            db,
            student_id,
            recommendation,
        )

        return saved_prediction

    finally:
        db.close()