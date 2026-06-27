from fastapi import FastAPI

from app.database.connection import engine
from app.database.base import Base

import app.models.user
import app.models.student
import app.models.academic_record


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Risk Prediction API"
)


@app.get("/")
def home():
    return {"message": "Backend running successfully"}