from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False
    )

    teacher_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    action_taken = Column(String(500), nullable=False)

    remarks = Column(String(500), nullable=True)

    intervention_date = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    student = relationship(
        "Student",
        back_populates="interventions"
    )

    teacher = relationship("User")