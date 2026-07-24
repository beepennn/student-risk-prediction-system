import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split

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
# 3. SAME TRAIN-TEST SPLIT USED DURING TRAINING
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

print("\nTesting target distribution:")

print(
    y_test.value_counts()
)


# ============================================================
# 4. MODEL PATHS
# ============================================================

baseline_path = Path(
    "models/trained/random_forest_baseline.pkl"
)

tuned_path = Path(
    "models/trained/random_forest_tuned.pkl"
)


# ============================================================
# 5. LOAD MODELS
# ============================================================

print("\n========== MODEL LOADING ==========")

baseline_model = joblib.load(
    baseline_path
)

print(
    "Baseline Random Forest loaded successfully."
)


tuned_model = joblib.load(
    tuned_path
)

print(
    "Tuned Random Forest loaded successfully."
)


# ============================================================
# 6. DEFINE EVALUATION FUNCTION
# ============================================================

def evaluate_model(
    model,
    model_name
):

    print(
        f"\n\n{'=' * 60}"
    )

    print(
        f"{model_name}"
    )

    print(
        f"{'=' * 60}"
    )

    # Make predictions
    y_pred = model.predict(
        X_test
    )

    # Calculate metrics
    accuracy = accuracy_score(
        y_test,
        y_pred
    )

    balanced_accuracy = balanced_accuracy_score(
        y_test,
        y_pred
    )

    macro_precision = precision_score(
        y_test,
        y_pred,
        average="macro",
        zero_division=0
    )

    macro_recall = recall_score(
        y_test,
        y_pred,
        average="macro",
        zero_division=0
    )

    macro_f1 = f1_score(
        y_test,
        y_pred,
        average="macro",
        zero_division=0
    )

    # Per-class recall
    class_recalls = recall_score(
        y_test,
        y_pred,
        labels=[
            "High Risk",
            "Medium Risk",
            "Low Risk"
        ],
        average=None,
        zero_division=0
    )

    print("\n========== PERFORMANCE METRICS ==========")

    print(
        f"Accuracy: {accuracy:.4f}"
    )

    print(
        f"Balanced Accuracy: {balanced_accuracy:.4f}"
    )

    print(
        f"Macro Precision: {macro_precision:.4f}"
    )

    print(
        f"Macro Recall: {macro_recall:.4f}"
    )

    print(
        f"Macro F1-Score: {macro_f1:.4f}"
    )

    print("\n========== CLASS RECALL ==========")

    print(
        f"High Risk Recall: {class_recalls[0]:.4f}"
    )

    print(
        f"Medium Risk Recall: {class_recalls[1]:.4f}"
    )

    print(
        f"Low Risk Recall: {class_recalls[2]:.4f}"
    )

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

    print(
        "========== CONFUSION MATRIX =========="
    )

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
        "Class order:"
    )

    print(
        labels
    )

    print(
        cm
    )

    return {
        "Model": model_name,
        "Accuracy": accuracy,
        "Balanced Accuracy": balanced_accuracy,
        "Macro Precision": macro_precision,
        "Macro Recall": macro_recall,
        "Macro F1": macro_f1,
        "High Risk Recall": class_recalls[0],
        "Medium Risk Recall": class_recalls[1],
        "Low Risk Recall": class_recalls[2]
    }


# ============================================================
# 7. EVALUATE BOTH MODELS
# ============================================================

baseline_results = evaluate_model(
    baseline_model,
    "BASELINE RANDOM FOREST"
)

tuned_results = evaluate_model(
    tuned_model,
    "TUNED RANDOM FOREST"
)


# ============================================================
# 8. FINAL COMPARISON
# ============================================================

comparison = pd.DataFrame(
    [
        baseline_results,
        tuned_results
    ]
)


print(
    "\n\n"
)

print(
    "=" * 80
)

print(
    "FINAL MODEL COMPARISON"
)

print(
    "=" * 80
)

print(
    comparison.to_string(
        index=False
    )
)


# ============================================================
# 9. SAVE COMPARISON RESULTS
# ============================================================

report_path = Path(
    "reports/model_comparison.csv"
)

comparison.to_csv(
    report_path,
    index=False
)


print(
    "\n========== COMPARISON SAVED =========="
)

print(
    f"Results saved to: {report_path}"
)