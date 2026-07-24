from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate

from app.services.email_service import send_email
from app.models.student import Student

from app.services.audit_service import create_audit_log


def get_notifications(db: Session):
    return db.query(Notification).all()


def get_notification(
    db: Session,
    notification_id: int,
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    return notification


def create_notification(
    db: Session,
    notification: NotificationCreate,
    admin_id: int,
):
    db_notification = Notification(
        **notification.model_dump()
    )

    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="CREATE",
        entity="Notification",
        entity_id=db_notification.id,
    )

    return db_notification


def generate_notification(
    db: Session,
    student_id: int,
    recommendation,
):
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

    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if student is not None:

        student_email = student.user.email

        parent_email = student.parent_email

        html = f"""
        <h2>Student Risk Prediction</h2>

        <p><strong>Recommendation:</strong></p>

        <p>{recommendation.title}</p>

        <p>{recommendation.description}</p>

        <p><strong>Priority:</strong> {recommendation.priority}</p>
        """

        try:
            send_email(
                student_email,
                "Student Risk Alert",
                html,
            )

            if parent_email:
                send_email(
                    parent_email,
                    "Student Risk Alert",
                    html,
                )

            notification.is_sent = True
            db.commit()

        except Exception as e:
            print("Email Error:", e)

    return notification


def get_student_notifications(
    db: Session,
    student_id: int,
):
    return (
        db.query(Notification)
        .filter(
            Notification.student_id == student_id
        )
        .order_by(
            Notification.id.desc()
        )
        .all()
    )


def mark_notification_as_read(
    db: Session,
    notification_id: int,
    student_id: int,
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.student_id == student_id,
        )
        .first()
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read."
    }


def get_admin_notifications(
    db: Session,
    notification_type: str | None = None,
    is_sent: bool | None = None,
    skip: int = 0,
    limit: int = 20,
):
    query = db.query(Notification)

    if notification_type:
        query = query.filter(
            Notification.notification_type == notification_type
        )

    if is_sent is not None:
        query = query.filter(
            Notification.is_sent == is_sent
        )

    return (
        query.order_by(
            Notification.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def mark_notification_as_sent(
    db: Session,
    notification_id: int,
    admin_id: int,
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id
        )
        .first()
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    notification.is_sent = True
    notification.sent_at = func.now()

    db.commit()
    db.refresh(notification)

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="UPDATE",
        entity="Notification",
        entity_id=notification.id,
    )

    return {
        "message": "Notification marked as sent."
    }


def delete_notification(
    db: Session,
    notification_id: int,
    admin_id: int,
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id
        )
        .first()
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    deleted_id = notification.id

    db.delete(notification)
    db.commit()

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="DELETE",
        entity="Notification",
        entity_id=deleted_id,
    )

    return {
        "message": "Notification deleted successfully."
    }

def mark_all_notifications_as_read(
    db: Session,
    student_id: int,
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.student_id == student_id,
            Notification.is_read == False,
        )
        .all()
    )

    updated = 0

    for notification in notifications:
        notification.is_read = True
        updated += 1

    db.commit()

    return {
        "message": "All notifications marked as read.",
        "updated": updated,
    }