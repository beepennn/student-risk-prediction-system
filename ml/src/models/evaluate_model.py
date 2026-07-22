import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix
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


# ============================================================
# 3. RECREATE SAME TRAIN-TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\n========== TEST DATA ==========")

print(
    "Testing samples:",
    len(X_test)
)

print(
    "\nTesting target distribution:"
)

print(
    y_test.value_counts()
)


# ============================================================
# 4. LOAD SAVED RANDOM FOREST MODEL
# ============================================================

model_path = Path(
    "models/trained/random_forest_baseline.pkl"
)

model = joblib.load(
    model_path
)

print(
    "\n========== MODEL LOADING =========="
)

print(
    "Baseline Random Forest model loaded successfully."
)


# ============================================================
# 5. MAKE PREDICTIONS
# ============================================================

y_pred = model.predict(
    X_test
)


# ============================================================
# 6. ACCURACY
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)


print(
    "\n========== ACCURACY =========="
)

print(
    f"Accuracy: {accuracy:.4f}"
)


# ============================================================
# 7. BALANCED ACCURACY
# ============================================================

balanced_accuracy = balanced_accuracy_score(
    y_test,
    y_pred
)


print(
    f"Balanced Accuracy: {balanced_accuracy:.4f}"
)


# ============================================================
# 8. PRECISION
# ============================================================

precision = precision_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0
)


print(
    f"Macro Precision: {precision:.4f}"
)


# ============================================================
# 9. RECALL
# ============================================================

recall = recall_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0
)


print(
    f"Macro Recall: {recall:.4f}"
)


# ============================================================
# 10. F1-SCORE
# ============================================================

f1 = f1_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0
)


print(
    f"Macro F1-Score: {f1:.4f}"
)


# ============================================================
# 11. CLASSIFICATION REPORT
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
# 12. CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_test,
    y_pred,
    labels=[
        "High Risk",
        "Medium Risk",
        "Low Risk"
    ]
)


print(
    "\n========== CONFUSION MATRIX =========="
)

print(
    "Rows = Actual Classes"
)

print(
    "Columns = Predicted Classes"
)

print(
    "Class order:"
)

print(
    ["High Risk", "Medium Risk", "Low Risk"]
)

print(
    cm
)


# ============================================================
# 13. HIGH RISK RECALL
# ============================================================

class_report = classification_report(
    y_test,
    y_pred,
    output_dict=True,
    zero_division=0
)


high_risk_recall = class_report[
    "High Risk"
]["recall"]


print(
    "\n========== HIGH RISK DETECTION =========="
)

print(
    f"High Risk Recall: {high_risk_recall:.4f}"
)


# ============================================================
# 14. FINAL EVALUATION SUMMARY
# ============================================================

print(
    "\n========== EVALUATION SUMMARY =========="
)

print(
    f"Accuracy          : {accuracy:.4f}"
)

print(
    f"Balanced Accuracy : {balanced_accuracy:.4f}"
)

print(
    f"Macro Precision   : {precision:.4f}"
)

print(
    f"Macro Recall      : {recall:.4f}"
)

print(
    f"Macro F1-Score    : {f1:.4f}"
)

print(
    f"High Risk Recall  : {high_risk_recall:.4f}"
)