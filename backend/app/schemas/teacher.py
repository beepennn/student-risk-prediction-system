from pydantic import BaseModel

from app.schemas.student import StudentResponse
from app.schemas.academic_record import AcademicRecordResponse
from app.schemas.prediction import PredictionResponse
from app.schemas.recommendation import RecommendationResponse
from app.schemas.intervention import InterventionResponse


class StudentProfileResponse(BaseModel):
    student: StudentResponse
    academic_records: list[AcademicRecordResponse]
    latest_prediction: PredictionResponse | None
    latest_recommendation: RecommendationResponse | None
    interventions: list[InterventionResponse]