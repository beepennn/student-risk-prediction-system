from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.student import Student
from app.models.prediction import Prediction
from app.models.intervention import Intervention


def get_dashboard_summary(db: Session):
    total_students = db.query(Student).count()

    latest_predictions = (
        db.query(Prediction)
        .filter(
            Prediction.id.in_(
                db.query(func.max(Prediction.id))
                .group_by(Prediction.student_id)
            )
        )
        .all()
    )

    high_risk = 0
    medium_risk = 0
    low_risk = 0

    for prediction in latest_predictions:
        if prediction.risk_level == "High":
            high_risk += 1

        elif prediction.risk_level == "Medium":
            medium_risk += 1

        elif prediction.risk_level == "Low":
            low_risk += 1

    return {
        "total_students": total_students,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
    }

def get_high_risk_students(db: Session):
    latest_predictions = (
        db.query(Prediction)
        .filter(
            Prediction.id.in_(
                db.query(func.max(Prediction.id))
                .group_by(Prediction.student_id)
            )
        )
        .filter(Prediction.risk_level == "High")
        .all()
    )

    result = []

    for prediction in latest_predictions:
        student = prediction.student

        result.append(
            {
                "student_id": student.id,
                "full_name": student.user.full_name,
                "roll_number": student.roll_number,
                "department": student.department,
                "semester": student.semester,
                "risk_level": prediction.risk_level,
            }
        )

    return result

def get_students_by_department(db: Session):
    departments = (
        db.query(
            Student.department,
            func.count(Student.id)
        )
        .group_by(Student.department)
        .all()
    )

    result = {}

    for department, count in departments:
        result[department] = count

    return result

def get_students_by_semester(db: Session):
    semesters = (
        db.query(
            Student.semester,
            func.count(Student.id)
        )
        .group_by(Student.semester)
        .order_by(Student.semester)
        .all()
    )

    result = {}

    for semester, count in semesters:
        result[semester] = count

    return result

def get_medium_risk_students(db: Session):
    latest_predictions = (
        db.query(Prediction)
        .filter(
            Prediction.id.in_(
                db.query(func.max(Prediction.id))
                .group_by(Prediction.student_id)
            )
        )
        .filter(Prediction.risk_level == "Medium")
        .all()
    )

    result = []

    for prediction in latest_predictions:
        student = prediction.student

        result.append(
            {
                "student_id": student.id,
                "full_name": student.user.full_name,
                "roll_number": student.roll_number,
                "department": student.department,
                "semester": student.semester,
                "risk_level": prediction.risk_level,
            }
        )

    return result

def get_low_risk_students(db: Session):
    latest_predictions = (
        db.query(Prediction)
        .filter(
            Prediction.id.in_(
                db.query(func.max(Prediction.id))
                .group_by(Prediction.student_id)
            )
        )
        .filter(Prediction.risk_level == "Low")
        .all()
    )

    result = []

    for prediction in latest_predictions:
        student = prediction.student

        result.append(
            {
                "student_id": student.id,
                "full_name": student.user.full_name,
                "roll_number": student.roll_number,
                "department": student.department,
                "semester": student.semester,
                "risk_level": prediction.risk_level,
            }
        )

    return result

def get_latest_predictions(db: Session):
    latest_predictions = (
        db.query(Prediction)
        .filter(
            Prediction.id.in_(
                db.query(func.max(Prediction.id))
                .group_by(Prediction.student_id)
            )
        )
        .all()
    )

    result = []

    for prediction in latest_predictions:
        student = prediction.student

        result.append(
            {
                "student_id": student.id,
                "full_name": student.user.full_name,
                "roll_number": student.roll_number,
                "risk_level": prediction.risk_level,
                "high_probability": prediction.high_probability,
                "prediction_date": prediction.prediction_date,
            }
        )

    return result

def get_intervention_summary(db: Session):
    total_interventions = db.query(Intervention).count()

    return {
        "total_interventions": total_interventions
    }