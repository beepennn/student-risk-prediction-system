from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    roll_number = Column(String(20), unique=True, nullable=False)

    department = Column(String(100), nullable=False)

    semester = Column(Integer, nullable=False)

    phone = Column(String(20), nullable=True)

    parent_email = Column(String(150), nullable=True)

    enrollment_year = Column(Integer, nullable=False)

    status = Column(String(20), default="Active")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship("User", back_populates="student")

    academic_records = relationship(
        "AcademicRecord",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    predictions = relationship(
        "Prediction",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    notifications = relationship(
        "Notification",
        back_populates="student",
        cascade="all, delete-orphan",
    )