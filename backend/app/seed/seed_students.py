from app.database.connection import SessionLocal
from app.models.user import User
from app.models.student import Student


def seed_students():
    db = SessionLocal()

    students = [
        {
            "email": "student1@example.com",
            "roll_number": "CS001",
            "department": "Computer Science",
            "semester": 5,
            "phone": "9800000001",
            "parent_email": "parent1@example.com",
            "enrollment_year": 2023,
        },
        {
            "email": "student2@example.com",
            "roll_number": "CS002",
            "department": "Computer Science",
            "semester": 5,
            "phone": "9800000002",
            "parent_email": "parent2@example.com",
            "enrollment_year": 2023,
        },
        {
            "email": "student3@example.com",
            "roll_number": "CS003",
            "department": "Computer Science",
            "semester": 5,
            "phone": "9800000003",
            "parent_email": "parent3@example.com",
            "enrollment_year": 2023,
        },
    ]

    for student in students:

        user = (
            db.query(User)
            .filter(User.email == student["email"])
            .first()
        )

        if user is None:
            continue

        existing = (
            db.query(Student)
            .filter(
                Student.roll_number == student["roll_number"]
            )
            .first()
        )

        if existing:
            continue

        db.add(
            Student(
                user_id=user.id,
                roll_number=student["roll_number"],
                department=student["department"],
                semester=student["semester"],
                phone=student["phone"],
                parent_email=student["parent_email"],
                enrollment_year=student["enrollment_year"],
                status="Active",
            )
        )

    db.commit()
    db.close()

    print("Students seeded successfully.")