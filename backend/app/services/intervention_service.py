from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.intervention import Intervention
from app.schemas.intervention import InterventionCreate


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
):
    db_intervention = Intervention(
        **intervention.model_dump()
    )

    db.add(db_intervention)
    db.commit()
    db.refresh(db_intervention)

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