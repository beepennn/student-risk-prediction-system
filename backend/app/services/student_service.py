from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.user import User
from app.schemas.student import StudentCreate

from app.models.academic_record import AcademicRecord

from app.services.prediction_service import get_latest_prediction
from app.services.recommendation_service import get_latest_recommendation
from app.services.notification_service import get_student_notifications
from app.services.audit_service import create_audit_log


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
                    User.full_name.ilike(f"%{search}%"),
                    Student.roll_number.ilike(f"%{search}%"),
                )
            )
        )

    if semester is not None:
        query = query.filter(
            Student.semester == semester
        )

    if department:
        query = query.filter(
            Student.department.ilike(f"%{department}%")
        )

    return (
        query.offset(skip)
        .limit(limit)
        .all()
    )


def get_student(db: Session, student_id: int):
    student = (
        db.query(Student)
        .filter(Student.id == student_id)
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
        .filter(Student.id == student_id)
        .first()
    )

    if db_student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    for key, value in updated_data.items():
        setattr(db_student, key, value)

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
        .filter(Student.id == student_id)
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

    return {
        "message": "Student deleted successfully."
    }

def get_student_by_user_id(
    db: Session,
    user_id: int,
):
    return (
        db.query(Student)
        .filter(Student.user_id == user_id)
        .first()
    )

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
            detail="Student profile not found.",
        )

    latest_record = (
        db.query(AcademicRecord)
        .filter(
            AcademicRecord.student_id == student.id
        )
        .order_by(
            AcademicRecord.semester.desc()
        )
        .first()
    )

    latest_prediction = get_latest_prediction(
        db,
        student.id,
    )

    latest_recommendation = None

    if latest_prediction:
        latest_recommendation = get_latest_recommendation(
            db,
            latest_prediction.id,
        )

    notifications = get_student_notifications(
        db,
        student.id,
    )

    unread_notifications = sum(
        1
        for notification in notifications
        if not notification.is_read
    )

    return {
        "student": {
            "id": student.id,
            "full_name": ( student.user.full_name if student.user else None ),
            "roll_number": student.roll_number,
            "department": student.department,
            "semester": student.semester,
        },

        "latest_prediction": (
            {
                "risk_level": latest_prediction.risk_level,
                "prediction_date": latest_prediction.prediction_date.isoformat(),
                "low_probability": latest_prediction.low_probability,
                "medium_probability": latest_prediction.medium_probability,
                "high_probability": latest_prediction.high_probability,
            }
            if latest_prediction
            else None
        ),

        "latest_recommendation": (
            {
                "priority": latest_recommendation.priority,
                "recommendation_text": latest_recommendation.recommendation_text,
            }
            if latest_recommendation
            else None
        ),

        "academic_summary": {
            "attendance": latest_record.attendance if latest_record else None,
            "internal_marks": latest_record.internal_marks if latest_record else None,
            "assignment_score": latest_record.assignment_score if latest_record else None,
            "quiz_score": latest_record.quiz_score if latest_record else None,
            "previous_gpa": latest_record.previous_gpa if latest_record else None,
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
            detail="Student profile not found.",
        )

    academic_history = (
        db.query(AcademicRecord)
        .filter(
            AcademicRecord.student_id == student.id
        )
        .order_by(
            AcademicRecord.semester.asc()
        )
        .all()
    )

    latest_record = (
        academic_history[-1]
        if academic_history
        else None
    )

    latest_prediction = get_latest_prediction(
        db,
        student.id,
    )

    latest_recommendation = None

    if latest_prediction:
        latest_recommendation = (
            get_latest_recommendation(
                db,
                latest_prediction.id,
            )
        )

    notifications = get_student_notifications(
        db,
        student.id,
    )

    return {
        "latest": {
            "attendance": (
                latest_record.attendance
                if latest_record
                else None
            ),
            "internal_marks": (
                latest_record.internal_marks
                if latest_record
                else None
            ),
            "assignment_score": (
                latest_record.assignment_score
                if latest_record
                else None
            ),
            "quiz_score": (
                latest_record.quiz_score
                if latest_record
                else None
            ),
            "previous_gpa": (
                latest_record.previous_gpa
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
            "total_notifications": len(notifications),
        },

        "history": [
            {
                "semester": record.semester,
                "attendance": record.attendance,
                "internal_marks": record.internal_marks,
                "assignment_score": record.assignment_score,
                "quiz_score": record.quiz_score,
                "previous_gpa": record.previous_gpa,
            }
            for record in academic_history
        ],
    }