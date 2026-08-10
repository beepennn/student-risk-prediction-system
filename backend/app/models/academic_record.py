from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    student_id = Column(
        Integer,
        ForeignKey(
            "students.id"
        ),
        nullable=False,
    )

    # Semester-level averages used
    # by the existing ML model.

    attendance = Column(
        Float,
        nullable=False,
    )

    internal_marks = Column(
        Float,
        nullable=False,
    )

    assignment_score = Column(
        Float,
        nullable=False,
    )

    quiz_score = Column(
        Float,
        nullable=False,
    )

    previous_gpa = Column(
        Float,
        nullable=True,
    )

    semester = Column(
        Integer,
        nullable=False,
    )

    gender = Column(
        String,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    student = relationship(
        "Student",
        back_populates="academic_records",
    )

    subject_records = relationship(
        "SubjectAcademicRecord",
        back_populates="academic_record",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )