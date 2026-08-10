from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)

    prediction_id = Column(
        Integer,
        ForeignKey("predictions.id"),
        nullable=False
    )

    title = Column(String(200), nullable=False)

    description = Column(String(500), nullable=False)

    priority = Column(String(20), nullable=False)

    status = Column(
        String(20),
        nullable=False,
        default="Pending",
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    prediction = relationship(
        "Prediction",
        back_populates="recommendations"
    )