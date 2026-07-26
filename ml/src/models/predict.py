import pandas as pd
import joblib
import shap

from pathlib import Path


# ============================================================
# MODEL PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "trained"
    / "random_forest_tuned.pkl"
)


# ============================================================
# 1. LOAD MODEL
# ============================================================

def load_model():

    """
    Load the complete trained ML pipeline.

    The pipeline contains:
    - Feature preprocessing
    - OneHotEncoder
    - Random Forest classifier
    """

    model = joblib.load(
        MODEL_PATH
    )

    return model

def get_preprocessor(model):
    return model.named_steps["preprocessor"]


def get_classifier(model):
    return model.named_steps["classifier"]


# ============================================================
# 2. PREPARE STUDENT DATA
# ============================================================

def prepare_student_data(
    student_features
):

    """
    Convert backend student data into a pandas DataFrame.

    Expected input:

    {
        "attendance": 87,
        "internal_marks": 61,
        "assignment_score": 78,
        "quiz_score": 74,
        "previous_gpa": 3.45,
        "semester": 5,
        "gender": "Male"
    }
    """

    required_features = [

        "attendance",

        "internal_marks",

        "assignment_score",

        "quiz_score",

        "previous_gpa",

        "semester",

        "gender"

    ]


    # Check missing features

    missing_features = [

        feature

        for feature in required_features

        if feature not in student_features

    ]


    if missing_features:

        raise ValueError(

            "Missing required features: "

            + str(missing_features)

        )


    # Create DataFrame

    student_data = pd.DataFrame(

        [

            {

                feature: student_features[feature]

                for feature in required_features

            }

        ]

    )


    return student_data


# ============================================================
# 3. PREDICT STUDENT RISK
# ============================================================

def predict_student(
    student_features
):

    """
    Predict the academic risk level.

    Returns:

    High Risk
    Medium Risk
    Low Risk
    """

    model = load_model()


    student_data = prepare_student_data(

        student_features

    )


    prediction = model.predict(

        student_data

    )


    return prediction[0]


# ============================================================
# 4. PREDICT PROBABILITIES
# ============================================================

def predict_proba(
    student_features
):

    """
    Return prediction probabilities
    for High Risk, Medium Risk and Low Risk.
    """

    model = load_model()


    student_data = prepare_student_data(

        student_features

    )


    probabilities = model.predict_proba(

        student_data

    )[0]


    # Get model class names

    classes = model.classes_


    probability_result = {

        class_name: float(probability)

        for class_name, probability

        in zip(

            classes,

            probabilities

        )

    }


    return probability_result

# ============================================================
# GENERATE SHAP VALUES
# ============================================================

def generate_shap_values(student_features):
    """
    Generate SHAP values for a single prediction.
    """

    model = load_model()

    student_data = prepare_student_data(student_features)

    preprocessor = get_preprocessor(model)
    classifier = get_classifier(model)

    transformed_data = preprocessor.transform(student_data)

    explainer = shap.TreeExplainer(classifier)

    shap_values = explainer.shap_values(transformed_data)

    predicted_class = classifier.predict(transformed_data)[0]

    class_index = list(classifier.classes_).index(predicted_class)

    feature_names = preprocessor.get_feature_names_out()

    # SHAP 0.52 format:
    # (samples, features, classes)
    class_shap_values = shap_values[0, :, class_index]

    return {
        feature_name: {
            "feature_value": float(transformed_data[0, index]),
            "shap_value": float(class_shap_values[index]),
        }
        for index, feature_name in enumerate(feature_names)
    }

# ============================================================
# 5. COMPLETE PREDICTION
# ============================================================

def predict_student_result(
    student_features
):

    """
    Return complete prediction result.

    This function is useful for backend integration.
    """

    risk_level = predict_student(

        student_features

    )


    probabilities = predict_proba(

        student_features

    )


    confidence = max(

        probabilities.values()

    )

    shap_values = generate_shap_values(student_features)

    result = {
        "risk_level": risk_level,
        "probabilities": probabilities,
        "confidence": float(confidence),
        "confidence_percentage": float(confidence * 100),
        "shap_values": shap_values,
    }

    return result


# ============================================================
# 6. TEST ONLY WHEN RUN DIRECTLY
# ============================================================

if __name__ == "__main__":

    print(

        "========== ML PREDICTION TEST =========="

    )


    # Sample backend-compatible student

    sample_student = {

        "attendance": 87,

        "internal_marks": 61,

        "assignment_score": 78,

        "quiz_score": 74,

        "previous_gpa": 3.45,

        "semester": 5,

        "gender": "Male"

    }


    result = predict_student_result(

        sample_student

    )


    print(

        "\n========== PREDICTION RESULT =========="

    )


    print(

        "Risk Level:",

        result["risk_level"]

    )


    print(

        "\n========== PROBABILITIES =========="

    )


    for (

        class_name,

        probability

    ) in result["probabilities"].items():

        print(

            f"{class_name}: "

            f"{probability:.4f}"

        )


    print(

        "\nConfidence:",

        f"{result['confidence']:.4f}"

    )


    print(

        "Confidence Percentage:",

        f"{result['confidence_percentage']:.2f}%"

    )


    print(

        "\n✅ Prediction module test completed successfully."

    )