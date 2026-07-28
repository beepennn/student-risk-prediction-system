from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.intervention import Intervention
from app.models.prediction import Prediction
from app.models.student import Student


VALID_RISK_LEVELS = {
    "High Risk",
    "Medium Risk",
    "Low Risk",
}


def get_latest_prediction_query(
    db: Session,
):
    latest_prediction_ids = (
        db.query(
            func.max(Prediction.id)
        )
        .group_by(
            Prediction.student_id
        )
    )

    return (
        db.query(Prediction)
        .filter(
            Prediction.id.in_(
                latest_prediction_ids
            )
        )
    )


def get_dashboard_summary(
    db: Session,
):
    total_students = (
        db.query(Student).count()
    )

    latest_predictions = (
        get_latest_prediction_query(db)
        .all()
    )

    summary = {
        "total_students": total_students,
        "high_risk": 0,
        "medium_risk": 0,
        "low_risk": 0,
    }

    for prediction in latest_predictions:
        risk_level = (
            prediction.risk_level
            or ""
        ).strip()

        if risk_level == "High Risk":
            summary["high_risk"] += 1

        elif risk_level == "Medium Risk":
            summary["medium_risk"] += 1

        elif risk_level == "Low Risk":
            summary["low_risk"] += 1

    return summary


def get_risk_students(
    db: Session,
    risk_level: str,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "prediction_date",
    order: str = "desc",
):
    if risk_level not in VALID_RISK_LEVELS:
        return []

    query = (
        get_latest_prediction_query(db)
        .filter(
            Prediction.risk_level
            == risk_level
        )
    )

    allowed_sort_columns = {
        "id": Prediction.id,
        "prediction_date": (
            Prediction.prediction_date
        ),
        "confidence": (
            Prediction.confidence
        ),
        "high_probability": (
            Prediction.high_probability
        ),
    }

    sort_column = (
        allowed_sort_columns.get(
            sort_by,
            Prediction.prediction_date,
        )
    )

    if order.lower() == "asc":
        query = query.order_by(
            sort_column.asc()
        )
    else:
        query = query.order_by(
            sort_column.desc()
        )

    predictions = (
        query.offset(skip)
        .limit(limit)
        .all()
    )

    return [
        format_prediction_report(
            prediction
        )
        for prediction in predictions
        if prediction.student is not None
    ]


def get_high_risk_students(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "prediction_date",
    order: str = "desc",
):
    return get_risk_students(
        db=db,
        risk_level="High Risk",
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )


def get_medium_risk_students(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "prediction_date",
    order: str = "desc",
):
    return get_risk_students(
        db=db,
        risk_level="Medium Risk",
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )


def get_low_risk_students(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "prediction_date",
    order: str = "desc",
):
    return get_risk_students(
        db=db,
        risk_level="Low Risk",
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )


def get_students_by_department(
    db: Session,
):
    departments = (
        db.query(
            Student.department,
            func.count(Student.id),
        )
        .group_by(
            Student.department
        )
        .order_by(
            Student.department.asc()
        )
        .all()
    )

    return [
        {
            "department": (
                department
                or "Not Specified"
            ),
            "total_students": count,
        }
        for department, count
        in departments
    ]


def get_students_by_semester(
    db: Session,
):
    semesters = (
        db.query(
            Student.semester,
            func.count(Student.id),
        )
        .group_by(
            Student.semester
        )
        .order_by(
            Student.semester.asc()
        )
        .all()
    )

    return [
        {
            "semester": semester,
            "total_students": count,
        }
        for semester, count
        in semesters
    ]


def get_latest_predictions(
    db: Session,
):
    latest_predictions = (
        get_latest_prediction_query(db)
        .order_by(
            Prediction
            .prediction_date
            .desc()
        )
        .all()
    )

    return [
        format_prediction_report(
            prediction
        )
        for prediction
        in latest_predictions
        if prediction.student is not None
    ]


def get_intervention_summary(
    db: Session,
):
    total_interventions = (
        db.query(Intervention).count()
    )

    return {
        "total_interventions": (
            total_interventions
        )
    }


def format_prediction_report(
    prediction: Prediction,
):
    student = prediction.student

    full_name = "Student"

    if (
        student
        and student.user
        and student.user.full_name
    ):
        full_name = (
            student.user.full_name
        )

    return {
        "student_id": student.id,
        "full_name": full_name,
        "roll_number": (
            student.roll_number
        ),
        "department": (
            student.department
        ),
        "semester": (
            student.semester
        ),
        "risk_level": (
            prediction.risk_level
        ),
        "low_probability": float(
            prediction.low_probability
            or 0
        ),
        "medium_probability": float(
            prediction.medium_probability
            or 0
        ),
        "high_probability": float(
            prediction.high_probability
            or 0
        ),
        "prediction_date": (
            prediction.prediction_date
        ),
    }