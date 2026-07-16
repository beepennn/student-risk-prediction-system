from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class SHAPExplanation(Base):
    __tablename__ = "shap_explanations"

    id = Column(Integer, primary_key=True, index=True)

    prediction_id = Column(
        Integer,
        ForeignKey("predictions.id"),
        nullable=False
    )

    feature_name = Column(String(100), nullable=False)

    feature_value = Column(String(100), nullable=False)

    shap_value = Column(Float, nullable=False)

    prediction = relationship(
        "Prediction",
        back_populates="shap_explanations"
    )