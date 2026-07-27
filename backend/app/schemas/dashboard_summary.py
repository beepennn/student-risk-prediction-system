from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_students: int
    total_predictions: int
    high_risk_students: int
    medium_risk_students: int
    low_risk_students: int
    pending_recommendations: int
    completed_recommendations: int
    total_notifications: int