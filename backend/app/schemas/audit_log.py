from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    user_id: int

    user_name: str | None = None
    user_email: str | None = None

    action: str
    entity: str
    entity_id: int

    created_at: datetime | None = None