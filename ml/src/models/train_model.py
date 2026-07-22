import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

import joblib


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
# 2. SEPARATE FEATURES (X) AND TARGET (y)
# ============================================================

X = df.drop(
    columns=["AcademicRisk"]
)

y = df["AcademicRisk"]


print("\n========== FEATURES ==========")
print(X.columns.tolist())


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

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


print("\nTraining target distribution:")
print(y_train.value_counts())


print("\nTesting target distribution:")
print(y_test.value_counts())


# ============================================================
# 4. CREATE RANDOM FOREST CLASSIFIER
# ============================================================

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)


# ============================================================
# 5. TRAIN RANDOM FOREST MODEL
# ============================================================

print("\n========== MODEL TRAINING ==========")

model.fit(
    X_train,
    y_train
)

print("Random Forest model trained successfully.")


# ============================================================
# 6. MAKE PREDICTIONS
# ============================================================

y_pred = model.predict(
    X_test
)


# ============================================================
# 7. BASELINE MODEL EVALUATION
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)


print("\n========== BASELINE MODEL RESULTS ==========")

print(
    f"Accuracy: {accuracy:.4f}"
)


print("\n========== CLASSIFICATION REPORT ==========")

print(
    classification_report(
        y_test,
        y_pred
    )
)


# ============================================================
# 8. SAVE TRAINED MODEL
# ============================================================

model_path = Path(
    "models/trained/random_forest_baseline.pkl"
)


joblib.dump(
    model,
    model_path
)


print("\n========== MODEL SAVING ==========")

print(
    "Model saved successfully."
)

print(
    f"Model path: {model_path}"
)