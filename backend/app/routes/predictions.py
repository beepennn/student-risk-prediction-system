from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.database.connection import SessionLocal

from app.schemas.prediction import (
    PredictionCreate,
    PredictionResponse,
)

from app.services.prediction_service import (
    get_predictions,
    get_prediction,
    create_prediction,
    get_latest_prediction,
    get_admin_predictions,
    delete_prediction,
    generate_prediction_for_student,
)

from app.core.dependencies import (
    require_teacher,
    require_admin,
    get_current_user,
)

from app.services.student_service import (
    get_student_by_user_id,
)

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


@router.get(
    "/",
    response_model=list[PredictionResponse],
)
def read_predictions(
    skip: int = 0,
    limit: int = 20,
    risk_level: str | None = None,
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_predictions(
        db=db,
        skip=skip,
        limit=limit,
        risk_level=risk_level,
        sort_order=sort_order,
    )


@router.get(
    "/me",
    response_model=PredictionResponse,
)
def get_my_prediction(
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

    return prediction


@router.get("/admin")
def admin_predictions(
    risk_level: str | None = None,
    semester: int | None = None,
    department: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_admin_predictions(
        db=db,
        risk_level=risk_level,
        semester=semester,
        department=department,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{prediction_id}",
    response_model=PredictionResponse,
)
def read_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_prediction(
        db,
        prediction_id,
    )


@router.post(
    "/",
    response_model=PredictionResponse,
)
def add_prediction(
    prediction: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return create_prediction(
        db,
        prediction,
    )


@router.delete("/{prediction_id}")
def remove_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return delete_prediction(
        db=db,
        prediction_id=prediction_id,
        admin_id=current_user.id,
    )


@router.post(
    "/generate/{student_id}",
    response_model=PredictionResponse,
)
def generate_prediction(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return generate_prediction_for_student(
        db=db,
        student_id=student_id,
    )