from fastapi import HTTPException

from sqlalchemy.orm import (
    Session,
    selectinload,
)

from app.core.curriculum import (
    get_curriculum_subjects,
)

from app.models.academic_record import (
    AcademicRecord,
)

from app.models.student import Student

from app.models.subject_academic_record import (
    SubjectAcademicRecord,
)

from app.schemas.academic_record import (
    AcademicRecordCreate,
)


def get_academic_records(
    db: Session,
):
    return (
        db.query(AcademicRecord)
        .options(
            selectinload(
                AcademicRecord.subject_records
            )
        )
        .order_by(
            AcademicRecord.id.desc()
        )
        .all()
    )


def get_academic_record(
    db: Session,
    record_id: int,
):
    record = (
        db.query(AcademicRecord)
        .options(
            selectinload(
                AcademicRecord.subject_records
            )
        )
        .filter(
            AcademicRecord.id
            == record_id
        )
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Academic record "
                "not found."
            ),
        )

    return record


def get_curriculum_for_department(
    department: str,
    semester: int,
):
    try:
        return (
            get_curriculum_subjects(
                department,
                semester,
            )
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


def _get_student_or_404(
    db: Session,
    student_id: int,
) -> Student:
    student = (
        db.query(Student)
        .filter(
            Student.id
            == student_id
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    return student


def _calculate_subject_averages(
    academic_record:
        AcademicRecordCreate,

    student: Student,
) -> tuple[
    dict[str, float],
    list[dict[str, object]],
]:
    try:
        curriculum = (
            get_curriculum_subjects(
                student.department,
                academic_record.semester,
            )
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


    catalog_by_code = {
        str(
            subject["code"]
        ).upper(): subject
        for subject in curriculum
    }


    expected_subject_codes = {
        str(
            subject["code"]
        ).upper()
        for subject in curriculum
        if subject[
            "standard_assessment"
        ]
    }


    received_subject_codes = [
        subject.subject_code.upper()
        for subject
        in academic_record.subject_records
    ]


    if (
        len(
            received_subject_codes
        )
        != len(
            set(
                received_subject_codes
            )
        )
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Duplicate subject "
                "records are not allowed."
            ),
        )


    unknown_subject_codes = (
        set(
            received_subject_codes
        )
        - set(
            catalog_by_code
        )
    )


    if unknown_subject_codes:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid subjects for "
                f"{student.department}, "
                f"Semester "
                f"{academic_record.semester}: "
                f"{sorted(unknown_subject_codes)}"
            ),
        )


    non_standard_codes = {
        code
        for code
        in received_subject_codes
        if not catalog_by_code[
            code
        ][
            "standard_assessment"
        ]
    }


    if non_standard_codes:
        raise HTTPException(
            status_code=400,
            detail=(
                "Project or internship "
                "subjects do not use the "
                "standard academic-score "
                "form: "
                f"{sorted(non_standard_codes)}"
            ),
        )


    missing_subjects = (
        expected_subject_codes
        - set(
            received_subject_codes
        )
    )


    if missing_subjects:
        raise HTTPException(
            status_code=400,
            detail=(
                "Academic data is missing "
                "for these subjects: "
                f"{sorted(missing_subjects)}"
            ),
        )


    prepared_subjects: list[
        dict[str, object]
    ] = []


    attendance_values: list[
        float
    ] = []

    internal_values: list[
        float
    ] = []

    assignment_values: list[
        float
    ] = []

    quiz_values: list[
        float
    ] = []


    for subject_record in (
        academic_record.subject_records
    ):
        subject_code = (
            subject_record
            .subject_code
            .upper()
        )

        catalog_subject = (
            catalog_by_code[
                subject_code
            ]
        )


        attendance_values.append(
            subject_record.attendance
        )

        internal_values.append(
            subject_record.internal_marks
        )

        assignment_values.append(
            subject_record.assignment_score
        )

        quiz_values.append(
            subject_record.quiz_score
        )


        prepared_subjects.append(
            {
                "subject_code":
                    subject_code,

                "subject_name":
                    catalog_subject[
                        "name"
                    ],

                "credits":
                    float(
                        catalog_subject[
                            "credits"
                        ]
                    ),

                "attendance":
                    subject_record
                    .attendance,

                "internal_marks":
                    subject_record
                    .internal_marks,

                "assignment_score":
                    subject_record
                    .assignment_score,

                "quiz_score":
                    subject_record
                    .quiz_score,

                "included_in_ml":
                    True,
            }
        )


    if not prepared_subjects:
        raise HTTPException(
            status_code=400,
            detail=(
                "At least one standard "
                "subject record is required."
            ),
        )


    averages = {
        "attendance": (
            sum(attendance_values)
            / len(attendance_values)
        ),

        "internal_marks": (
            sum(internal_values)
            / len(internal_values)
        ),

        "assignment_score": (
            sum(assignment_values)
            / len(assignment_values)
        ),

        "quiz_score": (
            sum(quiz_values)
            / len(quiz_values)
        ),
    }


    averages = {
        key: round(
            value,
            2,
        )
        for key, value
        in averages.items()
    }


    return (
        averages,
        prepared_subjects,
    )


def _prepare_academic_values(
    academic_record:
        AcademicRecordCreate,

    student: Student,
) -> tuple[
    dict[str, float],
    list[dict[str, object]],
]:
        # Subject-wise data is the new
    # preferred workflow.

    if academic_record.subject_records:
        return (
            _calculate_subject_averages(
                academic_record,
                student,
            )
        )


    # Legacy mode keeps the current
    # frontend working until we replace
    # it with subject-wise inputs.

    return (
        {
            "attendance":
                float(
                    academic_record
                    .attendance
                ),

            "internal_marks":
                float(
                    academic_record
                    .internal_marks
                ),

            "assignment_score":
                float(
                    academic_record
                    .assignment_score
                ),

            "quiz_score":
                float(
                    academic_record
                    .quiz_score
                ),
        },
        [],
    )


def create_academic_record(
    db: Session,
    academic_record:
        AcademicRecordCreate,
):
    student = (
        _get_student_or_404(
            db,
            academic_record.student_id,
        )
    )


    existing_record = (
        db.query(AcademicRecord)
        .filter(
            AcademicRecord.student_id
            == academic_record.student_id,

            AcademicRecord.semester
            == academic_record.semester,
        )
        .first()
    )


    if existing_record:
        raise HTTPException(
            status_code=400,
            detail=(
                "Academic record already "
                "exists for this student "
                "and semester."
            ),
        )


    (
        aggregate_values,
        prepared_subjects,
    ) = _prepare_academic_values(
        academic_record,
        student,
    )


    previous_gpa = (
        None
        if academic_record.semester
        == 1
        else academic_record.previous_gpa
    )


    db_record = AcademicRecord(
        student_id=(
            academic_record.student_id
        ),

        attendance=(
            aggregate_values[
                "attendance"
            ]
        ),

        internal_marks=(
            aggregate_values[
                "internal_marks"
            ]
        ),

        assignment_score=(
            aggregate_values[
                "assignment_score"
            ]
        ),

        quiz_score=(
            aggregate_values[
                "quiz_score"
            ]
        ),

        previous_gpa=(
            previous_gpa
        ),

        semester=(
            academic_record.semester
        ),

        gender=(
            academic_record.gender
        ),
    )


    try:
        db.add(
            db_record
        )

        db.flush()


        for subject_data in (
            prepared_subjects
        ):
            db.add(
                SubjectAcademicRecord(
                    academic_record_id=(
                        db_record.id
                    ),
                    **subject_data,
                )
            )


        db.commit()

        db.refresh(
            db_record
        )


    except Exception:
        db.rollback()
        raise


    return get_academic_record(
        db,
        db_record.id,
    )


def update_academic_record(
    db: Session,
    record_id: int,
    academic_record:
        AcademicRecordCreate,
):
    db_record = (
        db.query(AcademicRecord)
        .options(
            selectinload(
                AcademicRecord
                .subject_records
            )
        )
        .filter(
            AcademicRecord.id
            == record_id
        )
        .first()
    )


    if db_record is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Academic record "
                "not found."
            ),
        )


    student = (
        _get_student_or_404(
            db,
            academic_record.student_id,
        )
    )


    duplicate_record = (
        db.query(AcademicRecord)
        .filter(
            AcademicRecord.student_id
            == academic_record.student_id,

            AcademicRecord.semester
            == academic_record.semester,

            AcademicRecord.id
            != record_id,
        )
        .first()
    )


    if duplicate_record:
        raise HTTPException(
            status_code=400,
            detail=(
                "Another academic record "
                "already exists for this "
                "student and semester."
            ),
        )


    (
        aggregate_values,
        prepared_subjects,
    ) = _prepare_academic_values(
        academic_record,
        student,
    )


    db_record.student_id = (
        academic_record.student_id
    )

    db_record.attendance = (
        aggregate_values[
            "attendance"
        ]
    )

    db_record.internal_marks = (
        aggregate_values[
            "internal_marks"
        ]
    )

    db_record.assignment_score = (
        aggregate_values[
            "assignment_score"
        ]
    )

    db_record.quiz_score = (
        aggregate_values[
            "quiz_score"
        ]
    )

    db_record.previous_gpa = (
        None
        if academic_record.semester
        == 1
        else academic_record.previous_gpa
    )

    db_record.semester = (
        academic_record.semester
    )

    db_record.gender = (
        academic_record.gender
    )


    try:
        if academic_record.subject_records:
            db_record.subject_records.clear()

            db.flush()


            for subject_data in (
                prepared_subjects
            ):
                db_record.subject_records.append(
                    SubjectAcademicRecord(
                        **subject_data
                    )
                )


        db.commit()

        db.refresh(
            db_record
        )


    except Exception:
        db.rollback()
        raise


    return get_academic_record(
        db,
        record_id,
    )


def get_latest_academic_record(
    db: Session,
    student_id: int,
):
    record = (
        db.query(AcademicRecord)
        .options(
            selectinload(
                AcademicRecord.subject_records
            )
        )
        .filter(
            AcademicRecord.student_id
            == student_id
        )
        .order_by(
            AcademicRecord
            .created_at
            .desc()
        )
        .first()
    )


    if record is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Academic record "
                "not found."
            ),
        )


    return record