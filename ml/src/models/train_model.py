from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import (
    RandomizedSearchCV,
    train_test_split,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from src.data.create_target import (
    calculate_performance_score,
    create_academic_risk,
)


# ============================================================
# 1. PROJECT PATHS
# ============================================================

ML_ROOT = (
    Path(__file__)
    .resolve()
    .parents[2]
)

DATA_PATH = (
    ML_ROOT
    / "data"
    / "processed"
    / "student_performance_processed.csv"
)

MODEL_DIR = (
    ML_ROOT
    / "models"
    / "trained"
)

REPORT_DIR = (
    ML_ROOT
    / "reports"
)

SYNTHETIC_DATA_PATH = (
    ML_ROOT
    / "data"
    / "processed"
    / "synthetic_balanced_training_data.csv"
)

COMBINED_DATA_PATH = (
    ML_ROOT
    / "data"
    / "processed"
    / "combined_training_data.csv"
)


# ============================================================
# 2. FEATURE DEFINITIONS
# ============================================================

FEATURE_COLUMNS = [
    "attendance",
    "internal_marks",
    "assignment_score",
    "quiz_score",
    "previous_gpa",
    "semester",
    "gender",
]

TARGET_COLUMN = "AcademicRisk"

NUMERIC_FEATURES = [
    "attendance",
    "internal_marks",
    "assignment_score",
    "quiz_score",
    "previous_gpa",
]

CATEGORICAL_FEATURES = [
    "semester",
    "gender",
]

EXPECTED_CLASSES = [
    "High Risk",
    "Medium Risk",
    "Low Risk",
]


# ============================================================
# 3. CREATE ONE-HOT ENCODER
# ============================================================

def create_one_hot_encoder() -> OneHotEncoder:
    """
    Create a dense OneHotEncoder compatible with both newer
    and older scikit-learn versions.
    """

    try:
        return OneHotEncoder(
            handle_unknown="ignore",
            sparse_output=False,
        )
    except TypeError:
        return OneHotEncoder(
            handle_unknown="ignore",
            sparse=False,
        )


# ============================================================
# 4. EVALUATE MODEL
# ============================================================

def evaluate_model(
    model_name: str,
    model: Pipeline,
    test_features: pd.DataFrame,
    test_target: pd.Series,
) -> dict[str, float | str]:
    predictions = model.predict(
        test_features
    )

    accuracy = accuracy_score(
        test_target,
        predictions,
    )

    balanced_accuracy = (
        balanced_accuracy_score(
            test_target,
            predictions,
        )
    )

    macro_precision = precision_score(
        test_target,
        predictions,
        average="macro",
        zero_division=0,
    )

    macro_recall = recall_score(
        test_target,
        predictions,
        average="macro",
        zero_division=0,
    )

    macro_f1 = f1_score(
        test_target,
        predictions,
        average="macro",
        zero_division=0,
    )

    print(
        f"\n========== {model_name} =========="
    )

    print(
        classification_report(
            test_target,
            predictions,
            labels=EXPECTED_CLASSES,
            zero_division=0,
        )
    )

    print("Confusion matrix:")

    print(
        confusion_matrix(
            test_target,
            predictions,
            labels=EXPECTED_CLASSES,
        )
    )

    print(
        f"\nAccuracy: {accuracy:.4f}"
    )

    print(
        "Balanced Accuracy: "
        f"{balanced_accuracy:.4f}"
    )

    print(
        "Macro Precision: "
        f"{macro_precision:.4f}"
    )

    print(
        "Macro Recall: "
        f"{macro_recall:.4f}"
    )

    print(
        f"Macro F1: {macro_f1:.4f}"
    )

    return {
        "Model": model_name,
        "Accuracy": accuracy,
        "Balanced Accuracy": balanced_accuracy,
        "Macro Precision": macro_precision,
        "Macro Recall": macro_recall,
        "Macro F1": macro_f1,
    }


# ============================================================
# 5. GENERATE BALANCED SYNTHETIC DATA
# ============================================================

def generate_balanced_synthetic_data(
    rows_per_class: int = 1000,
    random_state: int = 42,
) -> pd.DataFrame:
    """
    Generate balanced academic profiles for High, Medium,
    and Low Risk.

    Labels are created using the same academic-risk rules
    used during preprocessing.
    """

    if rows_per_class <= 0:
        raise ValueError(
            "rows_per_class must be greater than zero."
        )

    rng = np.random.default_rng(
        random_state
    )

    profiles: dict[
        str,
        list[dict[str, object]],
    ] = {
        "High Risk": [],
        "Medium Risk": [],
        "Low Risk": [],
    }

    maximum_attempts = (
        rows_per_class * 200
    )

    attempts = 0

    while (
        any(
            len(class_rows) < rows_per_class
            for class_rows in profiles.values()
        )
        and attempts < maximum_attempts
    ):
        attempts += 1

        profile: dict[str, object] = {
            "attendance": round(
                float(
                    rng.uniform(0, 100)
                ),
                2,
            ),
            "internal_marks": round(
                float(
                    rng.uniform(0, 100)
                ),
                2,
            ),
            "assignment_score": round(
                float(
                    rng.uniform(0, 100)
                ),
                2,
            ),
            "quiz_score": round(
                float(
                    rng.uniform(0, 100)
                ),
                2,
            ),
            "previous_gpa": round(
                float(
                    rng.uniform(0, 4)
                ),
                2,
            ),
            "semester": int(
                rng.integers(1, 9)
            ),
            "gender": str(
                rng.choice(
                    [
                        "Male",
                        "Female",
                        "Other",
                    ]
                )
            ),
        }

        performance_score = (
            calculate_performance_score(
                profile
            )
        )

        risk_level = (
            create_academic_risk(
                performance_score
            )
        )

        if (
            risk_level not in profiles
        ):
            continue

        if (
            len(profiles[risk_level])
            >= rows_per_class
        ):
            continue

        profiles[risk_level].append(
            {
                **profile,
                "performance_score": (
                    performance_score
                ),
                TARGET_COLUMN: risk_level,
            }
        )

    incomplete_classes = {
        risk_level: len(class_rows)
        for risk_level, class_rows
        in profiles.items()
        if len(class_rows) < rows_per_class
    }

    if incomplete_classes:
        raise RuntimeError(
            "Could not generate enough balanced "
            "synthetic records. Generated counts: "
            f"{incomplete_classes}"
        )

    rows = (
        profiles["High Risk"]
        + profiles["Medium Risk"]
        + profiles["Low Risk"]
    )

    synthetic_dataframe = pd.DataFrame(
        rows
    )

    synthetic_dataframe = (
        synthetic_dataframe.sample(
            frac=1,
            random_state=random_state,
        )
        .reset_index(drop=True)
    )

    return synthetic_dataframe


# ============================================================
# 6. VALIDATE DATASET
# ============================================================

def validate_dataset(
    dataframe: pd.DataFrame,
) -> None:
    required_columns = (
        FEATURE_COLUMNS
        + [TARGET_COLUMN]
    )

    missing_columns = [
        column
        for column in required_columns
        if column not in dataframe.columns
    ]

    if missing_columns:
        raise ValueError(
            "Training dataset is missing columns: "
            f"{missing_columns}"
        )

    if dataframe.empty:
        raise ValueError(
            "Training dataset is empty."
        )

    for column in NUMERIC_FEATURES:
        dataframe[column] = pd.to_numeric(
            dataframe[column],
            errors="coerce",
        )

    dataframe["semester"] = pd.to_numeric(
        dataframe["semester"],
        errors="coerce",
    )

    dataframe["gender"] = (
        dataframe["gender"]
        .astype("string")
        .str.strip()
        .str.title()
    )

    dataframe[TARGET_COLUMN] = (
        dataframe[TARGET_COLUMN]
        .astype("string")
        .str.strip()
        .str.title()
    )

    dataframe.dropna(
        subset=required_columns,
        inplace=True,
    )

    dataframe["attendance"] = (
        dataframe["attendance"]
        .clip(0, 100)
    )

    dataframe["internal_marks"] = (
        dataframe["internal_marks"]
        .clip(0, 100)
    )

    dataframe["assignment_score"] = (
        dataframe["assignment_score"]
        .clip(0, 100)
    )

    dataframe["quiz_score"] = (
        dataframe["quiz_score"]
        .clip(0, 100)
    )

    dataframe["previous_gpa"] = (
        dataframe["previous_gpa"]
        .clip(0, 4)
    )

    dataframe["semester"] = (
        dataframe["semester"]
        .clip(1, 8)
        .astype(int)
    )


# ============================================================
# 7. CREATE PREPROCESSING PIPELINE
# ============================================================

def create_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            (
                "categorical",
                create_one_hot_encoder(),
                CATEGORICAL_FEATURES,
            ),
            (
                "numeric",
                "passthrough",
                NUMERIC_FEATURES,
            ),
        ],
        remainder="drop",
    )


