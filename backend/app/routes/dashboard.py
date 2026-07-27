from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal

from app.core.dependencies import (
    require_teacher,
    get_current_user,
)

from app.models.user import User

from app.services.dashboard_service import (
    get_teacher_dashboard,
    get_student_dashboard,
    get_dashboard_summary,
)

from app.services.student_service import (
    get_student_by_user_id,
)

from app.schemas.dashboard import (
    StudentDashboardResponse,
    StudentInfo,
    PredictionInfo,
    RecommendationInfo,
    AcademicSummary,
    NotificationSummary,
)

from app.schemas.dashboard_summary import (
    DashboardSummaryResponse,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_dashboard_summary(db)

@router.get("/teacher")
def teacher_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_teacher_dashboard(db)

@router.get(
    "/student",
    response_model=StudentDashboardResponse,
)
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = get_student_by_user_id(
        db,
        current_user.id,
    )

    dashboard = get_student_dashboard(
        db,
        student.id,
    )

    prediction = dashboard["prediction"]
    recommendation = dashboard["recommendation"]
    academic = dashboard["academic"]
    notifications = dashboard["notifications"]

    return StudentDashboardResponse(

        student=StudentInfo(
            id=dashboard["student"].id,
            full_name=dashboard["student"].user.full_name,
            roll_number=dashboard["student"].roll_number,
            department=dashboard["student"].department,
            semester=dashboard["student"].semester,
        ),

        latest_prediction=(
            PredictionInfo(
                risk_level=prediction.risk_level,
                prediction_date=str(
                    prediction.prediction_date
                ),
                low_probability=prediction.low_probability,
                medium_probability=prediction.medium_probability,
                high_probability=prediction.high_probability,
            )
            if prediction
            else None
        ),

        latest_recommendation=(
            RecommendationInfo(
                priority=recommendation.priority,
                recommendation_text=recommendation.description,
            )
            if recommendation
            else None
        ),

        academic_summary=(
            AcademicSummary(
                attendance=academic.attendance,
                internal_marks=academic.internal_marks,
                assignment_score=academic.assignment_score,
                quiz_score=academic.quiz_score,
                previous_gpa=academic.previous_gpa,
            )
            if academic
            else None
        ),

        notifications=NotificationSummary(
            total=len(notifications),
            unread=sum(
                1
                for n in notifications
                if not n.is_read
            ),
        ),
    )