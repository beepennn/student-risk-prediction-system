import logging

from datetime import datetime, timezone
from html import escape

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.core.api_response import success_response
from app.core.config import settings

from app.models.notification import Notification
from app.models.prediction import Prediction
from app.models.student import Student

from app.schemas.notification import NotificationCreate

from app.services.audit_service import create_audit_log
from app.services.email_service import send_email


logger = logging.getLogger(__name__)


def get_notifications(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    notification_type: str | None = None,
    is_sent: bool | None = None,
    is_read: bool | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
):
    query = db.query(Notification)

    if notification_type:
        query = query.filter(
            Notification.notification_type
            == notification_type
        )

    if is_sent is not None:
        query = query.filter(
            Notification.is_sent == is_sent
        )

    if is_read is not None:
        query = query.filter(
            Notification.is_read == is_read
        )

    allowed_sort_columns = {
        "id": Notification.id,
        "created_at": Notification.created_at,
        "sent_at": Notification.sent_at,
        "title": Notification.title,
        "notification_type": (
            Notification.notification_type
        ),
    }

    sort_column = allowed_sort_columns.get(
        sort_by,
        Notification.created_at,
    )

    if order.lower() == "asc":
        query = query.order_by(
            sort_column.asc()
        )
    else:
        query = query.order_by(
            sort_column.desc()
        )

    return (
        query.offset(skip)
        .limit(limit)
        .all()
    )


