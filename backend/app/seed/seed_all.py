from app.seed.seed_users import seed_users
from app.seed.seed_students import seed_students
from app.seed.seed_academic import seed_academic_records
from app.seed.seed_predictions import seed_predictions
from app.seed.seed_recommendations import seed_recommendations
from app.seed.seed_notifications import seed_notifications


def seed_all():
    print("=" * 50)
    print("Starting Database Seeder...")
    print("=" * 50)

    seed_users()
    seed_students()
    seed_academic_records()
    seed_predictions()
    seed_recommendations()
    seed_notifications()

    print("=" * 50)
    print("Database seeded successfully!")
    print("=" * 50)


if __name__ == "__main__":
    seed_all()