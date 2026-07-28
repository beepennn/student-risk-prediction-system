from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.user import User
from app.models.academic_record import AcademicRecord

from app.schemas.student import StudentCreate

from app.services.prediction_service import (
    get_latest_prediction,
)

from app.services.recommendation_service import (
    get_latest_recommendation,
)

from app.services.notification_service import (
    get_student_notifications,
)

from app.services.audit_service import (
    create_audit_log,
)

from app.core.api_response import (
    success_response,
)


def get_students(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: str | None = None,
    semester: int | None = None,
    department: str | None = None,
):
    query = db.query(Student)

    if search:
        query = (
            query.join(Student.user)
            .filter(
                or_(
                    User.full_name.ilike(
                        f"%{search}%"
                    ),
                    Student.roll_number.ilike(
                        f"%{search}%"
                    ),
                )
            )
        )

    if semester is not None:
        query = query.filter(
            Student.semester == semester
        )

    if department:
        query = query.filter(
            Student.department.ilike(
                f"%{department}%"
            )
        )

    return (
        query.offset(skip)
        .limit(limit)
        .all()
    )


def get_student(
    db: Session,
    student_id: int,
):
    student = (
        db.query(Student)
        .filter(
            Student.id == student_id
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    return student


def create_student(
    db: Session,
    student: StudentCreate,
    admin_id: int,
):
    db_user = (
        db.query(User)
        .filter(
            User.id == student.user_id
        )
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if str(db_user.role).lower() != "student":
        raise HTTPException(
            status_code=400,
            detail=(
                "The selected user must have "
                "the Student role."
            ),
        )

    if not db_user.is_active:
        raise HTTPException(
            status_code=400,
            detail="The student user account is inactive.",
        )

    existing_profile = (
        db.query(Student)
        .filter(
            Student.user_id == student.user_id
        )
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail=(
                "Student profile already exists "
                "for this user."
            ),
        )

    existing_student = (
        db.query(Student)
        .filter(
            Student.roll_number
            == student.roll_number
        )
        .first()
    )

    if existing_student:
        raise HTTPException(
            status_code=400,
            detail="Roll number already exists.",
        )

    db_student = Student(
        **student.model_dump()
    )

    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="CREATE",
        entity="Student",
        entity_id=db_student.id,
    )

    return db_student


def update_student(
    db: Session,
    student_id: int,
    updated_data: dict,
    admin_id: int,
):
    db_student = (
        db.query(Student)
        .filter(
            Student.id == student_id
        )
        .first()
    )

    if db_student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    allowed_fields = {
        "user_id",
        "roll_number",
        "department",
        "semester",
        "phone",
        "parent_email",
        "enrollment_year",
        "status",
    }

    invalid_fields = [
        field
        for field in updated_data
        if field not in allowed_fields
    ]

    if invalid_fields:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid student fields: "
                f"{invalid_fields}"
            ),
        )

    if (
        "roll_number" in updated_data
        and updated_data["roll_number"]
        != db_student.roll_number
    ):
        existing_student = (
            db.query(Student)
            .filter(
                Student.roll_number
                == updated_data[
                    "roll_number"
                ],
                Student.id != student_id,
            )
            .first()
        )

        if existing_student:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Roll number already exists."
                ),
            )

    if (
        "user_id" in updated_data
        and updated_data["user_id"]
        != db_student.user_id
    ):
        db_user = (
            db.query(User)
            .filter(
                User.id
                == updated_data["user_id"]
            )
            .first()
        )

        if db_user is None:
            raise HTTPException(
                status_code=404,
                detail="User not found.",
            )

        if (
            str(db_user.role).lower()
            != "student"
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "The selected user must "
                    "have the Student role."
                ),
            )

        existing_profile = (
            db.query(Student)
            .filter(
                Student.user_id
                == updated_data["user_id"],
                Student.id != student_id,
            )
            .first()
        )

        if existing_profile:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Student profile already "
                    "exists for this user."
                ),
            )

    for key, value in updated_data.items():
        setattr(
            db_student,
            key,
            value,
        )

    db.commit()
    db.refresh(db_student)

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="UPDATE",
        entity="Student",
        entity_id=db_student.id,
    )

    return db_student


def delete_student(
    db: Session,
    student_id: int,
    admin_id: int,
):
    db_student = (
        db.query(Student)
        .filter(
            Student.id == student_id
        )
        .first()
    )

    if db_student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    deleted_id = db_student.id

    db.delete(db_student)
    db.commit()

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="DELETE",
        entity="Student",
        entity_id=deleted_id,
    )

    return success_response(
        message=(
            "Student deleted successfully."
        )
    )


def get_student_by_user_id(
    db: Session,
    user_id: int,
):
    return (
        db.query(Student)
        .filter(
            Student.user_id == user_id
        )
        .first()
    )


def safe_get_latest_prediction(
    db: Session,
    student_id: int,
):
    try:
        return get_latest_prediction(
            db,
            student_id,
        )
    except HTTPException as error:
        if error.status_code == 404:
            return None

        raise


def safe_get_latest_recommendation(
    db: Session,
    prediction_id: int,
):
    try:
        return get_latest_recommendation(
            db,
            prediction_id,
        )
    except HTTPException as error:
        if error.status_code == 404:
            return None

        raise


