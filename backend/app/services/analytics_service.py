from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.models.student import Student
from app.models.prediction import Prediction
from app.models.notification import Notification
from app.models.intervention import Intervention


def get_dashboard_summary(db: Session):
    total_students = db.query(Student).count()

    total_predictions = db.query(Prediction).count()

    total_notifications = db.query(Notification).count()

    total_interventions = db.query(Intervention).count()

    high_risk = (
        db.query(Prediction)
        .filter(Prediction.risk_level == "High")
        .count()
    )

    medium_risk = (
        db.query(Prediction)
        .filter(Prediction.risk_level == "Medium")
        .count()
    )

    low_risk = (
        db.query(Prediction)
        .filter(Prediction.risk_level == "Low")
        .count()
    )

    return {
        "total_students": total_students,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "total_predictions": total_predictions,
        "total_notifications": total_notifications,
        "total_interventions": total_interventions,
    }


def get_risk_distribution(db: Session):
    high = (
        db.query(Prediction)
        .filter(Prediction.risk_level == "High")
        .count()
    )

    medium = (
        db.query(Prediction)
        .filter(Prediction.risk_level == "Medium")
        .count()
    )

    low = (
        db.query(Prediction)
        .filter(Prediction.risk_level == "Low")
        .count()
    )

    return [
        {
            "risk_level": "High",
            "count": high,
        },
        {
            "risk_level": "Medium",
            "count": medium,
        },
        {
            "risk_level": "Low",
            "count": low,
        },
    ]


def get_prediction_trends(db: Session):
    results = (
        db.query(
            func.to_char(
                Prediction.prediction_date,
                "YYYY-MM",
            ).label("month"),
            func.count(Prediction.id).label("predictions"),
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    return [
        {
            "month": row.month,
            "predictions": row.predictions,
        }
        for row in results
    ]


def get_department_risk_distribution(db: Session):
    results = (
        db.query(
            Student.department.label("department"),
            func.sum(
                case(
                    (Prediction.risk_level == "High", 1),
                    else_=0,
                )
            ).label("high"),
            func.sum(
                case(
                    (Prediction.risk_level == "Medium", 1),
                    else_=0,
                )
            ).label("medium"),
            func.sum(
                case(
                    (Prediction.risk_level == "Low", 1),
                    else_=0,
                )
            ).label("low"),
        )
        .join(
            Prediction,
            Prediction.student_id == Student.id,
        )
        .group_by(Student.department)
        .order_by(Student.department)
        .all()
    )

    return [
        {
            "department": row.department,
            "high": row.high,
            "medium": row.medium,
            "low": row.low,
        }
        for row in results
    ]


def get_semester_risk_distribution(db: Session):
    results = (
        db.query(
            Student.semester.label("semester"),
            func.sum(
                case(
                    (Prediction.risk_level == "High", 1),
                    else_=0,
                )
            ).label("high"),
            func.sum(
                case(
                    (Prediction.risk_level == "Medium", 1),
                    else_=0,
                )
            ).label("medium"),
            func.sum(
                case(
                    (Prediction.risk_level == "Low", 1),
                    else_=0,
                )
            ).label("low"),
        )
        .join(
            Prediction,
            Prediction.student_id == Student.id,
        )
        .group_by(Student.semester)
        .order_by(Student.semester)
        .all()
    )

    return [
        {
            "semester": row.semester,
            "high": row.high,
            "medium": row.medium,
            "low": row.low,
        }
        for row in results
    ]


def get_recent_predictions(
    db: Session,
    limit: int = 10,
):
    results = (
        db.query(
            Prediction.id,
            Prediction.risk_level,
            Prediction.prediction_date,
            Student.id.label("student_id"),
            Student.roll_number,
            Student.department,
            Student.semester,
        )
        .join(
            Student,
            Prediction.student_id == Student.id,
        )
        .order_by(
            Prediction.prediction_date.desc()
        )
        .limit(limit)
        .all()
    )

    recent_predictions = []

    for row in results:
        student = (
            db.query(Student)
            .filter(Student.id == row.student_id)
            .first()
        )

        recent_predictions.append(
            {
                "prediction_id": row.id,
                "student_id": row.student_id,
                "student_name": (
                    student.user.full_name
                    if student and student.user
                    else None
                ),
                "roll_number": row.roll_number,
                "department": row.department,
                "semester": row.semester,
                "risk_level": row.risk_level,
                "prediction_date": row.prediction_date,
            }
        )

    return recent_predictions


def get_notification_statistics(db: Session):
    total = db.query(Notification).count()

    sent = (
        db.query(Notification)
        .filter(Notification.is_sent == True)
        .count()
    )

    pending = (
        db.query(Notification)
        .filter(Notification.is_sent == False)
        .count()
    )

    read = (
        db.query(Notification)
        .filter(Notification.is_read == True)
        .count()
    )

    unread = (
        db.query(Notification)
        .filter(Notification.is_read == False)
        .count()
    )

    return {
        "total_notifications": total,
        "sent": sent,
        "pending": pending,
        "read": read,
        "unread": unread,
    }


def get_notification_trends(db: Session):
    results = (
        db.query(
            func.to_char(
                Notification.created_at,
                "YYYY-MM",
            ).label("month"),
            func.count(Notification.id).label("notifications"),
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    return [
        {
            "month": row.month,
            "notifications": row.notifications,
        }
        for row in results
    ]

def get_intervention_statistics(db: Session):
    total = db.query(Intervention).count()

    teachers = (
        db.query(Intervention.teacher_id)
        .distinct()
        .count()
    )

    students = (
        db.query(Intervention.student_id)
        .distinct()
        .count()
    )

    return {
        "total_interventions": total,
        "teachers_involved": teachers,
        "students_intervened": students,
    }


def get_intervention_trends(db: Session):
    results = (
        db.query(
            func.to_char(
                Intervention.intervention_date,
                "YYYY-MM",
            ).label("month"),
            func.count(
                Intervention.id
            ).label("interventions"),
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    return [
        {
            "month": row.month,
            "interventions": row.interventions,
        }
        for row in results
    ]