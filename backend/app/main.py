from fastapi import FastAPI

app = FastAPI(
    title="Student Risk Prediction API"
)

@app.get("/")
def home():
    return {"message": "Backend running successfully"}