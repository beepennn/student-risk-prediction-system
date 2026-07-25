import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import (
    train_test_split,
    GridSearchCV
)

from sklearn.compose import ColumnTransformer

from sklearn.pipeline import Pipeline

from sklearn.preprocessing import OneHotEncoder

from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)


# ============================================================
# 1. FILE PATHS
# ============================================================

DATA_PATH = Path(
    "data/raw/student_performance_new_backend_ready.csv"
)

MODEL_DIR = Path(
    "models/trained"
)

REPORT_DIR = Path(
    "reports"
)


# Create directories if they do not exist

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

REPORT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 2. LOAD DATASET
# ============================================================

print(
    "Loading new backend-compatible dataset..."
)

df = pd.read_csv(
    DATA_PATH
)

print(
    "Dataset loaded successfully."
)

print(
    "Original dataset shape:",
    df.shape
)


# ============================================================
# 3. REQUIRED COLUMNS
# ============================================================

required_columns = [

    "Student_ID",

    "First_Name",

    "Last_Name",

    "Gender",

    "Attendance (%)",

    "Internal_marks",

    "Final_Score",

    "Assignments_Avg",

    "Quizzes_score",

    "Previous_gpa",

    "Semester"

]


# Check that all required columns exist

missing_columns = [

    column

    for column in required_columns

    if column not in df.columns

]


if missing_columns:

    raise ValueError(

        "Missing required columns: "

        + str(missing_columns)

    )


print(
    "\nAll required columns are present."
)


# ============================================================
# 4. CHECK MISSING VALUES
# ============================================================

print(
    "\n========== MISSING VALUES =========="
)

print(
    df[
        required_columns
    ].isnull().sum()
)


# Remove rows with missing values

before_rows = len(
    df
)

df = df.dropna(
    subset=required_columns
)

after_rows = len(
    df
)

rows_removed = (

    before_rows

    - after_rows

)


print(
    "\nRows removed due to missing values:",

    rows_removed
)

print(
    "Rows remaining:",

    after_rows
)


# ============================================================
# 5. CREATE ACADEMIC RISK TARGET
# ============================================================

def create_academic_risk(
    score
):

    if score < 60:

        return "High Risk"

    elif score < 80:

        return "Medium Risk"

    else:

        return "Low Risk"


df[
    "AcademicRisk"
] = df[
    "Final_Score"
].apply(
    create_academic_risk
)


# ============================================================
# 6. DISPLAY TARGET DISTRIBUTION
# ============================================================

print(
    "\n========== ACADEMIC RISK DISTRIBUTION =========="
)

print(
    df[
        "AcademicRisk"
    ].value_counts()
)


# ============================================================
# 7. CREATE BACKEND-COMPATIBLE FEATURE NAMES
# ============================================================

# The CSV column names are mapped to the names
# expected by the backend.

df[
    "attendance"
] = df[
    "Attendance (%)"
]


df[
    "internal_marks"
] = df[
    "Internal_marks"
]


df[
    "assignment_score"
] = df[
    "Assignments_Avg"
]


df[
    "quiz_score"
] = df[
    "Quizzes_score"
]


df[
    "previous_gpa"
] = df[
    "Previous_gpa"
]


df[
    "semester"
] = df[
    "Semester"
]


df[
    "gender"
] = df[
    "Gender"
]


# ============================================================
# 8. FINAL ML FEATURES
# ============================================================

feature_columns = [

    "attendance",

    "internal_marks",

    "assignment_score",

    "quiz_score",

    "previous_gpa",

    "semester",

    "gender"

]


target_column = (
    "AcademicRisk"
)


print(
    "\n========== FINAL ML FEATURES =========="
)

print(
    feature_columns
)


print(
    "\n========== TARGET =========="
)

print(
    target_column
)


# ============================================================
# 9. PREPARE X AND y
# ============================================================

X = df[
    feature_columns
].copy()


y = df[
    target_column
].copy()


# ============================================================
# 10. DEFINE FEATURE TYPES
# ============================================================

numeric_features = [

    "attendance",

    "internal_marks",

    "assignment_score",

    "quiz_score",

    "previous_gpa"

]


categorical_features = [

    "semester",

    "gender"

]


