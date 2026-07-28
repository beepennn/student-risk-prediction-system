from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

try:
    import shap
except ImportError:
    shap = None


ML_ROOT = (
    Path(__file__)
    .resolve()
    .parents[2]
)

MODEL_PATH = (
    ML_ROOT
    / "models"
    / "trained"
    / "random_forest_best.pkl"
)


REQUIRED_FEATURES = [
    "attendance",
    "internal_marks",
    "assignment_score",
    "quiz_score",
    "previous_gpa",
    "semester",
    "gender",
]


@lru_cache(maxsize=1)
def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "Trained model not found: "
            f"{MODEL_PATH}. Train the model first."
        )

    return joblib.load(MODEL_PATH)


def get_preprocessor(model):
    return model.named_steps[
        "preprocessor"
    ]


def get_classifier(model):
    return model.named_steps[
        "classifier"
    ]


def prepare_student_data(
    student_features: dict,
) -> pd.DataFrame:
    missing_features = [
        feature
        for feature in REQUIRED_FEATURES
        if feature not in student_features
    ]

    if missing_features:
        raise ValueError(
            "Missing required features: "
            f"{missing_features}"
        )

    prepared_data = {
        "attendance": float(
            student_features["attendance"]
        ),
        "internal_marks": float(
            student_features["internal_marks"]
        ),
        "assignment_score": float(
            student_features[
                "assignment_score"
            ]
        ),
        "quiz_score": float(
            student_features["quiz_score"]
        ),
        "previous_gpa": float(
            student_features["previous_gpa"]
        ),
        "semester": int(
            student_features["semester"]
        ),
        "gender": str(
            student_features["gender"]
        ).strip().title(),
    }

    return pd.DataFrame([prepared_data])


def predict_student(
    student_features: dict,
) -> str:
    result = predict_student_result(
        student_features,
        include_shap=False,
    )

    return result["risk_level"]


def predict_proba(
    student_features: dict,
) -> dict[str, float]:
    model = load_model()

    student_data = prepare_student_data(
        student_features
    )

    probabilities = model.predict_proba(
        student_data
    )[0]

    return {
        str(class_name): float(probability)
        for class_name, probability in zip(
            model.classes_,
            probabilities,
        )
    }


def generate_shap_values(
    student_features: dict,
) -> dict:
    if shap is None:
        return {}

    model = load_model()

    student_data = prepare_student_data(
        student_features
    )

    preprocessor = get_preprocessor(model)
    classifier = get_classifier(model)

    transformed_data = preprocessor.transform(
        student_data
    )

    if hasattr(
        transformed_data,
        "toarray",
    ):
        transformed_data = (
            transformed_data.toarray()
        )

    transformed_data = np.asarray(
        transformed_data
    )

    predicted_class = classifier.predict(
        transformed_data
    )[0]

    class_index = list(
        classifier.classes_
    ).index(predicted_class)

    explainer = shap.TreeExplainer(
        classifier
    )

    raw_shap_values = (
        explainer.shap_values(
            transformed_data
        )
    )

    if isinstance(
        raw_shap_values,
        list,
    ):
        class_shap_values = np.asarray(
            raw_shap_values[class_index]
        )[0]

    else:
        shap_array = np.asarray(
            raw_shap_values
        )

        if shap_array.ndim == 3:
            class_shap_values = (
                shap_array[
                    0,
                    :,
                    class_index,
                ]
            )

        elif shap_array.ndim == 2:
            class_shap_values = (
                shap_array[0]
            )

        else:
            raise ValueError(
                "Unsupported SHAP output shape: "
                f"{shap_array.shape}"
            )

    feature_names = (
        preprocessor
        .get_feature_names_out()
    )

    feature_values = (
        transformed_data[0]
    )

    return {
        str(feature_name): {
            "feature_value": float(
                feature_values[index]
            ),
            "shap_value": float(
                class_shap_values[index]
            ),
        }
        for index, feature_name
        in enumerate(feature_names)
    }


def predict_student_result(
    student_features: dict,
    include_shap: bool = True,
) -> dict:
    model = load_model()

    student_data = prepare_student_data(
        student_features
    )

    raw_probabilities = model.predict_proba(
        student_data
    )[0]

    probabilities = {
        str(class_name): float(probability)
        for class_name, probability in zip(
            model.classes_,
            raw_probabilities,
        )
    }

    # Always select the class with the largest
    # returned probability.
    risk_level = max(
        probabilities,
        key=probabilities.get,
    )

    confidence = probabilities[
        risk_level
    ]

    shap_values = (
        generate_shap_values(
            student_features
        )
        if include_shap
        else {}
    )

    return {
        "risk_level": risk_level,
        "probabilities": probabilities,
        "confidence": float(confidence),
        "confidence_percentage": float(
            confidence * 100
        ),
        "shap_values": shap_values,
    }


if __name__ == "__main__":
    test_students = [
        {
            "name": "High-risk test",
            "attendance": 19,
            "internal_marks": 10,
            "assignment_score": 1,
            "quiz_score": 1,
            "previous_gpa": 1.0,
            "semester": 6,
            "gender": "Male",
        },
        {
            "name": "Medium-risk test",
            "attendance": 62,
            "internal_marks": 55,
            "assignment_score": 60,
            "quiz_score": 58,
            "previous_gpa": 2.4,
            "semester": 5,
            "gender": "Female",
        },
        {
            "name": "Low-risk test",
            "attendance": 90,
            "internal_marks": 85,
            "assignment_score": 88,
            "quiz_score": 82,
            "previous_gpa": 3.6,
            "semester": 4,
            "gender": "Female",
        },
    ]

    for test_student in test_students:
        student_name = test_student.pop(
            "name"
        )

        result = predict_student_result(
            test_student,
            include_shap=False,
        )

        print(
            f"\n{student_name}:"
        )

        print(result)