def safe_get_notifications(
    db: Session,
    student_id: int,
):
    try:
        notifications = (
            get_student_notifications(
                db,
                student_id,
            )
        )

        return notifications or []

    except HTTPException as error:
        if error.status_code == 404:
            return []

        raise


def get_student_dashboard(
    db: Session,
    user_id: int,
):
    student = get_student_by_user_id(
        db,
        user_id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Student profile not found. "
                "Please contact the administrator."
            ),
        )

    latest_record = (
        db.query(AcademicRecord)
        .filter(
            AcademicRecord.student_id
            == student.id
        )
        .order_by(
            AcademicRecord.semester.desc(),
            AcademicRecord.id.desc(),
        )
        .first()
    )

    latest_prediction = (
        safe_get_latest_prediction(
            db,
            student.id,
        )
    )

    latest_recommendation = None

    if latest_prediction:
        latest_recommendation = (
            safe_get_latest_recommendation(
                db,
                latest_prediction.id,
            )
        )

    notifications = (
        safe_get_notifications(
            db,
            student.id,
        )
    )

    unread_notifications = sum(
        1
        for notification in notifications
        if not notification.is_read
    )

    prediction_date = None

    if (
        latest_prediction
        and latest_prediction.prediction_date
    ):
        prediction_date = (
            latest_prediction
            .prediction_date
            .isoformat()
        )

    return {
        "student": {
            "id": student.id,
            "full_name": (
                student.user.full_name
                if student.user
                else "Student"
            ),
            "roll_number": (
                student.roll_number
            ),
            "department": (
                student.department
            ),
            "semester": (
                student.semester
            ),
        },
        "latest_prediction": (
            {
                "risk_level": (
                    latest_prediction.risk_level
                ),
                "prediction_date": (
                    prediction_date
                ),
                "low_probability": float(
                    latest_prediction
                    .low_probability
                    or 0
                ),
                "medium_probability": float(
                    latest_prediction
                    .medium_probability
                    or 0
                ),
                "high_probability": float(
                    latest_prediction
                    .high_probability
                    or 0
                ),
            }
            if latest_prediction
            else None
        ),
        "latest_recommendation": (
            {
                "priority": (
                    latest_recommendation
                    .priority
                ),
                "recommendation_text": (
                    latest_recommendation
                    .description
                ),
            }
            if latest_recommendation
            else None
        ),
        "academic_summary": {
            "attendance": (
                float(
                    latest_record.attendance
                )
                if latest_record
                else None
            ),
            "internal_marks": (
                float(
                    latest_record.internal_marks
                )
                if latest_record
                else None
            ),
            "assignment_score": (
                float(
                    latest_record
                    .assignment_score
                )
                if latest_record
                else None
            ),
            "quiz_score": (
                float(
                    latest_record.quiz_score
                )
                if latest_record
                else None
            ),
            "previous_gpa": (
                float(
                    latest_record.previous_gpa
                )
                if latest_record
                else None
            ),
        },
        "notifications": {
            "total": len(notifications),
            "unread": unread_notifications,
        },
    }


def get_student_analytics(
    db: Session,
    user_id: int,
):
    student = get_student_by_user_id(
        db,
        user_id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Student profile not found. "
                "Please contact the administrator."
            ),
        )

    academic_history = (
        db.query(AcademicRecord)
        .filter(
            AcademicRecord.student_id
            == student.id
        )
        .order_by(
            AcademicRecord.semester.asc(),
            AcademicRecord.id.asc(),
        )
        .all()
    )

    latest_record = (
        academic_history[-1]
        if academic_history
        else None
    )

    latest_prediction = (
        safe_get_latest_prediction(
            db,
            student.id,
        )
    )

    latest_recommendation = None

    if latest_prediction:
        latest_recommendation = (
            safe_get_latest_recommendation(
                db,
                latest_prediction.id,
            )
        )

    notifications = (
        safe_get_notifications(
            db,
            student.id,
        )
    )

    return {
        "latest": {
            "attendance": (
                float(
                    latest_record.attendance
                )
                if latest_record
                else None
            ),
            "internal_marks": (
                float(
                    latest_record.internal_marks
                )
                if latest_record
                else None
            ),
            "assignment_score": (
                float(
                    latest_record
                    .assignment_score
                )
                if latest_record
                else None
            ),
            "quiz_score": (
                float(
                    latest_record.quiz_score
                )
                if latest_record
                else None
            ),
            "previous_gpa": (
                float(
                    latest_record.previous_gpa
                )
                if latest_record
                else None
            ),
            "risk_level": (
                latest_prediction.risk_level
                if latest_prediction
                else None
            ),
            "recommendation_priority": (
                latest_recommendation.priority
                if latest_recommendation
                else None
            ),
            "total_notifications": (
                len(notifications)
            ),
        },
        "history": [
            {
                "semester": record.semester,
                "attendance": float(
                    record.attendance
                ),
                "internal_marks": float(
                    record.internal_marks
                ),
                "assignment_score": float(
                    record.assignment_score
                ),
                "quiz_score": float(
                    record.quiz_score
                ),
                "previous_gpa": float(
                    record.previous_gpa
                ),
            }
            for record in academic_history
        ],
    }