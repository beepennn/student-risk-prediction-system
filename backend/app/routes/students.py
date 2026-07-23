from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.core.dependencies import (
    require_teacher,
    require_admin,
    get_current_user,
)

from app.models.user import User
from app.schemas.student import (
    StudentCreate,
    StudentResponse,
)

from app.services.student_service import (
    get_students,
    get_student,
    create_student,
    get_student_by_user_id,
    get_student_dashboard,
    get_student_analytics,
    update_student,
    delete_student,
)

from app.services.prediction_service import (
    get_student_predictions,
)

from app.services.recommendation_service import (
    get_student_recommendations,
)

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[StudentResponse])
def read_students(
    skip: int = 0,
    limit: int = 10,
    search: str | None = None,
    semester: int | None = None,
    department: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_students(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        semester=semester,
        department=department,
    )


@router.get("/me", response_model=StudentResponse)
def get_my_profile(
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

    return student


@router.get("/me/dashboard")
def get_my_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_student_dashboard(
        db,
        current_user.id,
    )


@router.get("/me/analytics")
def get_my_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_student_analytics(
        db,
        current_user.id,
    )


@router.get("/{student_id}", response_model=StudentResponse)
def read_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_student(
        db,
        student_id,
    )


@router.post("/", response_model=StudentResponse)
def add_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_student(
        db=db,
        student=student,
        admin_id=current_user.id,
    )


@router.put("/{student_id}")
def edit_student(
    student_id: int,
    updated_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return update_student(
        db=db,
        student_id=student_id,
        updated_data=updated_data,
        admin_id=current_user.id,
    )


@router.delete("/{student_id}")
def remove_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return delete_student(
        db=db,
        student_id=student_id,
        admin_id=current_user.id,
    )


@router.get("/me/predictions")
def get_my_predictions(
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

    return get_student_predictions(
        db,
        student.id,
    )


@router.get("/me/recommendations")
def get_my_recommendations(
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
    return get_student_recommendations(
        db,
        student.id,
    )