from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.schemas.recommendation import RecommendationCreate


def get_recommendations(db: Session):
    return db.query(Recommendation).all()


def get_recommendation(db: Session, recommendation_id: int):
    return (
        db.query(Recommendation)
        .filter(Recommendation.id == recommendation_id)
        .first()
    )


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