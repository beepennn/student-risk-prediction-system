import pandas as pd
import joblib
import shap

from pathlib import Path


# ============================================================
# 1. MODEL PATH
# ============================================================

MODEL_PATH = Path(
    "models/trained/random_forest_tuned.pkl"
)


# ============================================================
# 2. LOAD MODEL
# ============================================================

def load_model():
    """
    Load and return the trained Random Forest model.
    """

    model = joblib.load(MODEL_PATH)

    return model


# ============================================================
# 3. PREDICT STUDENT RISK
# ============================================================

def predict_student(student_features):
    """
    Predict academic risk for a student.

    Parameters
    ----------
    student_features : dict or pandas.DataFrame
        Student feature values.

    Returns
    -------
    str
        Predicted academic risk.
    """

    model = load_model()

    if isinstance(student_features, dict):
        student_features = pd.DataFrame(
            [student_features]
        )

    prediction = model.predict(
        student_features
    )

    return prediction[0]


# ============================================================
# 4. PREDICT PROBABILITIES
# ============================================================

def predict_proba(student_features):
    """
    Return prediction probabilities for a student.

    Parameters
    ----------
    student_features : dict or pandas.DataFrame
        Student feature values.

    Returns
    -------
    dict
        Probability for each academic risk class.
    """

    model = load_model()

    if isinstance(student_features, dict):
        student_features = pd.DataFrame(
            [student_features]
        )

    probabilities = model.predict_proba(
        student_features
    )[0]

    return {
        class_name: float(probability)
        for class_name, probability in zip(
            model.classes_,
            probabilities
        )
    }


# ============================================================
# 5. GENERATE SHAP EXPLANATION
# ============================================================

def generate_shap(student_features):
    """
    Generate SHAP feature contributions
    for a student's prediction.

    Parameters
    ----------
    student_features : dict or pandas.DataFrame
        Student feature values.

    Returns
    -------
    list
        Feature-level SHAP explanations.
    """

    model = load_model()

    explainer = shap.TreeExplainer(
        model
    )

    if isinstance(student_features, dict):
        student_features = pd.DataFrame(
            [student_features]
        )

    shap_explanation = explainer(
        student_features
    )

    predicted_risk = model.predict(
        student_features
    )[0]

    predicted_class_index = list(
        model.classes_
    ).index(
        predicted_risk
    )

    shap_values = (
        shap_explanation.values[
            0,
            :,
            predicted_class_index
        ]
    )

    explanation = []

    for feature, value, shap_value in zip(
        student_features.columns,
        student_features.iloc[0].values,
        shap_values
    ):

        explanation.append(
            {
                "feature": feature,
                "feature_value": value,
                "shap_value": float(shap_value),
                "absolute_shap": float(
                    abs(shap_value)
                )
            }
        )

    explanation.sort(
        key=lambda x: x["absolute_shap"],
        reverse=True
    )

    return explanation


# ============================================================
# 6. LOCAL TEST ONLY
# ============================================================

if __name__ == "__main__":

    sample_student = {
        "AttendanceRate": 85.0,
        "StudyHoursPerWeek": 15.0,
        "PreviousGrade": 78.0,
        "ExtracurricularActivities": 1.0,
        "Study Hours": 4.8,
        "Gender_Male": True,
        "ParentalSupport_Low": False,
        "ParentalSupport_Medium": False
    }

    print(
        "Tuned Random Forest model loaded successfully."
    )

    prediction = predict_student(
        sample_student
    )

    probabilities = predict_proba(
        sample_student
    )

    shap_explanation = generate_shap(
        sample_student
    )

    print(
        "\n========== PREDICTION =========="
    )

    print(
        "Predicted Academic Risk:",
        prediction
    )

    print(
        "\n========== PROBABILITIES =========="
    )

    for class_name, probability in probabilities.items():

        print(
            f"{class_name}: "
            f"{probability:.4f}"
        )

    print(
        "\n========== TOP SHAP FEATURES =========="
    )

    for item in shap_explanation[:3]:

        print(
            item["feature"],
            item["shap_value"]
        )