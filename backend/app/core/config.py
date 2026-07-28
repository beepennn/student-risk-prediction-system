import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SMTP_HOST = os.getenv("SMTP_SERVER")
    SMTP_PORT = int(
        os.getenv("SMTP_PORT", 587)
    )
    SMTP_EMAIL = os.getenv(
        "SMTP_USERNAME"
    )
    SMTP_PASSWORD = os.getenv(
        "SMTP_PASSWORD"
    )

    APP_NAME = os.getenv(
        "APP_NAME",
        "Student Risk Prediction System",
    )

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )


settings = Settings()