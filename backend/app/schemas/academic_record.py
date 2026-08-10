from pydantic import (
    BaseModel,
    Field,
    model_validator,
)


def validate_percentage(
    value: float,
    field_name: str,
) -> None:
    if not 0 <= value <= 100:
        raise ValueError(
            f"{field_name} must be "
            "between 0 and 100."
        )


class SubjectAcademicRecordCreate(
    BaseModel
):
    subject_code: str
class AcademicRecordCreate(BaseModel):
    student_id: int

    attendance: float

    internal_marks: float

    assignment_score: float

    quiz_score: float

    @model_validator(
        mode="after"
    )
    def validate_scores(
        self,
    ):
        validate_percentage(
            self.attendance,
            "Attendance",
        )

        validate_percentage(
            self.internal_marks,
            "Internal marks",
        )

        validate_percentage(
            self.assignment_score,
            "Assignment score",
        )

        validate_percentage(
            self.quiz_score,
            "Quiz score",
        )

        self.subject_code = (
            self.subject_code
            .strip()
            .upper()
        )

        return self


class SubjectAcademicRecordResponse(
    SubjectAcademicRecordCreate
):
    id: int

    subject_name: str

    credits: float

    included_in_ml: bool

    class Config:
        from_attributes = True


class CurriculumSubjectResponse(
    BaseModel
):
    code: str

    name: str

    credits: float

    standard_assessment: bool


class AcademicRecordCreate(
    BaseModel
):
    student_id: int

    previous_gpa: (
        float | None
    ) = None
    previous_gpa: float | None = None

    semester: int

    gender: str

    subject_records: list[
        SubjectAcademicRecordCreate
    ] = Field(
        default_factory=list
    )

    # Temporary backwards compatibility.
    attendance: float | None = None

    internal_marks: float | None = None

    assignment_score: float | None = None

    quiz_score: float | None = None

    @model_validator(
        mode="after"
    )
    def validate_academic_record(
        self,
    ):
        if not 1 <= self.semester <= 8:
            raise ValueError(
                "Semester must be "
                "between 1 and 8."
            )

        if self.semester == 1:
            self.previous_gpa = None

        elif self.previous_gpa is None:
            raise ValueError(
                "Previous GPA is required "
                "for students from "
                "Semester 2 onward."
            )

        elif not (
            0
            <= self.previous_gpa
            <= 4
        ):
            raise ValueError(
                "Previous GPA must be "
                "between 0 and 4."
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

        if self.subject_records:
            return self

        aggregate_values = {
            "Attendance":
                self.attendance,

            "Internal marks":
                self.internal_marks,

            "Assignment score":
                self.assignment_score,

            "Quiz score":
                self.quiz_score,
        }

        for (
            field_name,
            value,
        ) in aggregate_values.items():
            if value is None:
                raise ValueError(
                    f"{field_name} "
                    "is required."
                )

            validate_percentage(
                value,
                field_name,
            )

        return self


class AcademicRecordResponse(
    BaseModel
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

    student_id: int

    attendance: float

    internal_marks: float

    assignment_score: float

    quiz_score: float

    previous_gpa: (
        float | None
    )

    semester: int

    gender: str

    subject_records: list[
        SubjectAcademicRecordResponse
    ] = Field(
        default_factory=list
    )

    class Config:
        from_attributes = True