# ============================================================
# 11. CREATE PREPROCESSING PIPELINE
# ============================================================

preprocessor = ColumnTransformer(

    transformers=[

        (

            "categorical",

            OneHotEncoder(

                handle_unknown="ignore"

            ),

            categorical_features

        )

    ],

    remainder="passthrough"

)


# ============================================================
# 12. CREATE BASELINE RANDOM FOREST PIPELINE
# ============================================================

baseline_pipeline = Pipeline(

    steps=[

        (

            "preprocessor",

            preprocessor

        ),

        (

            "classifier",

            RandomForestClassifier(

                random_state=42,

                n_estimators=100

            )

        )

    ]

)


# ============================================================
# 13. TRAIN-TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,

    y,

    test_size=0.2,

    random_state=42,

    stratify=y

)


print(
    "\n========== DATA SPLIT =========="
)

print(
    "Training samples:",

    len(X_train)
)

print(
    "Testing samples:",

    len(X_test)
)


# ============================================================
# 14. TRAIN BASELINE MODEL
# ============================================================

print(
    "\n========== TRAINING BASELINE RANDOM FOREST =========="
)


baseline_pipeline.fit(

    X_train,

    y_train

)


print(
    "Baseline Random Forest trained successfully."
)


# ============================================================
# 15. BASELINE PREDICTION
# ============================================================

baseline_predictions = (

    baseline_pipeline.predict(

        X_test

    )

)


# ============================================================
# 16. BASELINE EVALUATION
# ============================================================

baseline_accuracy = accuracy_score(

    y_test,

    baseline_predictions

)


baseline_balanced_accuracy = (

    balanced_accuracy_score(

        y_test,

        baseline_predictions

    )

)


baseline_precision = precision_score(

    y_test,

    baseline_predictions,

    average="macro",

    zero_division=0

)


baseline_recall = recall_score(

    y_test,

    baseline_predictions,

    average="macro",

    zero_division=0

)


baseline_f1 = f1_score(

    y_test,

    baseline_predictions,

    average="macro",

    zero_division=0

)


print(
    "\n========== BASELINE RESULTS =========="
)

print(
    f"Accuracy: {baseline_accuracy:.4f}"
)

print(
    f"Balanced Accuracy: "
    f"{baseline_balanced_accuracy:.4f}"
)

print(
    f"Macro Precision: "
    f"{baseline_precision:.4f}"
)

print(
    f"Macro Recall: "
    f"{baseline_recall:.4f}"
)

print(
    f"Macro F1-Score: "
    f"{baseline_f1:.4f}"
)


print(
    "\n========== BASELINE CLASSIFICATION REPORT =========="
)

print(

    classification_report(

        y_test,

        baseline_predictions,

        zero_division=0

    )

)


print(
    "\n========== BASELINE CONFUSION MATRIX =========="
)

print(

    confusion_matrix(

        y_test,

        baseline_predictions

    )

)


# ============================================================
# 17. SAVE BASELINE PIPELINE
# ============================================================

baseline_model_path = (

    MODEL_DIR

    / "random_forest_baseline.pkl"

)


joblib.dump(

    baseline_pipeline,

    baseline_model_path

)


print(

    "\nBaseline pipeline saved to:",

    baseline_model_path

)


# ============================================================
# 18. HYPERPARAMETER TUNING
# ============================================================

print(

    "\n========== RANDOM FOREST HYPERPARAMETER TUNING =========="

)


param_grid = {

    "classifier__n_estimators": [

        100,

        200

    ],

    "classifier__max_depth": [

        None,

        10,

        20

    ],

    "classifier__min_samples_split": [

        2,

        5

    ],

    "classifier__min_samples_leaf": [

        1,

        2

    ],

    "classifier__class_weight": [

        None,

        "balanced"

    ]

}


grid_search = GridSearchCV(

    estimator=baseline_pipeline,

    param_grid=param_grid,

    scoring="f1_macro",

    cv=5,

    n_jobs=-1,

    verbose=1

)


grid_search.fit(

    X_train,

    y_train

)


print(

    "\nBest parameters:"

)

print(

    grid_search.best_params_

)


print(

    "\nBest cross-validation Macro F1:"

)

print(

    f"{grid_search.best_score_:.4f}"

)


