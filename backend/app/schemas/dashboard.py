from pydantic import BaseModel
from typing import Optional


class StudentInfo(BaseModel):
    id: int
    full_name: str
    roll_number: str
    department: str
    semester: int


class PredictionInfo(BaseModel):
    risk_level: Optional[str] = None
    prediction_date: Optional[str] = None

    low_probability: Optional[float] = None
    medium_probability: Optional[float] = None
    high_probability: Optional[float] = None


class RecommendationInfo(BaseModel):
    priority: Optional[str] = None
    recommendation_text: Optional[str] = None


class AcademicSummary(BaseModel):
    attendance: Optional[float] = None
    internal_marks: Optional[float] = None
    assignment_score: Optional[float] = None
    quiz_score: Optional[float] = None
    previous_gpa: Optional[float] = None


class NotificationSummary(BaseModel):
    total: int
    unread: int


class StudentDashboardResponse(BaseModel):
    student: StudentInfo

    latest_prediction: Optional[PredictionInfo] = None

    latest_recommendation: Optional[RecommendationInfo] = None

    academic_summary: Optional[AcademicSummary] = None

    notifications: NotificationSummary