# ============================================================
# 8. CREATE BASELINE PIPELINE
# ============================================================

def create_baseline_pipeline() -> Pipeline:
    return Pipeline(
        steps=[
            (
                "preprocessor",
                create_preprocessor(),
            ),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=300,
                    max_depth=None,
                    min_samples_split=2,
                    min_samples_leaf=1,
                    max_features="sqrt",
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )


# ============================================================
# 9. TEST OBVIOUS EXAMPLES
# ============================================================

def test_obvious_examples(
    model: Pipeline,
) -> None:
    test_cases = [
        {
            "name": "High-risk example",
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
            "name": "Medium-risk example",
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
            "name": "Low-risk example",
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

    print(
        "\n========== OBVIOUS CASE TESTS =========="
    )

    failed_cases: list[str] = []

    for test_case in test_cases:
        test_dataframe = pd.DataFrame(
            [test_case["features"]]
        )

        prediction = str(
            model.predict(
                test_dataframe
            )[0]
        )

        probabilities = (
            model.predict_proba(
                test_dataframe
            )[0]
        )

        probability_result = {
            str(class_name): float(probability)
            for class_name, probability
            in zip(
                model.classes_,
                probabilities,
            )
        }

        print(
            f"\n{test_case['name']}"
        )

        print(
            "Expected:",
            test_case["expected"],
        )

        print(
            "Predicted:",
            prediction,
        )

        print(
            "Probabilities:",
            probability_result,
        )

        if (
            prediction
            != test_case["expected"]
        ):
            failed_cases.append(
                str(test_case["name"])
            )

    if failed_cases:
        raise RuntimeError(
            "The selected model failed obvious "
            "risk tests: "
            f"{failed_cases}"
        )

    print(
        "\nAll obvious risk tests passed."
    )


# ============================================================
# 10. TRAIN MODELS
# ============================================================

def train_models() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            "Processed dataset not found. "
            "Run preprocessing first:\n"
            "python -m src.data.preprocess"
        )

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    REPORT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    SYNTHETIC_DATA_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    print(
        "Loading processed dataset:"
    )

    print(DATA_PATH)

    real_dataframe = pd.read_csv(
        DATA_PATH
    )

    validate_dataset(
        real_dataframe
    )

    real_training_data = (
        real_dataframe[
            FEATURE_COLUMNS
            + [TARGET_COLUMN]
        ]
        .copy()
    )

    print(
        "\nOriginal target distribution:"
    )

    print(
        real_training_data[
            TARGET_COLUMN
        ].value_counts()
    )

    print(
        "\nGenerating balanced synthetic data..."
    )

    synthetic_training_data = (
        generate_balanced_synthetic_data(
            rows_per_class=1000,
            random_state=42,
        )
    )

    synthetic_training_data.to_csv(
        SYNTHETIC_DATA_PATH,
        index=False,
    )

    print(
        "\nSynthetic target distribution:"
    )

    print(
        synthetic_training_data[
            TARGET_COLUMN
        ].value_counts()
    )

    combined_dataframe = pd.concat(
        [
            real_training_data,
            synthetic_training_data[
                FEATURE_COLUMNS
                + [TARGET_COLUMN]
            ],
        ],
        ignore_index=True,
    )

    combined_dataframe = (
        combined_dataframe.sample(
            frac=1,
            random_state=42,
        )
        .reset_index(drop=True)
    )

    validate_dataset(
        combined_dataframe
    )

    combined_dataframe.to_csv(
        COMBINED_DATA_PATH,
        index=False,
    )

    print(
        "\nCombined target distribution:"
    )

    combined_distribution = (
        combined_dataframe[
            TARGET_COLUMN
        ].value_counts()
    )

    print(combined_distribution)

    missing_classes = [
        risk_class
        for risk_class in EXPECTED_CLASSES
        if risk_class
        not in combined_distribution.index
    ]

    if missing_classes:
        raise ValueError(
            "Combined training dataset does not "
            "contain all risk classes: "
            f"{missing_classes}"
        )

    insufficient_classes = [
        risk_class
        for risk_class in EXPECTED_CLASSES
        if combined_distribution.get(
            risk_class,
            0,
        ) < 2
    ]

    if insufficient_classes:
        raise ValueError(
            "Some classes do not have enough "
            "records for stratified splitting: "
            f"{insufficient_classes}"
        )

    features = combined_dataframe[
        FEATURE_COLUMNS
    ].copy()

    target = combined_dataframe[
        TARGET_COLUMN
    ].copy()

    (
        training_features,
        testing_features,
        training_target,
        testing_target,
    ) = train_test_split(
        features,
        target,
        test_size=0.2,
        random_state=42,
        stratify=target,
    )

    print(
        "\nTraining samples:",
        len(training_features),
    )

    print(
        "Testing samples:",
        len(testing_features),
    )

    baseline_pipeline = (
        create_baseline_pipeline()
    )

    print(
        "\nTraining baseline model..."
    )

    baseline_pipeline.fit(
        training_features,
        training_target,
    )

    baseline_metrics = evaluate_model(
        "Baseline Random Forest",
        baseline_pipeline,
        testing_features,
        testing_target,
    )

    parameter_distributions = {
        "classifier__n_estimators": [
            200,
            300,
            400,
            500,
        ],
        "classifier__max_depth": [
            None,
            8,
            12,
            16,
            20,
        ],
        "classifier__min_samples_split": [
            2,
            4,
            6,
        ],
        "classifier__min_samples_leaf": [
            1,
            2,
            3,
        ],
        "classifier__max_features": [
            "sqrt",
            "log2",
            None,
        ],
        "classifier__class_weight": [
            "balanced",
            "balanced_subsample",
        ],
    }

    search = RandomizedSearchCV(
        estimator=create_baseline_pipeline(),
        param_distributions=(
            parameter_distributions
        ),
        n_iter=15,
        scoring="f1_macro",
        cv=3,
        random_state=42,
        n_jobs=-1,
        verbose=1,
        refit=True,
    )

    print(
        "\nTraining tuned model..."
    )

    search.fit(
        training_features,
        training_target,
    )

    tuned_pipeline = (
        search.best_estimator_
    )

    tuned_metrics = evaluate_model(
        "Tuned Random Forest",
        tuned_pipeline,
        testing_features,
        testing_target,
    )

    baseline_model_path = (
        MODEL_DIR
        / "random_forest_baseline.pkl"
    )

    tuned_model_path = (
        MODEL_DIR
        / "random_forest_tuned.pkl"
    )

    joblib.dump(
        baseline_pipeline,
        baseline_model_path,
    )

    joblib.dump(
        tuned_pipeline,
        tuned_model_path,
    )

    baseline_f1 = float(
        baseline_metrics["Macro F1"]
    )

    tuned_f1 = float(
        tuned_metrics["Macro F1"]
    )

    if tuned_f1 >= baseline_f1:
        best_model = tuned_pipeline
        best_model_name = (
            "Tuned Random Forest"
        )
        best_metrics = tuned_metrics
    else:
        best_model = baseline_pipeline
        best_model_name = (
            "Baseline Random Forest"
        )
        best_metrics = baseline_metrics

    print(
        "\nTesting selected model with "
        "obvious academic examples..."
    )

    test_obvious_examples(
        best_model
    )

    best_model_path = (
        MODEL_DIR
        / "random_forest_best.pkl"
    )

    joblib.dump(
        best_model,
        best_model_path,
    )

    comparison_dataframe = pd.DataFrame(
        [
            baseline_metrics,
            tuned_metrics,
        ]
    )

    comparison_dataframe.to_csv(
        REPORT_DIR
        / "model_comparison.csv",
        index=False,
    )

    training_features_report = pd.DataFrame(
        {
            "Feature": FEATURE_COLUMNS,
            "Type": [
                "numeric",
                "numeric",
                "numeric",
                "numeric",
                "numeric",
                "categorical",
                "categorical",
            ],
        }
    )

    training_features_report.to_csv(
        REPORT_DIR
        / "training_features.csv",
        index=False,
    )

    class_distribution_report = (
        combined_distribution
        .rename_axis("Risk Level")
        .reset_index(name="Count")
    )

    class_distribution_report.to_csv(
        REPORT_DIR
        / "training_class_distribution.csv",
        index=False,
    )

    print(
        "\n=============================================="
    )

    print(
        "TRAINING COMPLETED SUCCESSFULLY"
    )

    print(
        "=============================================="
    )

    print(
        "\nBest model:",
        best_model_name,
    )

    print(
        "\nBest model metrics:"
    )

    for metric_name, metric_value in (
        best_metrics.items()
    ):
        print(
            f"{metric_name}: {metric_value}"
        )

    print(
        "\nBest model saved to:"
    )

    print(best_model_path)

    print(
        "\nBaseline model saved to:"
    )

    print(baseline_model_path)

    print(
        "\nTuned model saved to:"
    )

    print(tuned_model_path)

    print(
        "\nBest tuned parameters:"
    )

    print(search.best_params_)

    print(
        "\nSynthetic training data saved to:"
    )

    print(SYNTHETIC_DATA_PATH)

    print(
        "\nCombined training data saved to:"
    )

    print(COMBINED_DATA_PATH)


# ============================================================
# 11. ENTRY POINT
# ============================================================

if __name__ == "__main__":
    train_models()