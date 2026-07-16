from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    attendance = Column(Float, nullable=False)

    internal_marks = Column(Float, nullable=False)

    assignment_score = Column(Float, nullable=False)

    quiz_score = Column(Float, nullable=False)

    previous_gpa = Column(Float, nullable=False)

    semester = Column(Integer, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    student = relationship(
        "Student",
        back_populates="academic_records"
    )