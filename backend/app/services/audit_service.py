from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User


def create_audit_log(
    db: Session,
    user_id: int,
    action: str,
    entity: str,
    entity_id: int,
):
    log = AuditLog(
        user_id=user_id,
        action=action.strip().upper(),
        entity=entity.strip(),
        entity_id=entity_id,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


def get_audit_logs(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    action: str | None = None,
    entity: str | None = None,
    user_id: int | None = None,
    search: str | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
):
    query = (
        db.query(
            AuditLog,
            User,
        )
        .outerjoin(
            User,
            User.id == AuditLog.user_id,
        )
    )

    if action:
        query = query.filter(
            AuditLog.action.ilike(
                action.strip()
            )
        )

    if entity:
        query = query.filter(
            AuditLog.entity.ilike(
                entity.strip()
            )
        )

    if user_id is not None:
        query = query.filter(
            AuditLog.user_id == user_id
        )

    if search and search.strip():
        search_pattern = (
            f"%{search.strip()}%"
        )

        query = query.filter(
            or_(
                AuditLog.action.ilike(
                    search_pattern
                ),
                AuditLog.entity.ilike(
                    search_pattern
                ),
                User.full_name.ilike(
                    search_pattern
                ),
                User.email.ilike(
                    search_pattern
                ),
            )
        )

    allowed_sort_columns = {
        "id": AuditLog.id,
        "created_at": AuditLog.created_at,
        "user_id": AuditLog.user_id,
        "action": AuditLog.action,
        "entity": AuditLog.entity,
    }

    sort_column = allowed_sort_columns.get(
        sort_by,
        AuditLog.created_at,
    )

    if order.lower() == "asc":
        query = query.order_by(
            sort_column.asc()
        )
    else:
        query = query.order_by(
            sort_column.desc()
        )

    records = (
        query.offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": audit_log.id,
            "user_id": audit_log.user_id,
            "user_name": (
                user.full_name
                if user
                else None
            ),
            "user_email": (
                user.email
                if user
                else None
            ),
            "action": audit_log.action,
            "entity": audit_log.entity,
            "entity_id": audit_log.entity_id,
            "created_at": audit_log.created_at,
        }
        for audit_log, user in records
    ]