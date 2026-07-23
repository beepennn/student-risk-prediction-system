from app.database.connection import SessionLocal
from app.models.recommendation import Recommendation
from app.models.notification import Notification
from app.services.notification_service import generate_notification


def seed_notifications():
    db = SessionLocal()

    recommendations = db.query(Recommendation).all()

    for recommendation in recommendations:

        existing = (
            db.query(Notification)
            .filter(
                Notification.student_id == recommendation.prediction.student_id
            )
            .first()
        )

        if existing:
            continue

        generate_notification(
            db,
            recommendation.prediction.student_id,
            recommendation,
        )

    db.close()

    print("Notifications seeded successfully.")