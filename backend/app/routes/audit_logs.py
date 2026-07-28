from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import Session

from app.core.dependencies import (
    require_admin,
)

from app.database.connection import (
    SessionLocal,
)

from app.models.user import User

from app.schemas.audit_log import (
    AuditLogResponse,
)

from app.services.audit_service import (
    get_audit_logs,
)


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get(
    "/",
    response_model=list[
        AuditLogResponse
    ],
)
def read_audit_logs(
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=500,
    ),
    action: str | None = None,
    entity: str | None = None,
    user_id: int | None = None,
    search: str | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):
    return get_audit_logs(
        db=db,
        skip=skip,
        limit=limit,
        action=action,
        entity=entity,
        user_id=user_id,
        search=search,
        sort_by=sort_by,
        order=order,
    )