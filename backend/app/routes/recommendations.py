from fastapi import APIRouter, Depends, HTTPException
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
    get_latest_recommendation,
)

from app.services.student_service import (
    get_student_by_user_id,
)

from app.services.prediction_service import (
    get_latest_prediction,
)

from app.core.dependencies import (
    require_teacher,
    get_current_user,
)

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

@router.get(
    "/me",
    response_model=RecommendationResponse,
)
def get_my_recommendation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = get_student_by_user_id(
        db,
        current_user.id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found.",
        )

    prediction = get_latest_prediction(
        db,
        student.id,
    )

    if prediction is None:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found.",
        )

    recommendation = get_latest_recommendation(
        db,
        prediction.id,
    )

    return recommendation

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