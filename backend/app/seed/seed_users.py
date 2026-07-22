from app.database.connection import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def seed_users():
    db = SessionLocal()

    users = [
        {
            "full_name": "System Administrator",
            "email": "admin@example.com",
            "password": "admin123",
            "role": "Admin",
        },
        {
            "full_name": "Teacher One",
            "email": "teacher@example.com",
            "password": "teacher123",
            "role": "Teacher",
        },
        {
            "full_name": "Student One",
            "email": "student1@example.com",
            "password": "student123",
            "role": "Student",
        },
        {
            "full_name": "Student Two",
            "email": "student2@example.com",
            "password": "student123",
            "role": "Student",
        },
        {
            "full_name": "Student Three",
            "email": "student3@example.com",
            "password": "student123",
            "role": "Student",
        },
    ]

    for user in users:

        existing = (
            db.query(User)
            .filter(User.email == user["email"])
            .first()
        )

        if existing:
            continue

        db.add(
            User(
                full_name=user["full_name"],
                email=user["email"],
                password_hash=hash_password(user["password"]),
                role=user["role"],
                is_active=True,
            )
        )

    db.commit()
    db.close()

    print("Users seeded successfully.")