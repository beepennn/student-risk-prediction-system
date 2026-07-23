from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.schemas.recommendation import RecommendationCreate
from app.models.prediction import Prediction


def get_recommendations(db: Session):
    return db.query(Recommendation).all()


def get_recommendation(
    db: Session,
    recommendation_id: int,
):
    recommendation = (
        db.query(Recommendation)
        .filter(Recommendation.id == recommendation_id)
        .first()
    )

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail="Recommendation not found.",
        )

    return recommendation


def create_recommendation(
    db: Session,
    recommendation: RecommendationCreate,
):
    db_recommendation = Recommendation(
        **recommendation.model_dump()
    )

    db.add(db_recommendation)
    db.commit()
    db.refresh(db_recommendation)

    return db_recommendation


def generate_recommendation(
    db: Session,
    prediction,
):
    if prediction.risk_level == "High":
        title = "Immediate Intervention Required"
        description = (
            "Schedule counseling sessions and assign a mentor immediately."
        )
        priority = "High"

    elif prediction.risk_level == "Medium":
        title = "Academic Monitoring Required"
        description = (
            "Monitor academic performance weekly and provide additional support."
        )
        priority = "Medium"

    else:
        title = "Maintain Good Performance"
        description = (
            "Continue regular monitoring and encourage consistent performance."
        )
        priority = "Low"

    recommendation = Recommendation(
        prediction_id=prediction.id,
        title=title,
        description=description,
        priority=priority,
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return recommendation

def get_latest_recommendation(
    db: Session,
    prediction_id: int,
):
    return (
        db.query(Recommendation)
        .filter(
            Recommendation.prediction_id == prediction_id
        )
        .order_by(
            Recommendation.id.desc()
        )
        .first()
    )

def get_student_recommendations(
    db: Session,
    student_id: int,
):
    return (
        db.query(Recommendation)
        .join(Prediction)
        .filter(
            Prediction.student_id == student_id
        )
        .order_by(
            Recommendation.id.desc()
        )
        .all()
    )