from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    RandomForestClassifier,
)
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


def evaluate_model(
    model_name: str,
    model: Pipeline,
    test_features: pd.DataFrame,
    test_target: pd.Series,
) -> dict[str, float | str]:
    predictions = model.predict(test_features)

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
            zero_division=0,
        )
    )

    print("Confusion matrix:")

    print(
        confusion_matrix(
            test_target,
            predictions,
        )
    )

    return {
        "Model": model_name,
        "Accuracy": accuracy,
        "Balanced Accuracy": (
            balanced_accuracy
        ),
        "Macro Precision": macro_precision,
        "Macro Recall": macro_recall,
        "Macro F1": macro_f1,
    }


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

    dataframe = pd.read_csv(DATA_PATH)

    missing_columns = [
        column
        for column in (
            FEATURE_COLUMNS
            + [TARGET_COLUMN]
        )
        if column not in dataframe.columns
    ]

    if missing_columns:
        raise ValueError(
            "Training dataset is missing columns: "
            f"{missing_columns}"
        )

    features = dataframe[
        FEATURE_COLUMNS
    ].copy()

    target = dataframe[
        TARGET_COLUMN
    ].copy()

    print(
        "Target distribution:"
    )

    print(target.value_counts())

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

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
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

    baseline_pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                preprocessor,
            ),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=300,
                    max_depth=None,
                    min_samples_split=2,
                    min_samples_leaf=1,
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
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
        estimator=baseline_pipeline,
        param_distributions=(
            parameter_distributions
        ),
        n_iter=15,
        scoring="f1_macro",
        cv=3,
        random_state=42,
        n_jobs=-1,
        verbose=1,
    )

    print(
        "\nTraining tuned model..."
    )

    search.fit(
        training_features,
        training_target,
    )

    tuned_pipeline = search.best_estimator_

    tuned_metrics = evaluate_model(
        "Tuned Random Forest",
        tuned_pipeline,
        testing_features,
        testing_target,
    )

    joblib.dump(
        baseline_pipeline,
        MODEL_DIR
        / "random_forest_baseline.pkl",
    )

    joblib.dump(
        tuned_pipeline,
        MODEL_DIR
        / "random_forest_tuned.pkl",
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
    else:
        best_model = baseline_pipeline
        best_model_name = (
            "Baseline Random Forest"
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

    training_features_report = (
        pd.DataFrame(
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
    )

    training_features_report.to_csv(
        REPORT_DIR
        / "training_features.csv",
        index=False,
    )

    print(
        "\nBest model:"
    )

    print(best_model_name)

    print(
        "Best model saved to:"
    )

    print(best_model_path)

    print(
        "\nBest parameters:"
    )

    print(search.best_params_)


if __name__ == "__main__":
    train_models()