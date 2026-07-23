from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    user_id: int,
    action: str,
    entity: str,
    entity_id: int,
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity=entity,
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
):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )