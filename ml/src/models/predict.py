from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

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


EXPECTED_CLASSES = {
    "High Risk",
    "Medium Risk",
    "Low Risk",
}


@lru_cache(maxsize=1)
def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "Best trained model was not found: "
            f"{MODEL_PATH}\n"
            "Run training first."
        )

    model = joblib.load(
        MODEL_PATH
    )

    actual_classes = {
        str(class_name)
        for class_name in model.classes_
    }

    missing_classes = (
        EXPECTED_CLASSES
        - actual_classes
    )

    if missing_classes:
        raise ValueError(
            "The trained model is missing risk "
            f"classes: {sorted(missing_classes)}. "
            "Retrain the model using the balanced "
            "training pipeline."
        )

    return model


def clear_model_cache() -> None:
    load_model.cache_clear()


def get_preprocessor(model):
    return model.named_steps[
        "preprocessor"
    ]


def get_classifier(model):
    return model.named_steps[
        "classifier"
    ]


def prepare_student_data(
    student_features: dict[str, Any],
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
            student_features[
                "internal_marks"
            ]
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
        )
        .strip()
        .title(),
    }

    numeric_limits = {
        "attendance": (0, 100),
        "internal_marks": (0, 100),
        "assignment_score": (0, 100),
        "quiz_score": (0, 100),
        "previous_gpa": (0, 4),
        "semester": (1, 8),
    }

    for (
        feature,
        limits,
    ) in numeric_limits.items():
        value = float(
            prepared_data[feature]
        )

        minimum, maximum = limits

        if not minimum <= value <= maximum:
            raise ValueError(
                f"{feature} must be between "
                f"{minimum} and {maximum}."
            )

    return pd.DataFrame(
        [prepared_data]
    )


def predict_proba(
    student_features: dict[str, Any],
) -> dict[str, float]:
    model = load_model()

    student_data = prepare_student_data(
        student_features
    )

    raw_probabilities = (
        model.predict_proba(
            student_data
        )[0]
    )

    probabilities = {
        str(class_name): float(
            probability
        )
        for class_name, probability
        in zip(
            model.classes_,
            raw_probabilities,
        )
    }

    for expected_class in EXPECTED_CLASSES:
        probabilities.setdefault(
            expected_class,
            0.0,
        )

    return probabilities


def predict_student(
    student_features: dict[str, Any],
) -> str:
    result = predict_student_result(
        student_features,
        include_shap=False,
    )

    return str(
        result["risk_level"]
    )


def generate_shap_values(
    student_features: dict[str, Any],
) -> dict[str, dict[str, float]]:
    if shap is None:
        return {}

    model = load_model()

    student_data = prepare_student_data(
        student_features
    )

    preprocessor = get_preprocessor(
        model
    )

    classifier = get_classifier(
        model
    )

    transformed_data = (
        preprocessor.transform(
            student_data
        )
    )

    if hasattr(
        transformed_data,
        "toarray",
    ):
        transformed_data = (
            transformed_data.toarray()
        )

    transformed_data = np.asarray(
        transformed_data,
        dtype=float,
    )

    predicted_class = (
        classifier.predict(
            transformed_data
        )[0]
    )

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
            raw_shap_values[
                class_index
            ]
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
                "Unsupported SHAP result shape: "
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
    student_features: dict[str, Any],
    include_shap: bool = True,
) -> dict[str, Any]:
    probabilities = predict_proba(
        student_features
    )

    risk_level = max(
        probabilities,
        key=probabilities.get,
    )

    confidence = float(
        probabilities[risk_level]
    )

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
        "confidence": confidence,
        "confidence_percentage": (
            confidence * 100
        ),
        "shap_values": shap_values,
    }


if __name__ == "__main__":
    test_students = [
        {
            "name": "High-risk test",
            "expected": "High Risk",
            "features": {
                "attendance": 19,
                "internal_marks": 10,
                "assignment_score": 1,
                "quiz_score": 1,
                "previous_gpa": 1.0,
                "semester": 6,
                "gender": "Male",
            },
        },
        {
            "name": "Medium-risk test",
            "expected": "Medium Risk",
            "features": {
                "attendance": 62,
                "internal_marks": 55,
                "assignment_score": 60,
                "quiz_score": 58,
                "previous_gpa": 2.4,
                "semester": 5,
                "gender": "Female",
            },
        },
        {
            "name": "Low-risk test",
            "expected": "Low Risk",
            "features": {
                "attendance": 90,
                "internal_marks": 85,
                "assignment_score": 88,
                "quiz_score": 82,
                "previous_gpa": 3.6,
                "semester": 4,
                "gender": "Female",
            },
        },
    ]

    failures = []

    for test_student in test_students:
        result = predict_student_result(
            test_student["features"],
            include_shap=False,
        )

        print(
            f"\n{test_student['name']}:"
        )

        print(
            "Expected:",
            test_student["expected"],
        )

        print(
            "Predicted:",
            result["risk_level"],
        )

        print(
            "Probabilities:",
            result["probabilities"],
        )

        if (
            result["risk_level"]
            != test_student["expected"]
        ):
            failures.append(
                test_student["name"]
            )

    if failures:
        raise RuntimeError(
            "Prediction tests failed: "
            f"{failures}"
        )

    print(
        "\nAll prediction tests passed."
    )