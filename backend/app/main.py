from fastapi import FastAPI

from app.database.connection import engine
from app.database.base import Base

import app.models.user
import app.models.student
import app.models.academic_record

from app.routes import students
from app.routes import academic_records
from app.routes import users
from app.routes import predictions
from app.routes import recommendations
from app.routes import notifications
from app.routes import interventions
from app.routes import reports
from app.routes import auth
from app.routes import teacher
from app.routes import admin
from app.routes.audit_logs import router as audit_router

from app.core.exception_handler import register_exception_handlers
from app.middleware.logging_middleware import logging_middleware

# Temporary during development
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Risk Prediction API"
)

register_exception_handlers(app)
app.middleware("http")(logging_middleware)

# Register Student Routes
app.include_router(users.router)
app.include_router(students.router)
app.include_router(academic_records.router)
app.include_router(predictions.router)
app.include_router(recommendations.router)
app.include_router(notifications.router)
app.include_router(interventions.router)
app.include_router(reports.router)
app.include_router(auth.router)
app.include_router(teacher.router)
app.include_router(admin.router)
app.include_router(audit_router)

@app.get("/")
def home():
    return {"message": "Backend running successfully"}