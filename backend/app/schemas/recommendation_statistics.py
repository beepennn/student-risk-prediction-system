from pydantic import BaseModel


class RecommendationStatisticsResponse(BaseModel):
    total: int
    pending: int
    completed: int
    high_priority: int
    medium_priority: int
    low_priority: int
    completion_rate: float