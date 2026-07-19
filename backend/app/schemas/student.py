from pydantic import BaseModel


class StudentCreate(BaseModel):
    user_id: int
    roll_number: str
    department: str
    semester: int
    phone: str | None = None
    parent_email: str | None = None
    enrollment_year: int
    status: str = "Active"


class StudentResponse(StudentCreate):
    id: int

    class Config:
        from_attributes = True