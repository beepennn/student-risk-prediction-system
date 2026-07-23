import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings


def send_email(
    to_email: str,
    subject: str,
    html_body: str,
):
    message = MIMEMultipart()

    message["From"] = settings.SMTP_EMAIL
    message["To"] = to_email
    message["Subject"] = subject

    message.attach(
        MIMEText(
            html_body,
            "html",
        )
    )

    server = smtplib.SMTP(
        settings.SMTP_HOST,
        settings.SMTP_PORT,
    )

    server.starttls()

    server.login(
        settings.SMTP_EMAIL,
        settings.SMTP_PASSWORD,
    )

    server.sendmail(
        settings.SMTP_EMAIL,
        to_email,
        message.as_string(),
    )

    server.quit()