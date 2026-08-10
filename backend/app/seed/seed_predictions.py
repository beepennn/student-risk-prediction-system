from app.database.connection import SessionLocal
from app.models.student import Student
from app.models.prediction import Prediction


def seed_predictions():
    db = SessionLocal()

    students = db.query(Student).all()

    for student in students:

        existing = (
            db.query(Prediction)
            .filter(Prediction.student_id == student.id)
            .first()
        )

        if existing:
            continue

        if student.roll_number == "CS001":
            risk_level = "Low"
            low_probability = 0.91
            medium_probability = 0.07
            high_probability = 0.02

        elif student.roll_number == "CS002":
            risk_level = "Medium"
            low_probability = 0.18
            medium_probability = 0.70
            high_probability = 0.12

        else:
            risk_level = "High"
            low_probability = 0.05
            medium_probability = 0.20
            high_probability = 0.75

        prediction = Prediction(
            student_id=student.id,
            risk_level=risk_level,
            low_probability=low_probability,
            medium_probability=medium_probability,
            high_probability=high_probability,
        )

        db.add(prediction)

    db.commit()
    db.close()

    print("Predictions seeded successfully.")