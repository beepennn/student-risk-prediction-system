from sqlalchemy import Column, Integer, String, DateTime

from app.database.base import Base


class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    token = Column(
        String,
        unique=True,
        nullable=False,
    )

    expires_at = Column(
        DateTime,
        nullable=False,
    )