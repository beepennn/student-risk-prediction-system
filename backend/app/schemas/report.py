from datetime import datetime

from pydantic import BaseModel


class ReportDashboardSummaryResponse(BaseModel):
    total_students: int = 0
    high_risk: int = 0
    medium_risk: int = 0
    low_risk: int = 0


class RiskStudentReportResponse(BaseModel):
    student_id: int
    full_name: str
    roll_number: str
    department: str
    semester: int
    risk_level: str

    low_probability: float = 0.0
    medium_probability: float = 0.0
    high_probability: float = 0.0

    prediction_date: datetime | None = None


class DepartmentReportResponse(BaseModel):
    department: str
    total_students: int


class SemesterReportResponse(BaseModel):
    semester: int
    total_students: int


class LatestPredictionReportResponse(
    RiskStudentReportResponse
):
    pass


class InterventionReportResponse(BaseModel):
    total_interventions: int