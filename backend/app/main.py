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

# Temporary during development
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Risk Prediction API"
)

# Register Student Routes
app.include_router(users.router)
app.include_router(students.router)
app.include_router(academic_records.router)
app.include_router(predictions.router)
app.include_router(recommendations.router)
app.include_router(notifications.router)

@app.get("/")
def home():
    return {"message": "Backend running successfully"}