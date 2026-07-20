from pydantic import BaseModel


class InterventionCreate(BaseModel):
    student_id: int
    teacher_id: int
    action_taken: str
    remarks: str | None = None


class InterventionResponse(InterventionCreate):
    id: int

    class Config:
        from_attributes = True