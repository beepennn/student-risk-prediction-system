from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate


def get_notifications(db: Session):
    return db.query(Notification).all()


def get_notification(db: Session, notification_id: int):
    return (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )


def create_notification(
    db: Session,
    notification: NotificationCreate,
):
    db_notification = Notification(
        **notification.model_dump()
    )

    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    return db_notification

def generate_notification(db: Session, student_id: int, recommendation):
    message = (
        f"{recommendation.title}: {recommendation.description}"
    )

    notification = Notification(
        student_id=student_id,
        title="Student Risk Alert",
        message=message,
        notification_type="in_app",
        is_sent=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification