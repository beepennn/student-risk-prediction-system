from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from datetime import datetime
from app.database.base import Base


class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("students.id"))

    attendance_percentage = Column(Float)

    internal_marks = Column(Float)

    quiz_score = Column(Float)

    assignment_score = Column(Float)

    semester_gpa = Column(Float)

    failed_subjects = Column(Integer)

    updated_at = Column(DateTime, default=datetime.utcnow)