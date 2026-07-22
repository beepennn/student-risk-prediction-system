from app.database.connection import SessionLocal
from app.models.user import User
from app.core.security import hash_password

db = SessionLocal()

try:
    existing_admin = (
        db.query(User)
        .filter(User.role == "Admin")
        .first()
    )

    if existing_admin:
        print("Admin already exists.")
    else:
        admin = User(
            full_name="System Administrator",
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            role="Admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print("Admin account created successfully!")

finally:
    db.close()