# ============================================================
# 19. GET TUNED MODEL
# ============================================================

tuned_pipeline = (

    grid_search.best_estimator_

)


# ============================================================
# 20. TUNED MODEL PREDICTION
# ============================================================

tuned_predictions = (

    tuned_pipeline.predict(

        X_test

    )

)


# ============================================================
# 21. TUNED MODEL EVALUATION
# ============================================================

tuned_accuracy = accuracy_score(

    y_test,

    tuned_predictions

)


tuned_balanced_accuracy = (

    balanced_accuracy_score(

        y_test,

        tuned_predictions

    )

)


tuned_precision = precision_score(

    y_test,

    tuned_predictions,

    average="macro",

    zero_division=0

)


tuned_recall = recall_score(

    y_test,

    tuned_predictions,

    average="macro",

    zero_division=0

)


tuned_f1 = f1_score(

    y_test,

    tuned_predictions,

    average="macro",

    zero_division=0

)


print(

    "\n========== TUNED RANDOM FOREST RESULTS =========="

)


print(

    f"Accuracy: {tuned_accuracy:.4f}"

)


print(

    f"Balanced Accuracy: "
    f"{tuned_balanced_accuracy:.4f}"

)


print(

    f"Macro Precision: "
    f"{tuned_precision:.4f}"

)


print(

    f"Macro Recall: "
    f"{tuned_recall:.4f}"

)


print(

    f"Macro F1-Score: "
    f"{tuned_f1:.4f}"

)


print(

    "\n========== TUNED CLASSIFICATION REPORT =========="

)


print(

    classification_report(

        y_test,

        tuned_predictions,

        zero_division=0

    )

)


print(

    "\n========== TUNED CONFUSION MATRIX =========="

)


print(

    confusion_matrix(

        y_test,

        tuned_predictions

    )

)


# ============================================================
# 22. SAVE TUNED PIPELINE
# ============================================================

tuned_model_path = (

    MODEL_DIR

    / "random_forest_tuned.pkl"

)


joblib.dump(

    tuned_pipeline,

    tuned_model_path

)


print(

    "\nTuned pipeline saved to:",

    tuned_model_path

)


# ============================================================
# 23. CREATE MODEL COMPARISON REPORT
# ============================================================

comparison_data = {

    "Model": [

        "Baseline Random Forest",

        "Tuned Random Forest"

    ],

    "Accuracy": [

        baseline_accuracy,

        tuned_accuracy

    ],

    "Balanced Accuracy": [

        baseline_balanced_accuracy,

        tuned_balanced_accuracy

    ],

    "Macro Precision": [

        baseline_precision,

        tuned_precision

    ],

    "Macro Recall": [

        baseline_recall,

        tuned_recall

    ],

    "Macro F1": [

        baseline_f1,

        tuned_f1

    ]

}


comparison_df = pd.DataFrame(

    comparison_data

)


comparison_path = (

    REPORT_DIR

    / "model_comparison.csv"

)


comparison_df.to_csv(

    comparison_path,

    index=False

)


print(

    "\n========== MODEL COMPARISON SAVED =========="

)


print(

    comparison_df.to_string(

        index=False

    )

)


print(

    "\nReport saved to:",

    comparison_path

)


# ============================================================
# 24. SAVE TRAINING FEATURE INFORMATION
# ============================================================

feature_info = pd.DataFrame(

    {

        "Feature": feature_columns,

        "Type": [

            "numeric",

            "numeric",

            "numeric",

            "numeric",

            "numeric",

            "categorical",

            "categorical"

        ]

    }

)


feature_info_path = (

    REPORT_DIR

    / "training_features.csv"

)


feature_info.to_csv(

    feature_info_path,

    index=False

)


print(

    "\nTraining feature information saved to:",

    feature_info_path

)


# ============================================================
# 25. FINAL MESSAGE
# ============================================================

print(

    "\n=============================================="

)


print(

    "✅ NEW RANDOM FOREST TRAINING COMPLETED SUCCESSFULLY."

)


print(

    "The complete sklearn Pipeline was saved."

)


print(

    "The pipeline includes preprocessing and Random Forest."

)


print(

    "Backend-compatible input features are ready."

)


print(

    "=============================================="

)