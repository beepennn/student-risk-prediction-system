from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    risk_level = Column(String(20), nullable=False)

    low_probability = Column(Float, nullable=False)

    medium_probability = Column(Float, nullable=False)

    high_probability = Column(Float, nullable=False)

    prediction_date = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    student = relationship(
        "Student",
        back_populates="predictions"
    )

    shap_explanations = relationship(
        "SHAPExplanation",
        back_populates="prediction",
        cascade="all, delete-orphan",
    )

    recommendations = relationship(
        "Recommendation",
        back_populates="prediction",
        cascade="all, delete-orphan",
    )