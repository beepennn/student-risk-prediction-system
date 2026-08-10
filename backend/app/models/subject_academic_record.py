from sqlalchemy import (
    Boolean,
    Column,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)

from sqlalchemy.orm import relationship

from app.database.base import Base


class SubjectAcademicRecord(Base):
    __tablename__ = (
        "subject_academic_records"
    )

    __table_args__ = (
        UniqueConstraint(
            "academic_record_id",
            "subject_code",
            name=(
                "uq_academic_record_"
                "subject_code"
            ),
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    academic_record_id = Column(
        Integer,
        ForeignKey(
            "academic_records.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    subject_code = Column(
        String(30),
        nullable=False,
    )

    subject_name = Column(
        String(200),
        nullable=False,
    )

    credits = Column(
        Float,
        nullable=False,
    )

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

    included_in_ml = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    academic_record = relationship(
        "AcademicRecord",
        back_populates="subject_records",
    )