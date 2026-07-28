import smtplib
import ssl

from email.mime.multipart import (
    MIMEMultipart,
)
from email.mime.text import MIMEText
from email.utils import formataddr

from app.core.config import settings


def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: str | None = None,
):
    recipient = to_email.strip()

    if not recipient:
        raise ValueError(
            "Recipient email is required."
        )

    if not settings.SMTP_HOST:
        raise RuntimeError(
            "SMTP_SERVER is not configured."
        )

    if not settings.SMTP_EMAIL:
        raise RuntimeError(
            "SMTP_USERNAME is not configured."
        )

    if not settings.SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_PASSWORD is not configured."
        )

    message = MIMEMultipart(
        "alternative"
    )

    message["From"] = formataddr(
        (
            settings.APP_NAME,
            settings.SMTP_EMAIL,
        )
    )

    message["To"] = recipient
    message["Subject"] = subject
    message["Reply-To"] = (
        settings.SMTP_EMAIL
    )

    plain_content = (
        text_body
        or "A new academic risk alert is available."
    )

    message.attach(
        MIMEText(
            plain_content,
            "plain",
            "utf-8",
        )
    )

    message.attach(
        MIMEText(
            html_body,
            "html",
            "utf-8",
        )
    )

    tls_context = (
        ssl.create_default_context()
    )

    with smtplib.SMTP(
        settings.SMTP_HOST,
        settings.SMTP_PORT,
        timeout=20,
    ) as server:
        server.ehlo()

        server.starttls(
            context=tls_context
        )

        server.ehlo()

        server.login(
            settings.SMTP_EMAIL,
            settings.SMTP_PASSWORD,
        )

        server.sendmail(
            settings.SMTP_EMAIL,
            [recipient],
            message.as_string(),
        )