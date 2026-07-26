from pydantic import BaseModel


class PredictionCreate(BaseModel):
    student_id: int
    risk_level: str
    low_probability: float
    medium_probability: float
    high_probability: float
    confidence: float
    confidence_percentage: float


class PredictionResponse(PredictionCreate):
    id: int

    class Config:
        from_attributes = True


class PredictionResponse(PredictionCreate):
    id: int

    class Config:
        from_attributes = True