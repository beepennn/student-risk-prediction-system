from fastapi import FastAPI

from app.database.connection import engine
from app.database.base import Base

from app.models import user
from app.models import student


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Risk Prediction API"
)


@app.get("/")
def home():
    return {"message": "Backend running successfully"}