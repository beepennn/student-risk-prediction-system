from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal

from app.core.dependencies import require_teacher
from app.models.user import User

from app.schemas.teacher import StudentProfileResponse
from app.services.teacher_service import (
    get_student_profile,
    get_teacher_dashboard,
    get_teacher_interventions,
    search_students,
    get_teacher_analytics,
    get_teacher_students,
)

from app.services.intervention_service import (
    create_teacher_intervention,
)

from app.schemas.intervention import (
    TeacherInterventionRequest,
)

router = APIRouter(
    prefix="/teacher",
    tags=["Teacher"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/students/{student_id}/profile",
    response_model=StudentProfileResponse,
)
def read_student_profile(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_student_profile(
        db,
        student_id,
    )

@router.get("/dashboard")
def read_teacher_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_teacher_dashboard(
        db=db,
        teacher_id=current_user.id,
    )

@router.get("/interventions")
def read_teacher_interventions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_teacher_interventions(
        db,
        current_user.id,
    )

@router.post("/students/{student_id}/intervene")
def intervene_student(
    student_id: int,
    request: TeacherInterventionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return create_teacher_intervention(
        db=db,
        teacher_id=current_user.id,
        student_id=student_id,
        action_taken=request.action_taken,
        remarks=request.remarks,
    )

@router.get("/students")
def teacher_students(
    risk_level: str | None = None,
    semester: int | None = None,
    department: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_teacher_students(
        db=db,
        risk_level=risk_level,
        semester=semester,
        department=department,
        skip=skip,
        limit=limit,
    )

@router.get("/students/search")
def search_student(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return search_students(
        db,
        q,
    )

@router.get("/analytics")
def teacher_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_teacher_analytics(
        db,
        current_user.id,
    )