from sqlalchemy.orm import Session

from app.models.intervention import Intervention
from app.schemas.intervention import InterventionCreate


def get_interventions(db: Session):
    return db.query(Intervention).all()


def get_intervention(db: Session, intervention_id: int):
    return (
        db.query(Intervention)
        .filter(Intervention.id == intervention_id)
        .first()
    )


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