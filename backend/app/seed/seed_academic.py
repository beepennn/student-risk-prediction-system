from app.database.connection import SessionLocal
from app.models.student import Student
from app.models.academic_record import AcademicRecord


def seed_academic_records():
    db = SessionLocal()

    students = db.query(Student).all()

    for student in students:

        existing = (
            db.query(AcademicRecord)
            .filter(
                AcademicRecord.student_id == student.id,
                AcademicRecord.semester == student.semester,
            )
            .first()
        )

        if existing:
            continue

        # Different values for each student
        if student.roll_number == "CS001":
            attendance = 92
            internal_marks = 85
            assignment_score = 88
            quiz_score = 90
            previous_gpa = 3.80

        elif student.roll_number == "CS002":
            attendance = 74
            internal_marks = 68
            assignment_score = 72
            quiz_score = 70
            previous_gpa = 3.10

        else:
            attendance = 58
            internal_marks = 52
            assignment_score = 60
            quiz_score = 55
            previous_gpa = 2.45

        record = AcademicRecord(
            student_id=student.id,
            attendance=attendance,
            internal_marks=internal_marks,
            assignment_score=assignment_score,
            quiz_score=quiz_score,
            previous_gpa=previous_gpa,
            semester=student.semester,
        )

        db.add(record)

    db.commit()
    db.close()

    print("Academic records seeded successfully.")