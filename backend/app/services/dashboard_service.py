from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.prediction import Prediction
from app.models.notification import Notification


def get_teacher_dashboard(db: Session):
    total_students = db.query(Student).count()

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

    recent_predictions = (
        db.query(Prediction)
        .order_by(Prediction.prediction_date.desc())
        .limit(5)
        .all()
    )

    recent_notifications = (
        db.query(Notification)
        .order_by(Notification.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_students": total_students,
        "high_risk_students": high_risk,
        "medium_risk_students": medium_risk,
        "low_risk_students": low_risk,
        "recent_predictions": recent_predictions,
        "recent_notifications": recent_notifications,
    }