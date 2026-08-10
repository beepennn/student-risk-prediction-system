from pydantic import (
    BaseModel,
    model_validator,
)


class AcademicRecordCreate(BaseModel):
    student_id: int

    attendance: float

    internal_marks: float

    assignment_score: float

    quiz_score: float

    previous_gpa: float | None = None

    semester: int

    gender: str

    @model_validator(mode="after")
    def validate_academic_record(
        self,
    ):
        if not 1 <= self.semester <= 8:
            raise ValueError(
                "Semester must be between 1 and 8."
            )

        if not 0 <= self.attendance <= 100:
            raise ValueError(
                "Attendance must be between 0 and 100."
            )

        if not 0 <= self.internal_marks <= 100:
            raise ValueError(
                "Internal marks must be between 0 and 100."
            )

        if not 0 <= self.assignment_score <= 100:
            raise ValueError(
                "Assignment score must be between 0 and 100."
            )

        if not 0 <= self.quiz_score <= 100:
            raise ValueError(
                "Quiz score must be between 0 and 100."
            )

        # First-semester students have no
        # previous-semester GPA.
        if self.semester == 1:
            self.previous_gpa = None

        # From Semester 2 onward, it is required.
        elif self.previous_gpa is None:
            raise ValueError(
                "Previous GPA is required for "
                "students from Semester 2 onward."
            )

        elif not 0 <= self.previous_gpa <= 4:
            raise ValueError(
                "Previous GPA must be between 0 and 4."
            )

        self.gender = (
            self.gender
            .strip()
            .title()
        )

        if not self.gender:
            raise ValueError(
                "Gender is required."
            )

        return self


class AcademicRecordResponse(
    AcademicRecordCreate
):
    id: int

    class Config:
        from_attributes = True