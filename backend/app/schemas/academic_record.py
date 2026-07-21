from pydantic import BaseModel


class AcademicRecordCreate(BaseModel):
    student_id: int
    attendance: float
    internal_marks: float
    assignment_score: float
    quiz_score: float
    previous_gpa: float
    semester: int


class AcademicRecordResponse(AcademicRecordCreate):
    id: int

    class Config:
        from_attributes = True