from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.prediction import Prediction
from app.schemas.prediction import PredictionCreate


def get_predictions(db: Session):
    return db.query(Prediction).all()


def get_prediction(
    db: Session,
    prediction_id: int,
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if prediction is None:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found.",
        )

    return prediction


def create_prediction(
    db: Session,
    prediction: PredictionCreate,
):
    db_prediction = Prediction(
        **prediction.model_dump()
    )

    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    return db_prediction


def save_prediction(
    db: Session,
    student_id: int,
    prediction_data: dict,
):
    prediction = Prediction(
        student_id=student_id,
        risk_level=prediction_data["risk_level"],
        low_probability=prediction_data["low_probability"],
        medium_probability=prediction_data["medium_probability"],
        high_probability=prediction_data["high_probability"],
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction

def get_latest_prediction(
    db: Session,
    student_id: int,
):
    return (
        db.query(Prediction)
        .filter(Prediction.student_id == student_id)
        .order_by(Prediction.prediction_date.desc())
        .first()
    )

def get_student_predictions(
    db: Session,
    student_id: int,
):
    return (
        db.query(Prediction)
        .filter(
            Prediction.student_id == student_id
        )
        .order_by(
            Prediction.id.desc()
        )
        .all()
    )