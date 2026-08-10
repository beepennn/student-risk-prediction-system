from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.intervention import Intervention
from app.models.notification import Notification
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.models.student import Student
from app.models.user import User


HIGH_RISK = "High Risk"
MEDIUM_RISK = "Medium Risk"
LOW_RISK = "Low Risk"


def normalize_risk_level(
    risk_level: str | None,
) -> str:
    """
    Convert old and current risk labels into one
    consistent format.
    """

    normalized = (
        str(risk_level or "")
        .strip()
        .lower()
    )

    if normalized in {
        "high",
        "high risk",
    }:
        return HIGH_RISK

    if normalized in {
        "medium",
        "medium risk",
    }:
        return MEDIUM_RISK

    if normalized in {
        "low",
        "low risk",
    }:
        return LOW_RISK

    return ""


def get_latest_predictions_by_student(
    db: Session,
) -> dict[int, Prediction]:
    """
    Return only the newest prediction row for
    each student.
    """

    latest_prediction_ids = (
        db.query(
            func.max(
                Prediction.id
            ).label(
                "prediction_id"
            )
        )
        .group_by(
            Prediction.student_id
        )
        .subquery()
    )

    predictions = (
        db.query(Prediction)
        .join(
            latest_prediction_ids,
            Prediction.id
            == latest_prediction_ids
            .c.prediction_id,
        )
        .all()
    )

    return {
        prediction.student_id: prediction
        for prediction in predictions
    }


def count_risk_levels(
    predictions: list[Prediction],
) -> dict[str, int]:
    counts = {
        "high": 0,
        "medium": 0,
        "low": 0,
    }

    for prediction in predictions:
        risk_level = (
            normalize_risk_level(
                prediction.risk_level
            )
        )

        if risk_level == HIGH_RISK:
            counts["high"] += 1

        elif risk_level == MEDIUM_RISK:
            counts["medium"] += 1

        elif risk_level == LOW_RISK:
            counts["low"] += 1

    return counts


def get_department_statistics(
    db: Session,
):
    departments = (
        db.query(
            Student.department
        )
        .distinct()
        .order_by(
            Student.department.asc()
        )
        .all()
    )

    latest_prediction_map = (
        get_latest_predictions_by_student(
            db
        )
    )

    results = []

    for (department,) in departments:
        students = (
            db.query(Student)
            .filter(
                Student.department
                == department
            )
            .all()
        )

        department_predictions = [
            latest_prediction_map[
                student.id
            ]
            for student in students
            if student.id
            in latest_prediction_map
        ]

        risk_counts = (
            count_risk_levels(
                department_predictions
            )
        )

        results.append(
            {
                "department": (
                    department
                    or "Not Specified"
                ),
                "total_students": len(
                    students
                ),
                "high_risk": (
                    risk_counts["high"]
                ),
                "medium_risk": (
                    risk_counts["medium"]
                ),
                "low_risk": (
                    risk_counts["low"]
                ),
            }
        )

    return results


def get_semester_statistics(
    db: Session,
):
    semesters = (
        db.query(
            Student.semester
        )
        .distinct()
        .order_by(
            Student.semester.asc()
        )
        .all()
    )

    latest_prediction_map = (
        get_latest_predictions_by_student(
            db
        )
    )

    results = []

    for (semester,) in semesters:
        students = (
            db.query(Student)
            .filter(
                Student.semester
                == semester
            )
            .all()
        )

        semester_predictions = [
            latest_prediction_map[
                student.id
            ]
            for student in students
            if student.id
            in latest_prediction_map
        ]

        risk_counts = (
            count_risk_levels(
                semester_predictions
            )
        )

        results.append(
            {
                "semester": semester,
                "total_students": len(
                    students
                ),
                "high_risk": (
                    risk_counts["high"]
                ),
                "medium_risk": (
                    risk_counts["medium"]
                ),
                "low_risk": (
                    risk_counts["low"]
                ),
            }
        )

    return results


def get_teacher_statistics(
    db: Session,
):
    teachers = (
        db.query(User)
        .filter(
            func.lower(
                User.role
            ) == "teacher"
        )
        .order_by(
            User.id.desc()
        )
        .all()
    )

    results = []

    for teacher in teachers:
        interventions = (
            db.query(Intervention)
            .filter(
                Intervention.teacher_id
                == teacher.id
            )
            .all()
        )

        unique_students = {
            intervention.student_id
            for intervention
            in interventions
        }

        results.append(
            {
                "teacher_id": (
                    teacher.id
                ),
                "teacher_name": (
                    teacher.full_name
                ),
                "email": (
                    teacher.email
                ),
                "total_interventions": (
                    len(interventions)
                ),
                "students_handled": (
                    len(unique_students)
                ),
            }
        )

    return results