def get_notification(
    db: Session,
    notification_id: int,
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id
            == notification_id
        )
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
    student = (
        db.query(Student)
        .filter(
            Student.id
            == notification.student_id
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

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


def _normalise_percentage(
    value,
) -> float:
    try:
        percentage = float(value)
    except (TypeError, ValueError):
        return 0.0

    if 0 <= percentage <= 1:
        percentage *= 100

    return percentage


def _get_prediction_confidence(
    prediction: Prediction,
) -> str:
    confidence_percentage = getattr(
        prediction,
        "confidence_percentage",
        None,
    )

    if confidence_percentage is not None:
        percentage = _normalise_percentage(
            confidence_percentage
        )

        return f"{percentage:.2f}%"

    probabilities = [
        getattr(
            prediction,
            "low_probability",
            0,
        ),
        getattr(
            prediction,
            "medium_probability",
            0,
        ),
        getattr(
            prediction,
            "high_probability",
            0,
        ),
    ]

    valid_probabilities: list[float] = []

    for probability in probabilities:
        try:
            valid_probabilities.append(
                float(probability)
            )
        except (TypeError, ValueError):
            continue

    if not valid_probabilities:
        return "N/A"

    percentage = (
        max(valid_probabilities)
        * 100
    )

    return f"{percentage:.2f}%"


def _format_prediction_date(
    prediction: Prediction,
) -> str:
    prediction_date = getattr(
        prediction,
        "prediction_date",
        None,
    )

    if prediction_date is None:
        return "N/A"

    if hasattr(
        prediction_date,
        "strftime",
    ):
        return prediction_date.strftime(
            "%d %B %Y, %I:%M %p"
        )

    return str(prediction_date)


def _get_risk_colour(
    risk_level: str,
) -> str:
    risk = risk_level.lower()

    if "high" in risk:
        return "#dc2626"

    if "medium" in risk:
        return "#d97706"

    if "low" in risk:
        return "#16a34a"

    return "#475569"


def _build_risk_alert_email(
    student: Student,
    prediction: Prediction,
    recommendation,
    recipient_type: str,
) -> tuple[str, str, str]:
    student_name = (
        student.user.full_name
        if (
            student.user
            and student.user.full_name
        )
        else "Student"
    )

    roll_number = (
        student.roll_number
        or "N/A"
    )

    risk_level = (
        prediction.risk_level
        or "Not Available"
    )

    confidence = (
        _get_prediction_confidence(
            prediction
        )
    )

    prediction_date = (
        _format_prediction_date(
            prediction
        )
    )

    recommendation_title = (
        recommendation.title
        or "Academic Recommendation"
    )

    recommendation_description = (
        recommendation.description
        or (
            "Please contact the class "
            "teacher for further guidance."
        )
    )

    priority = (
        recommendation.priority
        or "Not Specified"
    )

    risk_colour = _get_risk_colour(
        risk_level
    )

    login_url = (
        settings.FRONTEND_URL.rstrip("/")
        + "/login"
    )

    if recipient_type == "parent":
        greeting = "Dear Parent/Guardian,"

        opening_message = (
            "A new academic-risk assessment "
            "has been generated for your student."
        )

        support_message = (
            "Please communicate with the class "
            "teacher and support the student in "
            "following the recommended actions."
        )
    else:
        greeting = (
            f"Dear {student_name},"
        )

        opening_message = (
            "A new academic-risk assessment "
            "has been generated for you."
        )

        support_message = (
            "Please follow the recommended "
            "actions and contact your teacher "
            "when additional support is needed."
        )

    subject = (
        f"Academic Risk Alert for "
        f"{student_name} — {risk_level}"
    )

    safe_student_name = escape(
        student_name
    )

    safe_roll_number = escape(
        roll_number
    )

    safe_risk_level = escape(
        risk_level
    )

    safe_confidence = escape(
        confidence
    )

    safe_prediction_date = escape(
        prediction_date
    )

    safe_title = escape(
        recommendation_title
    )

    safe_description = escape(
        recommendation_description
    )

    safe_priority = escape(
        priority
    )

    safe_greeting = escape(
        greeting
    )

    safe_opening = escape(
        opening_message
    )

    safe_support = escape(
        support_message
    )

    safe_login_url = escape(
        login_url,
        quote=True,
    )

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f1f5f9;
        font-family: Arial, sans-serif;
        color: #0f172a;
    ">
        <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            style="
                background-color: #f1f5f9;
                padding: 32px 16px;
            "
        >
            <tr>
                <td align="center">
                    <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        style="
                            max-width: 650px;
                            background-color: #ffffff;
                            border-radius: 14px;
                            overflow: hidden;
                            box-shadow:
                                0 6px 20px
                                rgba(15, 23, 42, 0.08);
                        "
                    >
                        <tr>
                            <td style="
                                background-color: #2563eb;
                                color: #ffffff;
                                padding: 28px 32px;
                            ">
                                <h1 style="
                                    margin: 0;
                                    font-size: 25px;
                                ">
                                    Student Risk Prediction System
                                </h1>

                                <p style="
                                    margin: 8px 0 0;
                                    opacity: 0.9;
                                ">
                                    Academic Risk Alert
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding: 32px;
                            ">
                                <p style="
                                    margin-top: 0;
                                    font-size: 16px;
                                ">
                                    {safe_greeting}
                                </p>

                                <p style="
                                    color: #475569;
                                    line-height: 1.7;
                                ">
                                    {safe_opening}
                                </p>

                                <table
                                    role="presentation"
                                    width="100%"
                                    cellspacing="0"
                                    cellpadding="0"
                                    style="
                                        margin: 24px 0;
                                        border:
                                            1px solid #e2e8f0;
                                        border-radius: 10px;
                                    "
                                >
                                    <tr>
                                        <td style="
                                            padding: 12px 16px;
                                            color: #64748b;
                                        ">
                                            Student
                                        </td>

                                        <td style="
                                            padding: 12px 16px;
                                            font-weight: bold;
                                        ">
                                            {safe_student_name}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 12px 16px;
                                            color: #64748b;
                                            border-top:
                                                1px solid #e2e8f0;
                                        ">
                                            Roll Number
                                        </td>

                                        <td style="
                                            padding: 12px 16px;
                                            border-top:
                                                1px solid #e2e8f0;
                                        ">
                                            {safe_roll_number}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 12px 16px;
                                            color: #64748b;
                                            border-top:
                                                1px solid #e2e8f0;
                                        ">
                                            Risk Level
                                        </td>

                                        <td style="
                                            padding: 12px 16px;
                                            border-top:
                                                1px solid #e2e8f0;
                                            color: {risk_colour};
                                            font-weight: bold;
                                        ">
                                            {safe_risk_level}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 12px 16px;
                                            color: #64748b;
                                            border-top:
                                                1px solid #e2e8f0;
                                        ">
                                            Confidence
                                        </td>

                                        <td style="
                                            padding: 12px 16px;
                                            border-top:
                                                1px solid #e2e8f0;
                                        ">
                                            {safe_confidence}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 12px 16px;
                                            color: #64748b;
                                            border-top:
                                                1px solid #e2e8f0;
                                        ">
                                            Prediction Date
                                        </td>

                                        <td style="
                                            padding: 12px 16px;
                                            border-top:
                                                1px solid #e2e8f0;
                                        ">
                                            {safe_prediction_date}
                                        </td>
                                    </tr>
                                </table>

                                <div style="
                                    border-left:
                                        5px solid #2563eb;
                                    background-color: #eff6ff;
                                    border-radius: 8px;
                                    padding: 20px;
                                ">
                                    <p style="
                                        margin: 0 0 8px;
                                        color: #2563eb;
                                        font-size: 13px;
                                        font-weight: bold;
                                        text-transform: uppercase;
                                    ">
                                        Recommended Action
                                    </p>

                                    <h2 style="
                                        margin: 0 0 12px;
                                        font-size: 20px;
                                    ">
                                        {safe_title}
                                    </h2>

                                    <p style="
                                        margin: 0;
                                        color: #334155;
                                        line-height: 1.7;
                                    ">
                                        {safe_description}
                                    </p>

                                    <p style="
                                        margin: 16px 0 0;
                                    ">
                                        <strong>
                                            Priority:
                                        </strong>
                                        {safe_priority}
                                    </p>
                                </div>

                                <p style="
                                    margin: 24px 0;
                                    color: #475569;
                                    line-height: 1.7;
                                ">
                                    {safe_support}
                                </p>

                                <div style="
                                    text-align: center;
                                    margin: 28px 0;
                                ">
                                    <a
                                        href="{safe_login_url}"
                                        style="
                                            display: inline-block;
                                            background-color:
                                                #2563eb;
                                            color: #ffffff;
                                            text-decoration: none;
                                            padding: 13px 24px;
                                            border-radius: 8px;
                                            font-weight: bold;
                                        "
                                    >
                                        Open Student Risk System
                                    </a>
                                </div>

                                <p style="
                                    margin-bottom: 0;
                                    color: #64748b;
                                    line-height: 1.6;
                                ">
                                    Regards,<br>

                                    <strong>
                                        Student Risk Prediction
                                        System
                                    </strong>
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                background-color: #f8fafc;
                                padding: 18px 32px;
                                color: #94a3b8;
                                font-size: 12px;
                                text-align: center;
                            ">
                                This is an automatically
                                generated academic notification.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    text_body = f"""
{greeting}

{opening_message}

Student: {student_name}
Roll Number: {roll_number}
Risk Level: {risk_level}
Prediction Confidence: {confidence}
Prediction Date: {prediction_date}

Recommended Action:
{recommendation_title}

{recommendation_description}

Priority: {priority}

{support_message}

Login: {login_url}

Regards,
Student Risk Prediction System
""".strip()

    return (
        subject,
        html_body,
        text_body,
    )


def generate_notification(
    db: Session,
    student_id: int,
    recommendation,
):
    message = (
        f"{recommendation.title}: "
        f"{recommendation.description}"
    )[:500]

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
        .filter(
            Student.id == student_id
        )
        .first()
    )

    if student is None:
        return notification

    prediction = (
        db.query(Prediction)
        .filter(
            Prediction.id
            == recommendation.prediction_id
        )
        .first()
    )

    if prediction is None:
        logger.warning(
            "Prediction %s was not found "
            "while generating notification %s.",
            recommendation.prediction_id,
            notification.id,
        )

        return notification

    student_email = None

    if (
        student.user
        and student.user.email
    ):
        student_email = (
            student.user.email.strip()
        )

    parent_email = (
        student.parent_email.strip()
        if student.parent_email
        else None
    )

    recipients: list[
        tuple[str, str]
    ] = []

    if parent_email:
        recipients.append(
            (
                "parent",
                parent_email,
            )
        )

    if (
        student_email
        and (
            not parent_email
            or student_email.lower()
            != parent_email.lower()
        )
    ):
        recipients.append(
            (
                "student",
                student_email,
            )
        )

    successful_deliveries = 0

    for (
        recipient_type,
        recipient_email,
    ) in recipients:
        try:
            (
                subject,
                html_body,
                text_body,
            ) = _build_risk_alert_email(
                student=student,
                prediction=prediction,
                recommendation=(
                    recommendation
                ),
                recipient_type=(
                    recipient_type
                ),
            )

            send_email(
                to_email=recipient_email,
                subject=subject,
                html_body=html_body,
                text_body=text_body,
            )

            successful_deliveries += 1

        except Exception:
            logger.exception(
                "Failed to send risk alert "
                "notification %s to %s.",
                notification.id,
                recipient_email,
            )

    if successful_deliveries > 0:
        notification.is_sent = True

        notification.sent_at = (
            datetime.now(timezone.utc)
        )

        db.commit()
        db.refresh(notification)

    return notification


def get_student_notifications(
    db: Session,
    student_id: int,
):
    return (
        db.query(Notification)
        .filter(
            Notification.student_id
            == student_id
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
            Notification.id
            == notification_id,
            Notification.student_id
            == student_id,
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

    return success_response(
        message=(
            "Notification marked as read."
        )
    )


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
            Notification.notification_type
            == notification_type
        )

    if is_sent is not None:
        query = query.filter(
            Notification.is_sent
            == is_sent
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
            Notification.id
            == notification_id
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

    return success_response(
        message=(
            "Notification marked as sent."
        )
    )


def delete_notification(
    db: Session,
    notification_id: int,
    admin_id: int,
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id
            == notification_id
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

    return success_response(
        message=(
            "Notification deleted successfully."
        )
    )


def mark_all_notifications_as_read(
    db: Session,
    student_id: int,
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.student_id
            == student_id,
            Notification.is_read.is_(False),
        )
        .all()
    )

    updated = 0

    for notification in notifications:
        notification.is_read = True
        updated += 1

    db.commit()

    return success_response(
        message=(
            "All notifications marked as read."
        ),
        data={
            "updated": updated,
        },
    )