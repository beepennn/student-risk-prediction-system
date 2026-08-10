import pandas as pd
import joblib

from pathlib import Path


# ============================================================
# 1. LOAD PROCESSED DATASET
# ============================================================

data_path = Path(
    "data/processed/student_performance_processed.csv"
)

df = pd.read_csv(data_path)

print("Processed dataset loaded successfully.")


# ============================================================
# 2. SEPARATE FEATURES
# ============================================================

X = df.drop(
    columns=["AcademicRisk"]
)


print("\n========== FEATURES ==========")

print(
    X.columns.tolist()
)


# ============================================================
# 3. LOAD TUNED RANDOM FOREST MODEL
# ============================================================

model_path = Path(
    "models/trained/random_forest_tuned.pkl"
)

model = joblib.load(
    model_path
)


print(
    "\nTuned Random Forest model loaded successfully."
)


# ============================================================
# 4. GET FEATURE IMPORTANCE
# ============================================================

feature_importance = model.feature_importances_


# ============================================================
# 5. CREATE FEATURE IMPORTANCE DATAFRAME
# ============================================================

importance_df = pd.DataFrame(
    {
        "Feature": X.columns,
        "Importance": feature_importance
    }
)


# ============================================================
# 6. SORT FEATURES BY IMPORTANCE
# ============================================================

importance_df = importance_df.sort_values(
    by="Importance",
    ascending=False
)


# Reset index
importance_df = importance_df.reset_index(
    drop=True
)


# ============================================================
# 7. DISPLAY RESULTS
# ============================================================

print(
    "\n========== FEATURE IMPORTANCE =========="
)

print(
    importance_df.to_string(
        index=False
    )
)


# ============================================================
# 8. SAVE RESULTS
# ============================================================

output_path = Path(
    "reports/feature_importance.csv"
)

importance_df.to_csv(
    output_path,
    index=False
)


print(
    "\n========== FEATURE IMPORTANCE SAVED =========="
)

print(
    f"Results saved to: {output_path}"
)