def get_risk_trend(
    db: Session,
):
    latest_predictions = list(
        get_latest_predictions_by_student(
            db
        ).values()
    )

    total = len(
        latest_predictions
    )

    risk_counts = (
        count_risk_levels(
            latest_predictions
        )
    )

    high_percentage = (
        round(
            (
                risk_counts["high"]
                / total
            )
            * 100,
            2,
        )
        if total > 0
        else 0
    )

    medium_percentage = (
        round(
            (
                risk_counts["medium"]
                / total
            )
            * 100,
            2,
        )
        if total > 0
        else 0
    )

    low_percentage = (
        round(
            (
                risk_counts["low"]
                / total
            )
            * 100,
            2,
        )
        if total > 0
        else 0
    )

    return {
        "total_predictions": total,
        "high_risk_percentage": (
            high_percentage
        ),
        "medium_risk_percentage": (
            medium_percentage
        ),
        "low_risk_percentage": (
            low_percentage
        ),
    }


def get_system_activity(
    db: Session,
):
    return {
        "total_students": (
            db.query(Student)
            .count()
        ),
        "total_predictions": (
            db.query(Prediction)
            .count()
        ),
        "total_recommendations": (
            db.query(
                Recommendation
            )
            .count()
        ),
        "total_notifications": (
            db.query(
                Notification
            )
            .count()
        ),
        "total_interventions": (
            db.query(
                Intervention
            )
            .count()
        ),
    }


def get_latest_prediction_activity(
    db: Session,
) -> tuple[
    Prediction | None,
    object | None,
]:
    """
    Find the most recent Generate Prediction action.

    When no GENERATE audit event exists yet, use the
    newest saved prediction as a fallback.
    """

    generation_activity = (
        db.query(AuditLog)
        .filter(
            func.lower(
                AuditLog.action
            ) == "generate",
            func.lower(
                AuditLog.entity
            ) == "prediction",
        )
        .order_by(
            AuditLog.created_at.desc()
        )
        .first()
    )

    if generation_activity:
        prediction = (
            db.query(Prediction)
            .filter(
                Prediction.id
                == generation_activity
                .entity_id
            )
            .first()
        )

        if prediction:
            return (
                prediction,
                generation_activity
                .created_at,
            )

    latest_prediction = (
        db.query(Prediction)
        .order_by(
            Prediction
            .prediction_date
            .desc()
        )
        .first()
    )

    if latest_prediction:
        return (
            latest_prediction,
            latest_prediction
            .prediction_date,
        )

    return None, None


def get_admin_dashboard_summary(
    db: Session,
):
    total_students = (
        db.query(Student)
        .count()
    )

    total_teachers = (
        db.query(User)
        .filter(
            func.lower(
                User.role
            ) == "teacher"
        )
        .count()
    )

    total_predictions = (
        db.query(Prediction)
        .count()
    )

    total_recommendations = (
        db.query(
            Recommendation
        )
        .count()
    )

    total_notifications = (
        db.query(
            Notification
        )
        .count()
    )

    total_interventions = (
        db.query(
            Intervention
        )
        .count()
    )

    latest_prediction_map = (
        get_latest_predictions_by_student(
            db
        )
    )

    latest_predictions = list(
        latest_prediction_map.values()
    )

    risk_counts = (
        count_risk_levels(
            latest_predictions
        )
    )

    department_summary = (
        get_department_statistics(
            db
        )
    )

    semester_summary = (
        get_semester_statistics(
            db
        )
    )

    teacher_summary = (
        get_teacher_statistics(
            db
        )
    )

    (
        latest_prediction,
        latest_prediction_activity_date,
    ) = get_latest_prediction_activity(
        db
    )

    latest_intervention = (
        db.query(Intervention)
        .order_by(
            Intervention
            .intervention_date
            .desc()
        )
        .first()
    )

    return {
        "summary": {
            "total_students": (
                total_students
            ),
            "total_teachers": (
                total_teachers
            ),
            "total_predictions": (
                total_predictions
            ),
            "total_recommendations": (
                total_recommendations
            ),
            "total_notifications": (
                total_notifications
            ),
            "total_interventions": (
                total_interventions
            ),
        },

        "risk_distribution": {
            "high": (
                risk_counts["high"]
            ),
            "medium": (
                risk_counts["medium"]
            ),
            "low": (
                risk_counts["low"]
            ),
        },

        "department_summary": (
            department_summary
        ),

        "semester_summary": (
            semester_summary
        ),

        "teacher_summary": (
            teacher_summary
        ),

        "recent_activity": {
            "latest_prediction": (
                {
                    "student_id": (
                        latest_prediction
                        .student_id
                    ),
                    "risk_level": (
                        normalize_risk_level(
                            latest_prediction
                            .risk_level
                        )
                    ),
                    "date": (
                        latest_prediction_activity_date
                    ),
                }
                if latest_prediction
                else None
            ),

            "latest_intervention": (
                {
                    "student_id": (
                        latest_intervention
                        .student_id
                    ),
                    "teacher_id": (
                        latest_intervention
                        .teacher_id
                    ),
                    "date": (
                        latest_intervention
                        .intervention_date
                    ),
                }
                if latest_intervention
                else None
            ),
        },
    }