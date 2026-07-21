from pydantic import BaseModel


class RecommendationCreate(BaseModel):
    prediction_id: int
    title: str
    description: str
    priority: str


class RecommendationResponse(RecommendationCreate):
    id: int

    class Config:
        from_attributes = True