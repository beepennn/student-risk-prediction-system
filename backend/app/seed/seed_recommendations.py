from app.database.connection import SessionLocal
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.services.recommendation_service import generate_recommendation


def seed_recommendations():
    db = SessionLocal()

    predictions = db.query(Prediction).all()

    for prediction in predictions:

        existing = (
            db.query(Recommendation)
            .filter(
                Recommendation.prediction_id == prediction.id
            )
            .first()
        )

        if existing:
            continue

        generate_recommendation(
            db,
            prediction,
        )

    db.close()

    print("Recommendations seeded successfully.")