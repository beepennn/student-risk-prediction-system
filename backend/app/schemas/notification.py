from pydantic import BaseModel


class NotificationCreate(BaseModel):
    student_id: int
    title: str
    message: str
    notification_type: str
    is_sent: bool = False


class NotificationResponse(NotificationCreate):
    id: int

    class Config:
        from_attributes = True