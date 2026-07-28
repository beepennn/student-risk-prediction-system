from typing import Optional

from pydantic import BaseModel


class StudentInfo(BaseModel):
    id: int
    full_name: Optional[str] = None
    roll_number: str
    department: str
    semester: int


class PredictionInfo(BaseModel):
    risk_level: Optional[str] = None
    prediction_date: Optional[str] = None

    low_probability: float = 0.0
    medium_probability: float = 0.0
    high_probability: float = 0.0


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
    total: int = 0
    unread: int = 0


class StudentDashboardResponse(BaseModel):
    student: StudentInfo

    latest_prediction: Optional[
        PredictionInfo
    ] = None

    latest_recommendation: Optional[
        RecommendationInfo
    ] = None

    academic_summary: AcademicSummary

    notifications: NotificationSummary


# Used by reports.py
class InterventionSummaryResponse(BaseModel):
    total_interventions: int


class DepartmentSummaryResponse(BaseModel):
    department: str
    total_students: int


class SemesterSummaryResponse(BaseModel):
    semester: int
    total_students: int


class LatestPredictionResponse(BaseModel):
    student_id: int
    full_name: str
    roll_number: str
    risk_level: str
    high_probability: float
    prediction_date: str