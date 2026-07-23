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
    get_admin_recommendations,
    update_recommendation,
    delete_recommendation,
)

from app.services.student_service import (
    get_student_by_user_id,
)

from app.services.prediction_service import (
    get_latest_prediction,
)

from app.core.dependencies import (
    require_teacher,
    require_admin,
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


@router.get(
    "/",
    response_model=list[RecommendationResponse],
)
def read_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_recommendations(db)


@router.get("/admin")
def admin_recommendations(
    priority: str | None = None,
    semester: int | None = None,
    department: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_admin_recommendations(
        db=db,
        priority=priority,
        semester=semester,
        department=department,
        skip=skip,
        limit=limit,
    )


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

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail="Recommendation not found.",
        )

    return recommendation


@router.post(
    "/",
    response_model=RecommendationResponse,
)
def add_recommendation(
    recommendation: RecommendationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return create_recommendation(
        db,
        recommendation,
    )


@router.put("/{recommendation_id}")
def edit_recommendation(
    recommendation_id: int,
    recommendation: RecommendationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return update_recommendation(
        db,
        recommendation_id,
        recommendation,
    )


@router.delete("/{recommendation_id}")
def remove_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return delete_recommendation(
        db,
        recommendation_id,
    )


@router.get(
    "/{recommendation_id}",
    response_model=RecommendationResponse,
)
def read_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_recommendation(
        db,
        recommendation_id,
    )