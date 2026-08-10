from datetime import datetime

from sqlalchemy.orm import Session

from app.models.token_blacklist import TokenBlacklist


def blacklist_token(
    db: Session,
    token: str,
    expires_at: datetime,
):
    blacklisted_token = TokenBlacklist(
        token=token,
        expires_at=expires_at,
    )

    db.add(blacklisted_token)
    db.commit()
    db.refresh(blacklisted_token)

    return blacklisted_token


def is_token_blacklisted(
    db: Session,
    token: str,
):
    return (
        db.query(TokenBlacklist)
        .filter(TokenBlacklist.token == token)
        .first()
        is not None
    )