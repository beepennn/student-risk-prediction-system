from datetime import datetime

from pydantic import BaseModel


class RecommendationCreate(BaseModel):
    prediction_id: int
    title: str
    description: str
    priority: str


class RecommendationUpdateStatus(BaseModel):
    status: str


class RecommendationResponse(RecommendationCreate):
    id: int
    status: str
    completed_at: datetime | None = None

    class Config:
        from_attributes = True