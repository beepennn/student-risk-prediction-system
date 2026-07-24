from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy import extract
from datetime import datetime

from app.models.student import Student
from app.models.academic_record import AcademicRecord
from app.models.prediction import Prediction
from app.models.intervention import Intervention
from app.models.user import User

from app.services.prediction_service import get_latest_prediction
from app.services.recommendation_service import get_latest_recommendation

def get_student_profile(
    db: Session,
    student_id: int,
):
    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    academic_records = (
        db.query(AcademicRecord)
        .filter(
            AcademicRecord.student_id == student_id
        )
        .order_by(
            AcademicRecord.semester.desc()
        )
        .all()
    )

    latest_prediction = get_latest_prediction(
        db,
        student_id,
    )

    latest_recommendation = None

    if latest_prediction:
        latest_recommendation = get_latest_recommendation(
            db,
            latest_prediction.id,
        )

    interventions = (
        db.query(Intervention)
        .filter(
            Intervention.student_id == student_id
        )
        .order_by(
            Intervention.id.desc()
        )
        .all()
    )

    return {
        "student": student,
        "academic_records": academic_records,
        "latest_prediction": latest_prediction,
        "latest_recommendation": latest_recommendation,
        "interventions": interventions,
    }

def get_teacher_dashboard(
    db: Session,
    teacher_id: int,
):
    students = db.query(Student).all()

    total_students = len(students)

    high_risk_students = []
    medium_risk_students = []
    low_risk_students = []

    students_without_intervention = []

    for student in students:

        prediction = get_latest_prediction(
            db,
            student.id,
        )

        if prediction is None:
            continue

        student_info = {
            "student_id": student.id,
            "student_name": (
                student.user.full_name
                if student.user
                else None
            ),
            "roll_number": student.roll_number,
            "department": student.department,
            "semester": student.semester,
            "risk_level": prediction.risk_level,
            "prediction_date": prediction.prediction_date,
        }

        if prediction.risk_level == "High":
            high_risk_students.append(student_info)

        elif prediction.risk_level == "Medium":
            medium_risk_students.append(student_info)

        else:
            low_risk_students.append(student_info)

        intervention = (
            db.query(Intervention)
            .filter(
                Intervention.student_id == student.id
            )
            .first()
        )

        if intervention is None:
            students_without_intervention.append(
                {
                    "student_id": student.id,
                    "student_name": (
                        student.user.full_name
                        if student.user
                        else None
                    ),
                    "roll_number": student.roll_number,
                    "department": student.department,
                    "semester": student.semester,
                }
            )

    total_interventions = (
        db.query(Intervention)
        .filter(
            Intervention.teacher_id == teacher_id
        )
        .count()
    )

    recent_interventions = (
        db.query(
            Intervention,
            Student,
            User,
        )
        .join(
            Student,
            Intervention.student_id == Student.id,
        )
        .join(
            User,
            Student.user_id == User.id,
        )
        .order_by(
            Intervention.id.desc()
        )
        .limit(5)
        .all()
    )

    recent_intervention_list = []

    for intervention, student, user in recent_interventions:
        recent_intervention_list.append(
            {
                "id": intervention.id,
                "student_id": student.id,
                "student_name": user.full_name,
                "roll_number": student.roll_number,
                "department": student.department,
                "semester": student.semester,
                "action_taken": intervention.action_taken,
                "remarks": intervention.remarks,
                "date": intervention.intervention_date,
            }
        )

    return {
        "summary": {
            "total_students": total_students,
            "high_risk_students": len(high_risk_students),
            "medium_risk_students": len(medium_risk_students),
            "low_risk_students": len(low_risk_students),
            "total_interventions": total_interventions,
        },

        "high_risk_students": high_risk_students,

        "medium_risk_students": medium_risk_students,

        "low_risk_students": low_risk_students,

        "students_without_intervention": students_without_intervention,

        "recent_interventions": recent_intervention_list,
    }

def get_teacher_interventions(
    db: Session,
    teacher_id: int,
):
    interventions = (
        db.query(Intervention, Student)
        .join(
            Student,
            Intervention.student_id == Student.id,
        )
        .filter(
            Intervention.teacher_id == teacher_id
        )
        .order_by(
            Intervention.id.desc()
        )
        .all()
    )

    results = []

    for intervention, student in interventions:
        results.append(
            {
                "id": intervention.id,
                "student_id": student.id,
                "student_name": student.user.full_name,
                "action_taken": intervention.action_taken,
                "remarks": intervention.remarks,
            }
        )

    return results

def search_students(
    db: Session,
    query: str,
):
    students = (
        db.query(Student)
        .join(User, User.id == Student.user_id)
        .filter(
            or_(
                Student.roll_number.ilike(f"%{query}%"),
                User.full_name.ilike(f"%{query}%"),
                Student.department.ilike(f"%{query}%"),
            )
        )
        .all()
    )

    return [
        {
            "student_id": student.id,
            "roll_number": student.roll_number,
            "student_name": student.user.full_name,
            "department": student.department,
            "semester": student.semester,
            "status": student.status,
        }
        for student in students
    ]

def get_teacher_students(
    db: Session,
    risk_level: str | None = None,
    semester: int | None = None,
    department: str | None = None,
    skip: int = 0,
    limit: int = 20,
):
    query = db.query(Student)

    if semester is not None:
        query = query.filter(Student.semester == semester)

    if department:
        query = query.filter(
            Student.department.ilike(f"%{department}%")
        )

    students = (
        query
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []

    for student in students:

        prediction = get_latest_prediction(
            db,
            student.id,
        )

        if risk_level and prediction:
            if prediction.risk_level != risk_level:
                continue

        if risk_level and prediction is None:
            continue

        results.append(
            {
                "student_id": student.id,
                "student_name": (
                    student.user.full_name
                    if student.user
                    else None
                ),
                "roll_number": student.roll_number,
                "department": student.department,
                "semester": student.semester,
                "status": student.status,
                "risk_level": (
                    prediction.risk_level
                    if prediction
                    else None
                ),
            }
        )

    return results

def get_teacher_analytics(
    db: Session,
    teacher_id: int,
):
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year

    total_interventions = (
        db.query(Intervention)
        .filter(
            Intervention.teacher_id == teacher_id
        )
        .count()
    )

    interventions_this_month = (
        db.query(Intervention)
        .filter(
            Intervention.teacher_id == teacher_id,
            extract(
                "month",
                Intervention.intervention_date,
            ) == current_month,
            extract(
                "year",
                Intervention.intervention_date,
            ) == current_year,
        )
        .count()
    )

    students_handled = (
        db.query(Intervention.student_id)
        .filter(
            Intervention.teacher_id == teacher_id
        )
        .distinct()
        .count()
    )

    dashboard = get_teacher_dashboard(
        db,
        teacher_id,
    )

    return {
        "total_interventions": total_interventions,
        "interventions_this_month": interventions_this_month,
        "students_handled": students_handled,
        "high_risk_students": dashboard["summary"]["high_risk_students"],
        "medium_risk_students": dashboard["summary"]["medium_risk_students"],
        "low_risk_students": dashboard["summary"]["low_risk_students"],
        "students_without_intervention": len(
            dashboard["students_without_intervention"]
        ),
    }