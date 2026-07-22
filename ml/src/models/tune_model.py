import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import (
    train_test_split,
    GridSearchCV,
    StratifiedKFold
)

from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score
)


# ============================================================
# 1. LOAD PROCESSED DATASET
# ============================================================

data_path = Path(
    "data/processed/student_performance_processed.csv"
)

df = pd.read_csv(data_path)

print("Dataset loaded successfully.")

print("\n========== DATASET SHAPE ==========")
print(df.shape)


# ============================================================
# 2. SEPARATE FEATURES AND TARGET
# ============================================================

X = df.drop(
    columns=["AcademicRisk"]
)

y = df["AcademicRisk"]


print("\n========== TARGET DISTRIBUTION ==========")
print(y.value_counts())


# ============================================================
# 3. TRAIN-TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\n========== TRAIN-TEST SPLIT ==========")

print(
    "Training samples:",
    len(X_train)
)

print(
    "Testing samples:",
    len(X_test)
)


# ============================================================
# 4. DEFINE RANDOM FOREST MODEL
# ============================================================

rf_model = RandomForestClassifier(
    random_state=42,
    n_jobs=-1
)


# ============================================================
# 5. DEFINE HYPERPARAMETER GRID
# ============================================================

param_grid = {

    "n_estimators": [
        100,
        200
    ],

    "max_depth": [
        None,
        10,
        20
    ],

    "min_samples_split": [
        2,
        5
    ],

    "min_samples_leaf": [
        1,
        2
    ],

    "max_features": [
        "sqrt",
        "log2"
    ],

    "class_weight": [
        None,
        "balanced"
    ]
}


# ============================================================
# 6. STRATIFIED CROSS-VALIDATION
# ============================================================

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


# ============================================================
# 7. GRID SEARCH
# ============================================================

grid_search = GridSearchCV(
    estimator=rf_model,
    param_grid=param_grid,
    scoring="f1_macro",
    cv=cv,
    n_jobs=-1,
    verbose=1
)


print(
    "\n========== HYPERPARAMETER TUNING =========="
)

print(
    "Starting Random Forest GridSearchCV..."
)

print(
    "Optimization metric: Macro F1-score"
)


# ============================================================
# 8. TRAIN GRID SEARCH
# ============================================================

grid_search.fit(
    X_train,
    y_train
)


# ============================================================
# 9. DISPLAY BEST PARAMETERS
# ============================================================

print(
    "\n========== BEST PARAMETERS =========="
)

print(
    grid_search.best_params_
)


print(
    "\n========== BEST CROSS-VALIDATION SCORE =========="
)

print(
    f"{grid_search.best_score_:.4f}"
)


# ============================================================
# 10. GET BEST RANDOM FOREST MODEL
# ============================================================

best_model = grid_search.best_estimator_


print(
    "\n========== BEST MODEL =========="
)

print(
    best_model
)


# ============================================================
# 11. PREDICT TEST DATA
# ============================================================

y_pred = best_model.predict(
    X_test
)


# ============================================================
# 12. EVALUATE TUNED MODEL
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)


balanced_accuracy = balanced_accuracy_score(
    y_test,
    y_pred
)


macro_f1 = f1_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0
)


print(
    "\n========== TUNED MODEL RESULTS =========="
)

print(
    f"Accuracy: {accuracy:.4f}"
)

print(
    f"Balanced Accuracy: {balanced_accuracy:.4f}"
)

print(
    f"Macro F1-Score: {macro_f1:.4f}"
)


# ============================================================
# 13. CLASSIFICATION REPORT
# ============================================================

print(
    "\n========== CLASSIFICATION REPORT =========="
)

print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)


# ============================================================
# 14. CONFUSION MATRIX
# ============================================================

labels = [
    "High Risk",
    "Medium Risk",
    "Low Risk"
]


cm = confusion_matrix(
    y_test,
    y_pred,
    labels=labels
)


print(
    "\n========== CONFUSION MATRIX =========="
)

print(
    "Class order:"
)

print(
    labels
)

print(
    cm
)


# ============================================================
# 15. SAVE TUNED MODEL
# ============================================================

model_path = Path(
    "models/trained/random_forest_tuned.pkl"
)


joblib.dump(
    best_model,
    model_path
)


print(
    "\n========== MODEL SAVING =========="
)

print(
    "Tuned Random Forest model saved successfully."
)

print(
    f"Model path: {model_path}"
)