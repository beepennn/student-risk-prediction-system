from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.intervention import Intervention
from app.schemas.intervention import InterventionCreate

from app.services.audit_service import create_audit_log
from app.core.api_response import success_response

def get_interventions(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "id",
    order: str = "desc",
    teacher_id: int | None = None,
    student_id: int | None = None,
):
    query = db.query(Intervention)

    if teacher_id is not None:
        query = query.filter(
            Intervention.teacher_id == teacher_id
        )

    if student_id is not None:
        query = query.filter(
            Intervention.student_id == student_id
        )

    sort_column = getattr(
        Intervention,
        sort_by,
        Intervention.id,
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


def get_intervention(
    db: Session,
    intervention_id: int,
):
    intervention = (
        db.query(Intervention)
        .filter(Intervention.id == intervention_id)
        .first()
    )

    if intervention is None:
        raise HTTPException(
            status_code=404,
            detail="Intervention not found.",
        )

    return intervention


def create_intervention(
    db: Session,
    intervention: InterventionCreate,
    admin_id: int,
):
    db_intervention = Intervention(
        **intervention.model_dump()
    )

    db.add(db_intervention)
    db.commit()
    db.refresh(db_intervention)

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="CREATE",
        entity="Intervention",
        entity_id=db_intervention.id,
    )

    return db_intervention

def get_student_interventions(
    db: Session,
    student_id: int,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "id",
    order: str = "desc",
):
    query = (
        db.query(Intervention)
        .filter(
            Intervention.student_id == student_id
        )
    )

    sort_column = getattr(
        Intervention,
        sort_by,
        Intervention.id,
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


def create_teacher_intervention(
    db: Session,
    teacher_id: int,
    student_id: int,
    action_taken: str,
    remarks: str,
):
    intervention = Intervention(
        student_id=student_id,
        teacher_id=teacher_id,
        action_taken=action_taken,
        remarks=remarks,
    )

    db.add(intervention)
    db.commit()
    db.refresh(intervention)

    return intervention

def update_intervention(
    db: Session,
    intervention_id: int,
    intervention: InterventionCreate,
    admin_id: int,
):
    db_intervention = (
        db.query(Intervention)
        .filter(
            Intervention.id == intervention_id
        )
        .first()
    )

    if db_intervention is None:
        raise HTTPException(
            status_code=404,
            detail="Intervention not found.",
        )

    for key, value in intervention.model_dump().items():
        setattr(db_intervention, key, value)

    db.commit()
    db.refresh(db_intervention)

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="UPDATE",
        entity="Intervention",
        entity_id=db_intervention.id,
    )

    return db_intervention

def delete_intervention(
    db: Session,
    intervention_id: int,
    admin_id: int,
):
    intervention = (
        db.query(Intervention)
        .filter(
            Intervention.id == intervention_id
        )
        .first()
    )

    if intervention is None:
        raise HTTPException(
            status_code=404,
            detail="Intervention not found.",
        )

    db.delete(intervention)
    db.commit()

    create_audit_log(
        db=db,
        user_id=admin_id,
        action="DELETE",
        entity="Intervention",
        entity_id=intervention_id,
    )

    return success_response(
        message="Intervention deleted successfully."
    )

def get_intervention_statistics(db: Session):
    total = db.query(Intervention).count()

    teacher_count = (
        db.query(
            Intervention.teacher_id,
            func.count(Intervention.id)
        )
        .group_by(Intervention.teacher_id)
        .all()
    )

    student_count = (
        db.query(
            Intervention.student_id,
            func.count(Intervention.id)
        )
        .group_by(Intervention.student_id)
        .all()
    )

    return {
        "total_interventions": total,
        "teacher_statistics": [
            {
                "teacher_id": teacher_id,
                "interventions": count,
            }
            for teacher_id, count in teacher_count
        ],
        "student_statistics": [
            {
                "student_id": student_id,
                "interventions": count,
            }
            for student_id, count in student_count
        ],
    }