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

GENDERS = [
    "Male",
    "Female",
    "Other",
]

RANDOM_STATE = 42


# ============================================================
# 3. NORMALISATION HELPERS
# ============================================================

def normalize_gender(
    value: object,
) -> str:
    if pd.isna(value):
        return "Other"

    normalized = (
        str(value)
        .strip()
        .title()
    )

    if normalized in GENDERS:
        return normalized

    return "Other"


def create_one_hot_encoder() -> OneHotEncoder:
    """
    Create a dense OneHotEncoder compatible with
    newer and older scikit-learn versions.
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
# 4. EVALUATE GENERAL MODEL PERFORMANCE
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
        labels=EXPECTED_CLASSES,
        average="macro",
        zero_division=0,
    )

    macro_recall = recall_score(
        test_target,
        predictions,
        labels=EXPECTED_CLASSES,
        average="macro",
        zero_division=0,
    )

    macro_f1 = f1_score(
        test_target,
        predictions,
        labels=EXPECTED_CLASSES,
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
        "Balanced Accuracy": (
            balanced_accuracy
        ),
        "Macro Precision": (
            macro_precision
        ),
        "Macro Recall": (
            macro_recall
        ),
        "Macro F1": macro_f1,
    }


# ============================================================
# 5. CREATE GENDER QUOTAS
# ============================================================

def create_gender_quotas(
    rows_per_class: int,
) -> dict[str, int]:
    """
    Divide every risk class approximately equally
    among Male, Female and Other.
    """

    base_count = (
        rows_per_class
        // len(GENDERS)
    )

    remainder = (
        rows_per_class
        % len(GENDERS)
    )

    quotas: dict[str, int] = {}

    for index, gender in enumerate(
        GENDERS
    ):
        quotas[gender] = (
            base_count
            + (
                1
                if index < remainder
                else 0
            )
        )

    return quotas


# ============================================================
# 6. GENERATE RISK- AND GENDER-BALANCED DATA
# ============================================================

def generate_balanced_synthetic_data(
    rows_per_class: int = 1000,
    random_state: int = RANDOM_STATE,
) -> pd.DataFrame:
    """
    Generate balanced academic profiles for High,
    Medium and Low Risk.

    Each risk class also contains approximately equal
    numbers of Male, Female and Other students.

    The target is based only on academic indicators.
    Gender is not used when creating the target label.
    """

    if rows_per_class <= 0:
        raise ValueError(
            "rows_per_class must be greater than zero."
        )

    rng = np.random.default_rng(
        random_state
    )

    gender_quotas = (
        create_gender_quotas(
            rows_per_class
        )
    )

    profiles: dict[
        str,
        dict[
            str,
            list[dict[str, object]],
        ],
    ] = {
        risk_level: {
            gender: []
            for gender in GENDERS
        }
        for risk_level in EXPECTED_CLASSES
    }

    maximum_attempts = (
        rows_per_class * 500
    )

    attempts = 0

    def generation_complete() -> bool:
        for risk_level in EXPECTED_CLASSES:
            for gender in GENDERS:
                if (
                    len(
                        profiles[
                            risk_level
                        ][gender]
                    )
                    < gender_quotas[gender]
                ):
                    return False

        return True

    while (
        not generation_complete()
        and attempts < maximum_attempts
    ):
        attempts += 1

        academic_profile: dict[
            str,
            object,
        ] = {
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
        }

        performance_score = (
            calculate_performance_score(
                academic_profile
            )
        )

        risk_level = (
            create_academic_risk(
                performance_score
            )
        )

        if (
            risk_level
            not in profiles
        ):
            continue

        available_genders = [
            gender
            for gender in GENDERS
            if (
                len(
                    profiles[
                        risk_level
                    ][gender]
                )
                < gender_quotas[gender]
            )
        ]

        if not available_genders:
            continue

        selected_gender = str(
            rng.choice(
                available_genders
            )
        )

        profiles[
            risk_level
        ][selected_gender].append(
            {
                **academic_profile,
                "gender": (
                    selected_gender
                ),
                "performance_score": (
                    performance_score
                ),
                TARGET_COLUMN: (
                    risk_level
                ),
            }
        )

    incomplete_groups: dict[
        str,
        int,
    ] = {}

    for risk_level in EXPECTED_CLASSES:
        for gender in GENDERS:
            current_count = len(
                profiles[
                    risk_level
                ][gender]
            )

            expected_count = (
                gender_quotas[gender]
            )

            if (
                current_count
                < expected_count
            ):
                incomplete_groups[
                    (
                        f"{risk_level} | "
                        f"{gender}"
                    )
                ] = current_count

    if incomplete_groups:
        raise RuntimeError(
            "Could not generate enough balanced "
            "synthetic records. Generated counts: "
            f"{incomplete_groups}"
        )

    rows: list[
        dict[str, object]
    ] = []

    for risk_level in EXPECTED_CLASSES:
        for gender in GENDERS:
            rows.extend(
                profiles[
                    risk_level
                ][gender]
            )

    synthetic_dataframe = (
        pd.DataFrame(rows)
        .sample(
            frac=1,
            random_state=random_state,
        )
        .reset_index(drop=True)
    )

    return synthetic_dataframe


# ============================================================
# 7. VALIDATE DATASET
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
        if column
        not in dataframe.columns
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
        .map(normalize_gender)
    )

    dataframe[TARGET_COLUMN] = (
        dataframe[TARGET_COLUMN]
        .astype("string")
        .str.strip()
        .str.title()
    )

    dataframe.dropna(
        subset=(
            NUMERIC_FEATURES
            + [
                "semester",
                TARGET_COLUMN,
            ]
        ),
        inplace=True,
    )

    invalid_risk_classes = sorted(
        set(
            dataframe[
                TARGET_COLUMN
            ].unique()
        )
        - set(EXPECTED_CLASSES)
    )

    if invalid_risk_classes:
        raise ValueError(
            "Dataset contains invalid risk labels: "
            f"{invalid_risk_classes}"
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
# 8. CREATE FAIRNESS-AWARE SAMPLE WEIGHTS
# ============================================================

def create_fairness_weights(
    features: pd.DataFrame,
    target: pd.Series,
) -> np.ndarray:
    """
    Reweight each gender-risk combination.

    Underrepresented gender-risk groups receive
    higher training importance, while overrepresented
    groups receive lower importance.
    """

    genders = (
        features["gender"]
        .map(normalize_gender)
        .astype(str)
    )

    target_values = pd.Series(
        np.asarray(target),
        index=features.index,
        dtype="string",
    )

    combined_groups = (
        genders
        + " | "
        + target_values.astype(str)
    )

    group_counts = (
        combined_groups
        .value_counts()
    )

    if group_counts.empty:
        raise ValueError(
            "Cannot create fairness weights "
            "from an empty training dataset."
        )

    total_samples = len(
        combined_groups
    )

    total_groups = len(
        group_counts
    )

    raw_weights = (
        combined_groups.map(
            lambda group_name: (
                total_samples
                / (
                    total_groups
                    * group_counts[
                        group_name
                    ]
                )
            )
        )
        .astype(float)
        .to_numpy()
    )

    mean_weight = float(
        np.mean(raw_weights)
    )

    if mean_weight > 0:
        raw_weights = (
            raw_weights
            / mean_weight
        )

    # Prevent very small real-data groups from
    # receiving extreme weights.
    fairness_weights = np.clip(
        raw_weights,
        0.25,
        4.0,
    )

    print(
        "\nGender-risk training groups:"
    )

    print(
        group_counts.sort_index()
    )

    weight_summary = pd.DataFrame(
        {
            "Group": combined_groups,
            "Weight": fairness_weights,
        }
    )

    print(
        "\nAverage sample weight "
        "by gender-risk group:"
    )

    print(
        weight_summary
        .groupby("Group")["Weight"]
        .mean()
        .round(4)
        .sort_index()
    )

    return fairness_weights


# ============================================================
# 9. CREATE PREPROCESSING PIPELINE
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
# 10. CREATE BASELINE PIPELINE
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
                    random_state=(
                        RANDOM_STATE
                    ),
                    n_jobs=-1,
                ),
            ),
        ]
    )


# ============================================================
# 11. GENDER FAIRNESS REPORT
# ============================================================

def evaluate_gender_fairness(
    model_name: str,
    model: Pipeline,
    test_features: pd.DataFrame,
    test_target: pd.Series,
) -> pd.DataFrame:
    """
    Evaluate model performance separately for
    Male, Female and Other students.
    """

    predictions = model.predict(
        test_features
    )

    genders = (
        test_features["gender"]
        .map(normalize_gender)
    )

    actual_values = np.asarray(
        test_target
    )

    rows: list[
        dict[str, object]
    ] = []

    for gender in GENDERS:
        mask = (
            genders == gender
        ).to_numpy()

        if not np.any(mask):
            continue

        group_actual = (
            actual_values[mask]
        )

        group_predictions = (
            predictions[mask]
        )

        group_accuracy = (
            accuracy_score(
                group_actual,
                group_predictions,
            )
        )

        group_macro_f1 = f1_score(
            group_actual,
            group_predictions,
            labels=EXPECTED_CLASSES,
            average="macro",
            zero_division=0,
        )

        high_risk_recall = recall_score(
            (
                group_actual
                == "High Risk"
            ),
            (
                group_predictions
                == "High Risk"
            ),
            zero_division=0,
        )

        actual_high_risk_rate = float(
            np.mean(
                group_actual
                == "High Risk"
            )
        )

        predicted_high_risk_rate = float(
            np.mean(
                group_predictions
                == "High Risk"
            )
        )

        rows.append(
            {
                "Model": model_name,
                "Gender": gender,
                "Samples": len(
                    group_actual
                ),
                "Accuracy": (
                    group_accuracy
                ),
                "Macro F1": (
                    group_macro_f1
                ),
                "High Risk Recall": (
                    high_risk_recall
                ),
                "Actual High Risk Rate": (
                    actual_high_risk_rate
                ),
                "Predicted High Risk Rate": (
                    predicted_high_risk_rate
                ),
            }
        )

    fairness_dataframe = pd.DataFrame(
        rows
    )

    print(
        f"\n========== {model_name} "
        "GENDER FAIRNESS REPORT =========="
    )

    if fairness_dataframe.empty:
        print(
            "No gender-group results are available."
        )

        return fairness_dataframe

    printable_dataframe = (
        fairness_dataframe.copy()
    )

    numeric_columns = [
        "Accuracy",
        "Macro F1",
        "High Risk Recall",
        "Actual High Risk Rate",
        "Predicted High Risk Rate",
    ]

    printable_dataframe[
        numeric_columns
    ] = (
        printable_dataframe[
            numeric_columns
        ].round(4)
    )

    print(
        printable_dataframe.to_string(
            index=False
        )
    )

    accuracy_gap = (
        fairness_dataframe[
            "Accuracy"
        ].max()
        - fairness_dataframe[
            "Accuracy"
        ].min()
    )

    macro_f1_gap = (
        fairness_dataframe[
            "Macro F1"
        ].max()
        - fairness_dataframe[
            "Macro F1"
        ].min()
    )

    high_risk_recall_gap = (
        fairness_dataframe[
            "High Risk Recall"
        ].max()
        - fairness_dataframe[
            "High Risk Recall"
        ].min()
    )

    print(
        "\nAccuracy gap: "
        f"{accuracy_gap:.4f}"
    )

    print(
        "Macro F1 gap: "
        f"{macro_f1_gap:.4f}"
    )

    print(
        "High Risk Recall gap: "
        f"{high_risk_recall_gap:.4f}"
    )

    return fairness_dataframe


# ============================================================
# 12. TEST OBVIOUS EXAMPLES
# ============================================================

def get_obvious_test_cases() -> list[
    dict[str, object]
]:
    return [
        {
            "name": (
                "High-risk example"
            ),
            "expected": "High Risk",
            "features": {
                "attendance": 19,
                "internal_marks": 10,
                "assignment_score": 1,
                "quiz_score": 1,
                "previous_gpa": 1.0,
                "semester": 6,
            },
        },
        {
            "name": (
                "Medium-risk example"
            ),
            "expected": "Medium Risk",
            "features": {
                "attendance": 62,
                "internal_marks": 55,
                "assignment_score": 60,
                "quiz_score": 58,
                "previous_gpa": 2.4,
                "semester": 5,
            },
        },
        {
            "name": (
                "Low-risk example"
            ),
            "expected": "Low Risk",
            "features": {
                "attendance": 90,
                "internal_marks": 85,
                "assignment_score": 88,
                "quiz_score": 82,
                "previous_gpa": 3.6,
                "semester": 4,
            },
        },
    ]


def test_obvious_examples(
    model: Pipeline,
) -> None:
    test_cases = (
        get_obvious_test_cases()
    )

    print(
        "\n========== OBVIOUS CASE TESTS =========="
    )

    failed_cases: list[str] = []

    for test_case in test_cases:
        features = dict(
            test_case["features"]
        )

        features["gender"] = (
            "Female"
        )

        test_dataframe = pd.DataFrame(
            [features]
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
            str(class_name): float(
                probability
            )
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
                str(
                    test_case["name"]
                )
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
# 13. GENDER SENSITIVITY TEST
# ============================================================

def test_gender_sensitivity(
    model: Pipeline,
) -> pd.DataFrame:
    """
    Keep academic indicators unchanged and change
    only gender.

    Obvious academic profiles should retain the
    same predicted risk class.
    """

    test_cases = (
        get_obvious_test_cases()
    )

    report_rows: list[
        dict[str, object]
    ] = []

    failed_cases: list[str] = []

    print(
        "\n========== GENDER SENSITIVITY TEST =========="
    )

    for test_case in test_cases:
        case_predictions: list[str] = []

        expected_class = str(
            test_case["expected"]
        )

        expected_probabilities: list[
            float
        ] = []

        print(
            f"\n{test_case['name']}"
        )

        for gender in GENDERS:
            test_features = {
                **dict(
                    test_case[
                        "features"
                    ]
                ),
                "gender": gender,
            }

            test_dataframe = pd.DataFrame(
                [test_features]
            )

            prediction = str(
                model.predict(
                    test_dataframe
                )[0]
            )

            raw_probabilities = (
                model.predict_proba(
                    test_dataframe
                )[0]
            )

            probability_map = {
                str(class_name): float(
                    probability
                )
                for class_name, probability
                in zip(
                    model.classes_,
                    raw_probabilities,
                )
            }

            expected_probability = (
                probability_map.get(
                    expected_class,
                    0.0,
                )
            )

            case_predictions.append(
                prediction
            )

            expected_probabilities.append(
                expected_probability
            )

            print(
                f"{gender}: "
                f"{prediction} | "
                f"{probability_map}"
            )

            report_rows.append(
                {
                    "Test Case": (
                        test_case["name"]
                    ),
                    "Expected Class": (
                        expected_class
                    ),
                    "Gender": gender,
                    "Predicted Class": (
                        prediction
                    ),
                    "High Risk Probability": (
                        probability_map.get(
                            "High Risk",
                            0.0,
                        )
                    ),
                    "Medium Risk Probability": (
                        probability_map.get(
                            "Medium Risk",
                            0.0,
                        )
                    ),
                    "Low Risk Probability": (
                        probability_map.get(
                            "Low Risk",
                            0.0,
                        )
                    ),
                }
            )

            if (
                prediction
                != expected_class
            ):
                failed_cases.append(
                    (
                        f"{test_case['name']} "
                        f"with gender {gender}"
                    )
                )

        unique_predictions = set(
            case_predictions
        )

        if len(unique_predictions) > 1:
            failed_cases.append(
                (
                    f"{test_case['name']} "
                    "changed class when only "
                    "gender was changed"
                )
            )

        probability_spread = (
            max(
                expected_probabilities
            )
            - min(
                expected_probabilities
            )
        )

        print(
            "Expected-class probability "
            "difference across genders: "
            f"{probability_spread:.4f}"
        )

        if probability_spread > 0.05:
            print(
                "Warning: gender changed the "
                "expected-class probability by "
                "more than 5 percentage points."
            )

    if failed_cases:
        raise RuntimeError(
            "Gender sensitivity tests failed: "
            f"{failed_cases}"
        )

    print(
        "\nGender sensitivity tests passed."
    )

    return pd.DataFrame(
        report_rows
    )


# ============================================================
# 14. TRAIN MODELS
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
        "\nOriginal gender-risk distribution:"
    )

    print(
        pd.crosstab(
            real_training_data[
                "gender"
            ],
            real_training_data[
                TARGET_COLUMN
            ],
        )
    )

    print(
        "\nGenerating risk- and "
        "gender-balanced synthetic data..."
    )

    synthetic_training_data = (
        generate_balanced_synthetic_data(
            rows_per_class=1000,
            random_state=RANDOM_STATE,
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

    print(
        "\nSynthetic gender-risk distribution:"
    )

    print(
        pd.crosstab(
            synthetic_training_data[
                "gender"
            ],
            synthetic_training_data[
                TARGET_COLUMN
            ],
        )
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
            random_state=RANDOM_STATE,
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

    print(
        combined_distribution
    )

    print(
        "\nCombined gender-risk distribution:"
    )

    combined_gender_risk_report = (
        combined_dataframe
        .groupby(
            [
                "gender",
                TARGET_COLUMN,
            ],
            observed=False,
        )
        .size()
        .reset_index(
            name="Count"
        )
    )

    print(
        combined_gender_risk_report
        .to_string(
            index=False
        )
    )

    combined_gender_risk_report.to_csv(
        REPORT_DIR
        / "training_gender_risk_distribution.csv",
        index=False,
    )

    missing_classes = [
        risk_class
        for risk_class in EXPECTED_CLASSES
        if (
            risk_class
            not in combined_distribution.index
        )
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
        if (
            combined_distribution.get(
                risk_class,
                0,
            )
            < 2
        )
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

    joint_stratification = (
        target.astype(str)
        + " | "
        + features[
            "gender"
        ].astype(str)
    )

    joint_group_counts = (
        joint_stratification
        .value_counts()
    )

    if (
        not joint_group_counts.empty
        and (
            joint_group_counts >= 2
        ).all()
    ):
        stratification_values = (
            joint_stratification
        )

        print(
            "\nUsing risk + gender "
            "stratified train/test split."
        )
    else:
        stratification_values = target

        print(
            "\nUsing risk-only stratified "
            "train/test split."
        )

    (
        training_features,
        testing_features,
        training_target,
        testing_target,
    ) = train_test_split(
        features,
        target,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=stratification_values,
    )

    print(
        "\nTraining samples:",
        len(training_features),
    )

    print(
        "Testing samples:",
        len(testing_features),
    )

    fairness_weights = (
        create_fairness_weights(
            training_features,
            training_target,
        )
    )

    baseline_pipeline = (
        create_baseline_pipeline()
    )

    print(
        "\nTraining baseline model "
        "with fairness weights..."
    )

    baseline_pipeline.fit(
        training_features,
        training_target,
        classifier__sample_weight=(
            fairness_weights
        ),
    )

    baseline_metrics = evaluate_model(
        "Baseline Random Forest",
        baseline_pipeline,
        testing_features,
        testing_target,
    )

    baseline_fairness = (
        evaluate_gender_fairness(
            "Baseline Random Forest",
            baseline_pipeline,
            testing_features,
            testing_target,
        )
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
        estimator=(
            create_baseline_pipeline()
        ),
        param_distributions=(
            parameter_distributions
        ),
        n_iter=15,
        scoring="f1_macro",
        cv=3,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        verbose=1,
        refit=True,
    )

    print(
        "\nTraining tuned model "
        "with fairness weights..."
    )

    search.fit(
        training_features,
        training_target,
        classifier__sample_weight=(
            fairness_weights
        ),
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

    tuned_fairness = (
        evaluate_gender_fairness(
            "Tuned Random Forest",
            tuned_pipeline,
            testing_features,
            testing_target,
        )
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
        baseline_metrics[
            "Macro F1"
        ]
    )

    tuned_f1 = float(
        tuned_metrics[
            "Macro F1"
        ]
    )

    if tuned_f1 >= baseline_f1:
        best_model = (
            tuned_pipeline
        )

        best_model_name = (
            "Tuned Random Forest"
        )

        best_metrics = (
            tuned_metrics
        )

        best_fairness = (
            tuned_fairness
        )
    else:
        best_model = (
            baseline_pipeline
        )

        best_model_name = (
            "Baseline Random Forest"
        )

        best_metrics = (
            baseline_metrics
        )

        best_fairness = (
            baseline_fairness
        )

    print(
        "\nTesting selected model with "
        "obvious academic examples..."
    )

    test_obvious_examples(
        best_model
    )

    gender_sensitivity_report = (
        test_gender_sensitivity(
            best_model
        )
    )

    best_model_path = (
        MODEL_DIR
        / "random_forest_best.pkl"
    )

    joblib.dump(
        best_model,
        best_model_path,
    )

    comparison_dataframe = (
        pd.DataFrame(
            [
                baseline_metrics,
                tuned_metrics,
            ]
        )
    )

    comparison_dataframe.to_csv(
        REPORT_DIR
        / "model_comparison.csv",
        index=False,
    )

    baseline_fairness.to_csv(
        REPORT_DIR
        / "gender_fairness_baseline.csv",
        index=False,
    )

    tuned_fairness.to_csv(
        REPORT_DIR
        / "gender_fairness_tuned.csv",
        index=False,
    )

    best_fairness.to_csv(
        REPORT_DIR
        / "gender_fairness_selected_model.csv",
        index=False,
    )

    gender_sensitivity_report.to_csv(
        REPORT_DIR
        / "gender_sensitivity_report.csv",
        index=False,
    )

    training_features_report = (
        pd.DataFrame(
            {
                "Feature": (
                    FEATURE_COLUMNS
                ),
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
    )

    training_features_report.to_csv(
        REPORT_DIR
        / "training_features.csv",
        index=False,
    )

    class_distribution_report = (
        combined_distribution
        .rename_axis(
            "Risk Level"
        )
        .reset_index(
            name="Count"
        )
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

    for (
        metric_name,
        metric_value,
    ) in best_metrics.items():
        print(
            f"{metric_name}: "
            f"{metric_value}"
        )

    print(
        "\nBest model saved to:"
    )

    print(
        best_model_path
    )

    print(
        "\nBaseline model saved to:"
    )

    print(
        baseline_model_path
    )

    print(
        "\nTuned model saved to:"
    )

    print(
        tuned_model_path
    )

    print(
        "\nBest tuned parameters:"
    )

    print(
        search.best_params_
    )

    print(
        "\nSynthetic training data saved to:"
    )

    print(
        SYNTHETIC_DATA_PATH
    )

    print(
        "\nCombined training data saved to:"
    )

    print(
        COMBINED_DATA_PATH
    )

    print(
        "\nFairness reports saved to:"
    )

    print(
        REPORT_DIR
        / "gender_fairness_selected_model.csv"
    )

    print(
        REPORT_DIR
        / "gender_sensitivity_report.csv"
    )


# ============================================================
# 15. ENTRY POINT
# ============================================================

if __name__ == "__main__":
    train_models()