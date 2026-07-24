from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.prediction import Prediction
from app.models.intervention import Intervention
from app.models.user import User
from app.models.notification import Notification
from app.models.recommendation import Recommendation

def get_department_statistics(db: Session):
    departments = (
        db.query(Student.department)
        .distinct()
        .all()
    )

    results = []

    for (department,) in departments:

        students = (
            db.query(Student)
            .filter(Student.department == department)
            .all()
        )

        student_ids = [student.id for student in students]

        latest_predictions = []

        for student_id in student_ids:
            prediction = (
                db.query(Prediction)
                .filter(Prediction.student_id == student_id)
                .order_by(Prediction.id.desc())
                .first()
            )

            if prediction:
                latest_predictions.append(prediction)

        results.append(
            {
                "department": department,
                "total_students": len(students),
                "high_risk": sum(
                    1
                    for prediction in latest_predictions
                    if prediction.risk_level == "High"
                ),
                "medium_risk": sum(
                    1
                    for prediction in latest_predictions
                    if prediction.risk_level == "Medium"
                ),
                "low_risk": sum(
                    1
                    for prediction in latest_predictions
                    if prediction.risk_level == "Low"
                ),
            }
        )

    return results

def get_semester_statistics(db: Session):
    semesters = (
        db.query(Student.semester)
        .distinct()
        .order_by(Student.semester)
        .all()
    )

    results = []

    for (semester,) in semesters:

        students = (
            db.query(Student)
            .filter(Student.semester == semester)
            .all()
        )

        latest_predictions = []

        for student in students:
            prediction = (
                db.query(Prediction)
                .filter(Prediction.student_id == student.id)
                .order_by(Prediction.id.desc())
                .first()
            )

            if prediction:
                latest_predictions.append(prediction)

        results.append(
            {
                "semester": semester,
                "total_students": len(students),
                "high_risk": sum(
                    1
                    for prediction in latest_predictions
                    if prediction.risk_level == "High"
                ),
                "medium_risk": sum(
                    1
                    for prediction in latest_predictions
                    if prediction.risk_level == "Medium"
                ),
                "low_risk": sum(
                    1
                    for prediction in latest_predictions
                    if prediction.risk_level == "Low"
                ),
            }
        )

    return results

def get_teacher_statistics(db: Session):

    teachers = (
        db.query(User)
        .filter(User.role == "Teacher")
        .all()
    )

    results = []

    for teacher in teachers:

        interventions = (
            db.query(Intervention)
            .filter(
                Intervention.teacher_id == teacher.id
            )
            .all()
        )

        unique_students = {
            intervention.student_id
            for intervention in interventions
        }

        results.append(
            {
                "teacher_id": teacher.id,
                "teacher_name": teacher.full_name,
                "email": teacher.email,
                "total_interventions": len(interventions),
                "students_handled": len(unique_students),
            }
        )

    return results

def get_risk_trend(db: Session):

    students = db.query(Student).all()

    latest_predictions = []

    for student in students:
        prediction = (
            db.query(Prediction)
            .filter(
                Prediction.student_id == student.id
            )
            .order_by(
                Prediction.id.desc()
            )
            .first()
        )

        if prediction:
            latest_predictions.append(prediction)

    total = len(latest_predictions)

    high = sum(
        1
        for prediction in latest_predictions
        if prediction.risk_level == "High"
    )

    medium = sum(
        1
        for prediction in latest_predictions
        if prediction.risk_level == "Medium"
    )

    low = sum(
        1
        for prediction in latest_predictions
        if prediction.risk_level == "Low"
    )

    return {
        "total_predictions": total,
        "high_risk_percentage": round(high / total * 100, 2) if total else 0,
        "medium_risk_percentage": round(medium / total * 100, 2) if total else 0,
        "low_risk_percentage": round(low / total * 100, 2) if total else 0,
    }

def get_system_activity(db: Session):

    return {
        "total_students": db.query(Student).count(),
        "total_predictions": db.query(Prediction).count(),
        "total_recommendations": db.query(Recommendation).count(),
        "total_notifications": db.query(Notification).count(),
        "total_interventions": db.query(Intervention).count(),
    }

def get_admin_dashboard_summary(db: Session):
    """
    Complete Admin Dashboard Summary
    """

    # -----------------------------
    # Basic counts
    # -----------------------------

    total_students = db.query(Student).count()

    total_teachers = (
        db.query(User)
        .filter(User.role == "Teacher")
        .count()
    )

    total_predictions = db.query(Prediction).count()

    total_recommendations = (
        db.query(Recommendation).count()
    )

    total_notifications = (
        db.query(Notification).count()
    )

    total_interventions = (
        db.query(Intervention).count()
    )

    # -----------------------------
    # Latest prediction of every student
    # -----------------------------

    students = db.query(Student).all()

    latest_predictions = []

    for student in students:

        prediction = (
            db.query(Prediction)
            .filter(
                Prediction.student_id == student.id
            )
            .order_by(
                Prediction.id.desc()
            )
            .first()
        )

        if prediction:
            latest_predictions.append(prediction)

    high = sum(
        1
        for prediction in latest_predictions
        if prediction.risk_level == "High"
    )

    medium = sum(
        1
        for prediction in latest_predictions
        if prediction.risk_level == "Medium"
    )

    low = sum(
        1
        for prediction in latest_predictions
        if prediction.risk_level == "Low"
    )

    # -----------------------------
    # Reuse existing functions
    # -----------------------------

    department_summary = get_department_statistics(db)

    semester_summary = get_semester_statistics(db)

    teacher_summary = get_teacher_statistics(db)

    # -----------------------------
    # Recent activity
    # -----------------------------

    latest_prediction = (
        db.query(Prediction)
        .order_by(
            Prediction.prediction_date.desc()
        )
        .first()
    )

    latest_intervention = (
        db.query(Intervention)
        .order_by(
            Intervention.intervention_date.desc()
        )
        .first()
    )

    return {

        "summary": {

            "total_students": total_students,

            "total_teachers": total_teachers,

            "total_predictions": total_predictions,

            "total_recommendations": total_recommendations,

            "total_notifications": total_notifications,

            "total_interventions": total_interventions,

        },

        "risk_distribution": {

            "high": high,

            "medium": medium,

            "low": low,

        },

        "department_summary": department_summary,

        "semester_summary": semester_summary,

        "teacher_summary": teacher_summary,

        "recent_activity": {

            "latest_prediction": (
                {
                    "student_id": latest_prediction.student_id,
                    "risk_level": latest_prediction.risk_level,
                    "date": latest_prediction.prediction_date,
                }
                if latest_prediction
                else None
            ),

            "latest_intervention": (
                {
                    "student_id": latest_intervention.student_id,
                    "teacher_id": latest_intervention.teacher_id,
                    "date": latest_intervention.intervention_date,
                }
                if latest_intervention
                else None
            ),

        },
    }