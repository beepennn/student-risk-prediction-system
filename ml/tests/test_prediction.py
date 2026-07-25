from pathlib import Path

import joblib
import pandas as pd


# ============================================================
# MODEL PATH
# ============================================================

MODEL_PATH = Path(
    "models/trained/random_forest_tuned.pkl"
)


# ============================================================
# TEST 1: CHECK MODEL EXISTS
# ============================================================

def test_tuned_model_exists():

    assert MODEL_PATH.exists(), (
        f"Model file not found: {MODEL_PATH}"
    )


# ============================================================
# TEST 2: CHECK MODEL CAN BE LOADED AND PREDICT
# ============================================================

def test_tuned_model_can_predict():

    model = joblib.load(
        MODEL_PATH
    )

    student_data = pd.DataFrame(
        [
            {
                "attendance": 87,
                "internal_marks": 61,
                "assignment_score": 78,
                "quiz_score": 74,
                "previous_gpa": 3.45,
                "semester": 5,
                "gender": "Male"
            }
        ]
    )

    prediction = model.predict(
        student_data
    )

    assert len(prediction) == 1


# ============================================================
# TEST 3: CHECK PREDICTION IS VALID
# ============================================================

def test_prediction_is_valid_risk():

    model = joblib.load(
        MODEL_PATH
    )

    student_data = pd.DataFrame(
        [
            {
                "attendance": 87,
                "internal_marks": 61,
                "assignment_score": 78,
                "quiz_score": 74,
                "previous_gpa": 3.45,
                "semester": 5,
                "gender": "Male"
            }
        ]
    )

    prediction = model.predict(
        student_data
    )

    valid_risks = [
        "High Risk",
        "Medium Risk",
        "Low Risk"
    ]

    assert prediction[0] in valid_risks