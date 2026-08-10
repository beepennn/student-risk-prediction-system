from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.database.connection import (
    SessionLocal,
)

from app.schemas.academic_record import (
    AcademicRecordCreate,
    AcademicRecordResponse,
    CurriculumSubjectResponse,
)

from app.services.academic_service import (
    create_academic_record,
    get_academic_record,
    get_academic_records,
    get_curriculum_for_department,
    get_latest_academic_record,
    update_academic_record,
)

from app.services.student_service import (
    get_student_by_user_id,
)

from app.core.dependencies import (
    get_current_user,
    require_teacher,
)

from app.models.user import User


router = APIRouter(
    prefix="/academic-records",
    tags=["Academic Records"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


@router.get(
    "/",
    response_model=list[
        AcademicRecordResponse
    ],
)
def read_academic_records(
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_teacher
    ),
):
    return get_academic_records(
        db
    )


@router.get(
    "/me",
    response_model=(
        AcademicRecordResponse
    ),
)
def get_my_academic_record(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    student = (
        get_student_by_user_id(
            db,
            current_user.id,
        )
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Student profile "
                "not found."
            ),
        )

    return get_latest_academic_record(
        db,
        student.id,
    )


# IMPORTANT:
# Keep this route ABOVE /{record_id}.
@router.get(
    "/curriculum/subjects",
    response_model=list[
        CurriculumSubjectResponse
    ],
)
def read_curriculum_subjects(
    department: str = Query(...),
    semester: int = Query(
        ...,
        ge=1,
        le=8,
    ),
    current_user: User = Depends(
        require_teacher
    ),
):
    return (
        get_curriculum_for_department(
            department,
            semester,
        )
    )


@router.get(
    "/{record_id}",
    response_model=(
        AcademicRecordResponse
    ),
)
def read_academic_record(
    record_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_teacher
    ),
):
    return get_academic_record(
        db,
        record_id,
    )


@router.post(
    "/",
    response_model=(
        AcademicRecordResponse
    ),
)
def add_academic_record(
    academic_record:
        AcademicRecordCreate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        require_teacher
    ),
):
    return create_academic_record(
        db,
        academic_record,
    )


@router.put(
    "/{record_id}",
    response_model=(
        AcademicRecordResponse
    ),
)
def edit_academic_record(
    record_id: int,

    academic_record:
        AcademicRecordCreate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        require_teacher
    ),
):
    return update_academic_record(
        db=db,

        record_id=record_id,

        academic_record=(
            academic_record
        ),
    )