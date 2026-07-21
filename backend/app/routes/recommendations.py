from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationResponse,
)
from app.services.recommendation_service import (
    get_recommendations,
    get_recommendation,
    create_recommendation,
)

from app.core.dependencies import require_teacher
from app.models.user import User

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[RecommendationResponse])
def read_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_recommendations(db)


@router.get("/{recommendation_id}", response_model=RecommendationResponse)
def read_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_recommendation(db, recommendation_id)


@router.post("/", response_model=RecommendationResponse)
def add_recommendation(
    recommendation: RecommendationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return create_recommendation(db, recommendation)