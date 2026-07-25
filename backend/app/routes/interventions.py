from fastapi import APIRouter, Depends, Body
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
    get_student_interventions,
    update_intervention,
    delete_intervention,
    get_intervention_statistics,
)

from app.core.dependencies import (
    require_teacher,
    require_admin,
)

from app.models.user import User

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


@router.get(
    "/",
    response_model=list[InterventionResponse],
)
def read_interventions(
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "id",
    order: str = "desc",
    teacher_id: int | None = None,
    student_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_interventions(
        db=db,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
        teacher_id=teacher_id,
        student_id=student_id,
    )

@router.get("/statistics")
def intervention_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_intervention_statistics(db)

@router.get(
    "/student/{student_id}",
    response_model=list[InterventionResponse],
)
def read_student_interventions(
    student_id: int,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "id",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_student_interventions(
        db=db,
        student_id=student_id,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )


@router.get(
    "/{intervention_id}",
    response_model=InterventionResponse,
)
def read_intervention(
    intervention_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return get_intervention(
        db,
        intervention_id,
    )


@router.post(
    "/",
    response_model=InterventionResponse,
)
def add_intervention(
    intervention: InterventionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_intervention(
        db,
        intervention,
        current_user.id,
    )


@router.put("/{intervention_id}")
def edit_intervention(
    intervention_id: int,
    intervention: InterventionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return update_intervention(
        db,
        intervention_id,
        intervention,
        current_user.id,
    )

@router.delete("/{intervention_id}")
def remove_intervention(
    intervention_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return delete_intervention(
        db,
        intervention_id,
        current_user.id,
    )
