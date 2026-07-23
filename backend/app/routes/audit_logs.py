from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.core.dependencies import require_admin
from app.models.user import User
from app.services.audit_service import get_audit_logs

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


@router.get("/")
def read_audit_logs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_audit_logs(
        db,
        skip,
        limit,
    )