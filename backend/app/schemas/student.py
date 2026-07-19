from pydantic import BaseModel, EmailStr
from typing import Optional


class StudentCreate(BaseModel):
    user_id: int
    roll_number: str
    department: str
    semester: int
    phone: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    enrollment_year: int
    status: Optional[str] = "Active"


class StudentUpdate(BaseModel):
    department: Optional[str] = None
    semester: Optional[int] = None
    phone: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    status: Optional[str] = None


class StudentResponse(BaseModel):
    id: int
    user_id: int
    roll_number: str
    department: str
    semester: int
    phone: Optional[str]
    parent_email: Optional[EmailStr]
    enrollment_year: int
    status: str

    class Config:
        from_attributes = True