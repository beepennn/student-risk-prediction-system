import sys
from pathlib import Path

# ----------------------------------------------------
# Locate ML project
# ----------------------------------------------------

ML_ROOT = (
    Path(__file__)
    .resolve()
    .parents[3]
    / "ml"
)

sys.path.append(str(ML_ROOT))

# ----------------------------------------------------
# Import ML prediction functions
# ----------------------------------------------------

from src.models.predict import predict_student_result

# ----------------------------------------------------
# Backend wrapper
# ----------------------------------------------------

def predict_student_risk(student_data: dict):
    """
    Backend wrapper around the trained ML model.
    """

    result = predict_student_result(student_data)

    probabilities = result["probabilities"]

    return {
        "risk_level": result["risk_level"],
        "low_probability": probabilities.get("Low Risk", 0.0),
        "medium_probability": probabilities.get("Medium Risk", 0.0),
        "high_probability": probabilities.get("High Risk", 0.0),
        "confidence": result["confidence"],
        "confidence_percentage": result["confidence_percentage"],
        "shap_values": result.get("shap_values", {})
    }

if __name__ == "__main__":

    sample_student = {
        "attendance": 87,
        "internal_marks": 61,
        "assignment_score": 78,
        "quiz_score": 74,
        "previous_gpa": 3.45,
        "semester": 5,
        "gender": "Male",
    }

    result = predict_student_risk(sample_student)

    print(result)