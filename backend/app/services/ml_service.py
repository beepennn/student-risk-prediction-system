import sys
from pathlib import Path


ML_ROOT = (
    Path(__file__)
    .resolve()
    .parents[3]
    / "ml"
)

if str(ML_ROOT) not in sys.path:
    sys.path.append(
        str(ML_ROOT)
    )


from src.models.predict import (
    predict_student_result,
)


EXPECTED_CLASSES = {
    "Low Risk",
    "Medium Risk",
    "High Risk",
}


def predict_student_risk(
    student_data: dict,
):
    result = predict_student_result(
        student_data
    )

    probabilities = result[
        "probabilities"
    ]

    missing_classes = (
        EXPECTED_CLASSES
        - set(probabilities.keys())
    )

    if missing_classes:
        raise ValueError(
            "Prediction model is missing classes: "
            f"{sorted(missing_classes)}"
        )

    return {
        "risk_level": result[
            "risk_level"
        ],
        "low_probability": float(
            probabilities["Low Risk"]
        ),
        "medium_probability": float(
            probabilities["Medium Risk"]
        ),
        "high_probability": float(
            probabilities["High Risk"]
        ),
        "confidence": float(
            result["confidence"]
        ),
        "confidence_percentage": float(
            result[
                "confidence_percentage"
            ]
        ),
        "shap_values": result.get(
            "shap_values",
            {},
        ),
    }