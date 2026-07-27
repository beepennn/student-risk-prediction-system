from datetime import datetime

from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.schemas.recommendation import RecommendationCreate
from app.models.prediction import Prediction
from app.models.student import Student

from app.services.audit_service import create_audit_log
from app.core.api_response import success_response


def get_recommendations(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    priority: str | None = None,
    semester: int | None = None,
    department: str | None = None,
    sort_by: str = "id",
    order: str = "desc",
):
    query = (
        db.query(Recommendation)
        .join(Prediction)
        .join(Student)
    )

    if priority:
        query = query.filter(
            Recommendation.priority == priority
        )

    if semester is not None:
        query = query.filter(
            Student.semester == semester
        )

    if department:
        query = query.filter(
            Student.department.ilike(
                f"%{department}%"
            )
        )

    sort_column = getattr(
        Recommendation,
        sort_by,
        Recommendation.id,
    )

    if order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    return (
        query.offset(skip)
        .limit(limit)
        .all()
    )


def get_recommendation(
    db: Session,
    recommendation_id: int,
):
    recommendation = (
        db.query(Recommendation)
        .filter(Recommendation.id == recommendation_id)
        .first()
    )

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail="Recommendation not found.",
        )

    return recommendation


def create_recommendation(
    db: Session,
    recommendation: RecommendationCreate,
    admin_id: int,
):
    db_recommendation = Recommendation(
        **recommendation.model_dump()
    )

    db.add(db_recommendation)
    db.commit()
    db.refresh(db_recommendation)

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="CREATE",
        entity="Recommendation",
        entity_id=db_recommendation.id,
    )

    return db_recommendation


def generate_recommendation(
    db: Session,
    prediction,
):
    if prediction.risk_level == "High Risk":
        title = "Immediate Intervention Required"
        description = (
            "Schedule counseling sessions and assign a mentor immediately."
        )
        priority = "High"

    elif prediction.risk_level == "Medium Risk":
        title = "Academic Monitoring Required"
        description = (
            "Monitor academic performance weekly and provide additional support."
        )
        priority = "Medium"

    else:
        title = "Maintain Good Performance"
        description = (
            "Continue regular monitoring and encourage consistent performance."
        )
        priority = "Low"

    recommendation = Recommendation(
        prediction_id=prediction.id,
        title=title,
        description=description,
        priority=priority,
        status="Pending",
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return recommendation


def get_latest_recommendation(
    db: Session,
    prediction_id: int,
):
    return (
        db.query(Recommendation)
        .filter(
            Recommendation.prediction_id == prediction_id
        )
        .order_by(
            Recommendation.id.desc()
        )
        .first()
    )


def get_student_recommendations(
    db: Session,
    student_id: int,
):
    return (
        db.query(Recommendation)
        .join(Prediction)
        .filter(
            Prediction.student_id == student_id
        )
        .order_by(
            Recommendation.id.desc()
        )
        .all()
    )


def get_admin_recommendations(
    db: Session,
    priority: str | None = None,
    semester: int | None = None,
    department: str | None = None,
    skip: int = 0,
    limit: int = 20,
):
    query = (
        db.query(Recommendation)
        .join(Prediction)
        .join(Student)
    )

    if priority:
        query = query.filter(
            Recommendation.priority == priority
        )

    if semester is not None:
        query = query.filter(
            Student.semester == semester
        )

    if department:
        query = query.filter(
            Student.department.ilike(
                f"%{department}%"
            )
        )

    return (
        query.order_by(
            Recommendation.id.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_recommendation(
    db: Session,
    recommendation_id: int,
    recommendation: RecommendationCreate,
    admin_id: int,
):
    db_recommendation = (
        db.query(Recommendation)
        .filter(
            Recommendation.id == recommendation_id
        )
        .first()
    )

    if db_recommendation is None:
        raise HTTPException(
            status_code=404,
            detail="Recommendation not found.",
        )

    for key, value in recommendation.model_dump().items():
        setattr(db_recommendation, key, value)

    db.commit()
    db.refresh(db_recommendation)

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="UPDATE",
        entity="Recommendation",
        entity_id=db_recommendation.id,
    )

    return db_recommendation


def delete_recommendation(
    db: Session,
    recommendation_id: int,
    admin_id: int,
):
    recommendation = (
        db.query(Recommendation)
        .filter(
            Recommendation.id == recommendation_id
        )
        .first()
    )

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail="Recommendation not found.",
        )

    recommendation_id_deleted = recommendation.id

    db.delete(recommendation)
    db.commit()

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="DELETE",
        entity="Recommendation",
        entity_id=recommendation_id_deleted,
    )

    return success_response(
        message="Recommendation deleted successfully."
    )

def update_recommendation_status(
    db: Session,
    recommendation_id: int,
    status: str,
):
    recommendation = (
        db.query(Recommendation)
        .filter(
            Recommendation.id == recommendation_id
        )
        .first()
    )

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail="Recommendation not found.",
        )

    recommendation.status = status

    if status == "Completed":
        recommendation.completed_at = datetime.utcnow()
    else:
        recommendation.completed_at = None

    db.commit()
    db.refresh(recommendation)

    return recommendation

def get_recommendation_statistics(
    db: Session,
):
    total = db.query(Recommendation).count()

    pending = (
        db.query(Recommendation)
        .filter(
            Recommendation.status == "Pending"
        )
        .count()
    )

    completed = (
        db.query(Recommendation)
        .filter(
            Recommendation.status == "Completed"
        )
        .count()
    )

    high_priority = (
        db.query(Recommendation)
        .filter(
            Recommendation.priority == "High"
        )
        .count()
    )

    medium_priority = (
        db.query(Recommendation)
        .filter(
            Recommendation.priority == "Medium"
        )
        .count()
    )

    low_priority = (
        db.query(Recommendation)
        .filter(
            Recommendation.priority == "Low"
        )
        .count()
    )

    completion_rate = (
        (completed / total) * 100
        if total > 0
        else 0
    )

    return {
        "total": total,
        "pending": pending,
        "completed": completed,
        "high_priority": high_priority,
        "medium_priority": medium_priority,
        "low_priority": low_priority,
        "completion_rate": round(
            completion_rate,
            2,
        ),
    }