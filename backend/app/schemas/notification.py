from datetime import datetime

from pydantic import BaseModel


class NotificationCreate(BaseModel):
    student_id: int
    title: str
    message: str
    notification_type: str
    is_sent: bool = False


class NotificationResponse(NotificationCreate):
    id: int
    is_read: bool
    sent_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True