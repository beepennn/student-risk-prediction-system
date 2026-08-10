from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_user,
)

from app.database.connection import (
    SessionLocal,
)

from app.models.user import User

from app.schemas.report import (
    DepartmentReportResponse,
    InterventionReportResponse,
    LatestPredictionReportResponse,
    ReportDashboardSummaryResponse,
    RiskStudentReportResponse,
    SemesterReportResponse,
)

from app.services.report_service import (
    get_dashboard_summary,
    get_high_risk_students,
    get_intervention_summary,
    get_latest_predictions,
    get_low_risk_students,
    get_medium_risk_students,
    get_students_by_department,
    get_students_by_semester,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def require_report_access(
    current_user: User = Depends(
        get_current_user
    ),
):
    role = str(
        current_user.role
    ).strip().lower()

    if role not in {
        "admin",
        "teacher",
    }:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail=(
                "Only Admin and Teacher "
                "accounts can view reports."
            ),
        )

    return current_user


@router.get(
    "/dashboard-summary",
    response_model=ReportDashboardSummaryResponse,
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_report_access
    ),
):
    return get_dashboard_summary(db)


@router.get(
    "/high-risk-students",
    response_model=list[
        RiskStudentReportResponse
    ],
)
def high_risk_students(
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "prediction_date",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_report_access
    ),
):
    return get_high_risk_students(
        db=db,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )


@router.get(
    "/medium-risk-students",
    response_model=list[
        RiskStudentReportResponse
    ],
)
def medium_risk_students(
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "prediction_date",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_report_access
    ),
):
    return get_medium_risk_students(
        db=db,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )


@router.get(
    "/low-risk-students",
    response_model=list[
        RiskStudentReportResponse
    ],
)
def low_risk_students(
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "prediction_date",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_report_access
    ),
):
    return get_low_risk_students(
        db=db,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )


@router.get(
    "/students-by-department",
    response_model=list[
        DepartmentReportResponse
    ],
)
def students_by_department(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_report_access
    ),
):
    return get_students_by_department(
        db
    )


@router.get(
    "/students-by-semester",
    response_model=list[
        SemesterReportResponse
    ],
)
def students_by_semester(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_report_access
    ),
):
    return get_students_by_semester(
        db
    )


@router.get(
    "/latest-predictions",
    response_model=list[
        LatestPredictionReportResponse
    ],
)
def latest_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_report_access
    ),
):
    return get_latest_predictions(db)


@router.get(
    "/intervention-summary",
    response_model=(
        InterventionReportResponse
    ),
)
def intervention_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_report_access
    ),
):
    return get_intervention_summary(
        db
    )
