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
):
    return get_predictions(db)


@router.get("/{prediction_id}", response_model=PredictionResponse)
def read_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
):
    return get_prediction(db, prediction_id)


@router.post("/", response_model=PredictionResponse)
def add_prediction(
    prediction: PredictionCreate,
    db: Session = Depends(get_db),
):
    return create_prediction(db, prediction)

@router.post("/generate/{student_id}")
def generate_prediction(
    student_id: int,
):
    """
    Temporary ML endpoint.

    Later this will fetch academic data from database
    and send it to the trained ML model.
    """

    dummy_student = {
        "attendance": 90,
        "internal_marks": 42,
        "assignment_score": 18,
        "quiz_score": 9,
        "previous_gpa": 3.6,
    }

    prediction = predict_student_risk(dummy_student)

    return {
        "student_id": student_id,
        **prediction,
    }