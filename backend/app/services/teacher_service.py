from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.academic_record import AcademicRecord
from app.models.prediction import Prediction
from app.models.intervention import Intervention

from app.services.prediction_service import get_latest_prediction
from app.services.recommendation_service import get_latest_recommendation


def get_student_profile(
    db: Session,
    student_id: int,
):
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

    academic_records = (
        db.query(AcademicRecord)
        .filter(
            AcademicRecord.student_id == student_id
        )
        .order_by(
            AcademicRecord.semester.desc()
        )
        .all()
    )

    latest_prediction = get_latest_prediction(
        db,
        student_id,
    )

    latest_recommendation = None

    if latest_prediction:
        latest_recommendation = get_latest_recommendation(
            db,
            latest_prediction.id,
        )

    interventions = (
        db.query(Intervention)
        .filter(
            Intervention.student_id == student_id
        )
        .order_by(
            Intervention.id.desc()
        )
        .all()
    )

    return {
        "student": student,
        "academic_records": academic_records,
        "latest_prediction": latest_prediction,
        "latest_recommendation": latest_recommendation,
        "interventions": interventions,
    }


def get_teacher_dashboard(
    db: Session,
    teacher_id: int,
):
    total_students = db.query(Student).count()

    high_risk = (
        db.query(Prediction)
        .filter(
            Prediction.risk_level == "High"
        )
        .count()
    )

    medium_risk = (
        db.query(Prediction)
        .filter(
            Prediction.risk_level == "Medium"
        )
        .count()
    )

    low_risk = (
        db.query(Prediction)
        .filter(
            Prediction.risk_level == "Low"
        )
        .count()
    )

    total_interventions = (
        db.query(Intervention)
        .filter(
            Intervention.teacher_id == teacher_id
        )
        .count()
    )

    recent_interventions = (
        db.query(Intervention)
        .filter(
            Intervention.teacher_id == teacher_id
        )
        .order_by(
            Intervention.id.desc()
        )
        .limit(5)
        .all()
    )

    return {
        "total_students": total_students,
        "high_risk_students": high_risk,
        "medium_risk_students": medium_risk,
        "low_risk_students": low_risk,
        "total_interventions": total_interventions,
        "recent_interventions": recent_interventions,
    }

def get_teacher_interventions(
    db: Session,
    teacher_id: int,
):
    interventions = (
        db.query(Intervention, Student)
        .join(
            Student,
            Intervention.student_id == Student.id,
        )
        .filter(
            Intervention.teacher_id == teacher_id
        )
        .order_by(
            Intervention.id.desc()
        )
        .all()
    )

    results = []

    for intervention, student in interventions:
        results.append(
            {
                "id": intervention.id,
                "student_id": student.id,
                "student_name": student.user.full_name,
                "action_taken": intervention.action_taken,
                "remarks": intervention.remarks,
            }
        )

    return results