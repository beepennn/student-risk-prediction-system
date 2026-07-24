from pathlib import Path
import joblib
import pandas as pd


def test_tuned_model_exists():

    model_path = Path(
        "models/trained/random_forest_tuned.pkl"
    )

    assert model_path.exists()


def test_tuned_model_can_predict():

    model_path = Path(
        "models/trained/random_forest_tuned.pkl"
    )

    model = joblib.load(
        model_path
    )

    student_data = pd.DataFrame(
        [
            {
                "AttendanceRate": 85.0,
                "StudyHoursPerWeek": 15.0,
                "PreviousGrade": 78.0,
                "ExtracurricularActivities": 1.0,
                "Study Hours": 4.8,
                "Gender_Male": True,
                "ParentalSupport_Low": False,
                "ParentalSupport_Medium": False
            }
        ]
    )

    prediction = model.predict(
        student_data
    )

    assert len(prediction) == 1


def test_prediction_is_valid_risk():

    model_path = Path(
        "models/trained/random_forest_tuned.pkl"
    )

    model = joblib.load(
        model_path
    )

    student_data = pd.DataFrame(
        [
            {
                "AttendanceRate": 85.0,
                "StudyHoursPerWeek": 15.0,
                "PreviousGrade": 78.0,
                "ExtracurricularActivities": 1.0,
                "Study Hours": 4.8,
                "Gender_Male": True,
                "ParentalSupport_Low": False,
                "ParentalSupport_Medium": False
            }
        ]
    )

    prediction = model.predict(
        student_data
    )[0]

    valid_risks = [
        "High Risk",
        "Medium Risk",
        "Low Risk"
    ]

    assert prediction in valid_risks