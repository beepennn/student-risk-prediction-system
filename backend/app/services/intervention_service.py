from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.intervention import Intervention
from app.schemas.intervention import InterventionCreate

from app.services.audit_service import create_audit_log

def get_interventions(db: Session):
    return db.query(Intervention).all()


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
):
    return (
        db.query(Intervention)
        .filter(
            Intervention.student_id == student_id
        )
        .order_by(
            Intervention.id.desc()
        )
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

    return {
        "message": "Intervention deleted successfully."
    }

