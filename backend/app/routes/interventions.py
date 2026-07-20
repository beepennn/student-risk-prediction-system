from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.schemas.intervention import (
    InterventionCreate,
    InterventionResponse,
)
from app.services.intervention_service import (
    get_interventions,
    get_intervention,
    create_intervention,
)

router = APIRouter(
    prefix="/interventions",
    tags=["Interventions"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[InterventionResponse])
def read_interventions(
    db: Session = Depends(get_db),
):
    return get_interventions(db)


@router.get("/{intervention_id}", response_model=InterventionResponse)
def read_intervention(
    intervention_id: int,
    db: Session = Depends(get_db),
):
    return get_intervention(db, intervention_id)


@router.post("/", response_model=InterventionResponse)
def add_intervention(
    intervention: InterventionCreate,
    db: Session = Depends(get_db),
):
    return create_intervention(db, intervention)