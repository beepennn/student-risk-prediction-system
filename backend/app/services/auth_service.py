import hashlib
import logging

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from html import escape
from urllib.parse import urlencode

from fastapi import (
    HTTPException,
    status,
)

from jose import jwt
from jose.exceptions import (
    ExpiredSignatureError,
    JWTError,
)

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
)

from app.core.config import settings

from app.core.security import (
    hash_password,
    verify_password,
)

from app.models.user import User

from app.services.email_service import (
    send_email,
)


logger = logging.getLogger(__name__)


def login_user(
    db: Session,
    email: str,
    password: str,
):
    normalized_email = (
        email.strip().lower()
    )

    user = (
        db.query(User)
        .filter(
            func.lower(User.email)
            == normalized_email
        )
        .first()
    )

    if user is None:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    payload = {
        "sub": str(user.id),
        "role": str(user.role),
    }

    access_token = (
        create_access_token(payload)
    )

    refresh_token = (
        create_refresh_token(payload)
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


def _password_fingerprint(
    password_hash: str,
) -> str:
    return hashlib.sha256(
        password_hash.encode("utf-8")
    ).hexdigest()


def _create_password_reset_token(
    user: User,
) -> str:
    if not settings.JWT_SECRET_KEY:
        raise RuntimeError(
            "JWT_SECRET_KEY is not configured."
        )

    now = datetime.now(
        timezone.utc
    )

    expires_at = now + timedelta(
        minutes=(
            settings
            .PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "type": "password_reset",
        "password_version": (
            _password_fingerprint(
                user.password_hash
            )
        ),
        "iat": now,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=(
            settings.JWT_ALGORITHM
        ),
    )


def _build_password_reset_email(
    user: User,
    reset_token: str,
) -> tuple[str, str, str]:
    query_string = urlencode(
        {
            "token": reset_token,
        }
    )

    reset_url = (
        settings.FRONTEND_URL.rstrip("/")
        + "/reset-password?"
        + query_string
    )

    user_name = (
        user.full_name
        or "User"
    )

    safe_user_name = escape(
        user_name
    )

    safe_reset_url = escape(
        reset_url,
        quote=True,
    )

    expiry_minutes = (
        settings
        .PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
    )

    subject = (
        "Reset your Student Risk "
        "Prediction System password"
    )

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f1f5f9;
        font-family: Arial, sans-serif;
        color: #0f172a;
    ">
        <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            style="
                padding: 32px 16px;
                background-color: #f1f5f9;
            "
        >
            <tr>
                <td align="center">
                    <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        style="
                            max-width: 620px;
                            overflow: hidden;
                            background-color: #ffffff;
                            border-radius: 14px;
                            box-shadow:
                                0 6px 20px
                                rgba(15, 23, 42, 0.08);
                        "
                    >
                        <tr>
                            <td style="
                                padding: 28px 32px;
                                background-color: #2563eb;
                                color: #ffffff;
                            ">
                                <h1 style="
                                    margin: 0;
                                    font-size: 24px;
                                ">
                                    Student Risk Prediction
                                    System
                                </h1>

                                <p style="
                                    margin: 8px 0 0;
                                    opacity: 0.9;
                                ">
                                    Password Reset
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding: 32px;
                            ">
                                <p style="
                                    margin-top: 0;
                                    font-size: 16px;
                                ">
                                    Dear {safe_user_name},
                                </p>

                                <p style="
                                    color: #475569;
                                    line-height: 1.7;
                                ">
                                    We received a request to
                                    reset the password for your
                                    account.
                                </p>

                                <div style="
                                    margin: 28px 0;
                                    text-align: center;
                                ">
                                    <a
                                        href="{safe_reset_url}"
                                        style="
                                            display: inline-block;
                                            padding: 14px 26px;
                                            border-radius: 8px;
                                            background-color:
                                                #2563eb;
                                            color: #ffffff;
                                            font-weight: bold;
                                            text-decoration: none;
                                        "
                                    >
                                        Reset Password
                                    </a>
                                </div>

                                <div style="
                                    padding: 16px;
                                    border-radius: 8px;
                                    background-color: #fff7ed;
                                    color: #9a3412;
                                    line-height: 1.6;
                                ">
                                    This link will expire in
                                    {expiry_minutes} minutes and
                                    becomes invalid after your
                                    password is changed.
                                </div>

                                <p style="
                                    margin: 24px 0 0;
                                    color: #475569;
                                    line-height: 1.7;
                                ">
                                    If you did not request a
                                    password reset, you can safely
                                    ignore this email. Your current
                                    password will remain unchanged.
                                </p>

                                <p style="
                                    margin-bottom: 0;
                                    color: #64748b;
                                    line-height: 1.6;
                                ">
                                    Regards,<br>

                                    <strong>
                                        Student Risk Prediction
                                        System
                                    </strong>
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding: 18px 32px;
                                background-color: #f8fafc;
                                color: #94a3b8;
                                font-size: 12px;
                                text-align: center;
                            ">
                                This is an automatically generated
                                security email.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    text_body = f"""
Dear {user_name},

We received a request to reset the password for your account.

Open this link to reset your password:

{reset_url}

This link will expire in {expiry_minutes} minutes and becomes invalid after your password is changed.

If you did not request this reset, ignore this email.

Regards,
Student Risk Prediction System
""".strip()

    return (
        subject,
        html_body,
        text_body,
    )


def request_password_reset(
    db: Session,
    email: str,
) -> None:
    normalized_email = (
        email.strip().lower()
    )

    user = (
        db.query(User)
        .filter(
            func.lower(User.email)
            == normalized_email
        )
        .first()
    )

    # Return silently so the API does not reveal
    # whether an account exists.
    if (
        user is None
        or not user.is_active
    ):
        return

    try:
        reset_token = (
            _create_password_reset_token(
                user
            )
        )

        (
            subject,
            html_body,
            text_body,
        ) = _build_password_reset_email(
            user,
            reset_token,
        )

        send_email(
            to_email=user.email,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
        )

    except Exception:
        logger.exception(
            "Failed to send password reset "
            "email for user ID %s.",
            user.id,
        )


def validate_password_reset_token(
    db: Session,
    token: str,
) -> User:
    if not settings.JWT_SECRET_KEY:
        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Password reset is not "
                "configured."
            ),
        )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[
                settings.JWT_ALGORITHM
            ],
        )

    except ExpiredSignatureError as error:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "This password reset link "
                "has expired."
            ),
        ) from error

    except JWTError as error:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "This password reset link "
                "is invalid."
            ),
        ) from error

    if (
        payload.get("type")
        != "password_reset"
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "This password reset link "
                "is invalid."
            ),
        )

    user_id = payload.get("sub")

    try:
        parsed_user_id = int(
            str(user_id)
        )
    except (TypeError, ValueError) as error:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "This password reset link "
                "is invalid."
            ),
        ) from error

    user = (
        db.query(User)
        .filter(
            User.id == parsed_user_id
        )
        .first()
    )

    if (
        user is None
        or not user.is_active
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "This password reset link "
                "is invalid."
            ),
        )

    token_email = str(
        payload.get("email", "")
    ).strip().lower()

    if (
        token_email
        != user.email.strip().lower()
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "This password reset link "
                "is invalid."
            ),
        )

    token_password_version = (
        payload.get(
            "password_version"
        )
    )

    current_password_version = (
        _password_fingerprint(
            user.password_hash
        )
    )

    if (
        token_password_version
        != current_password_version
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "This password reset link "
                "has already been used."
            ),
        )

    return user


def _validate_password_strength(
    password: str,
) -> None:
    if len(password) < 8:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Password must contain at "
                "least 8 characters."
            ),
        )

    if not any(
        character.islower()
        for character in password
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Password must contain at "
                "least one lowercase letter."
            ),
        )

    if not any(
        character.isupper()
        for character in password
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Password must contain at "
                "least one uppercase letter."
            ),
        )

    if not any(
        character.isdigit()
        for character in password
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Password must contain at "
                "least one number."
            ),
        )


def reset_user_password(
    db: Session,
    token: str,
    new_password: str,
) -> None:
    user = (
        validate_password_reset_token(
            db,
            token,
        )
    )

    _validate_password_strength(
        new_password
    )

    if verify_password(
        new_password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "The new password must be "
                "different from the current "
                "password."
            ),
        )

    user.password_hash = (
        hash_password(
            new_password
        )
    )

    db.commit()
    db.refresh(user)