import pandas as pd
import joblib
import shap

from pathlib import Path


# ============================================================
# 1. LOAD PROCESSED DATASET
# ============================================================

data_path = Path(
    "data/processed/student_performance_processed.csv"
)

df = pd.read_csv(data_path)

print("Processed dataset loaded successfully.")

print("\n========== DATASET SHAPE ==========")
print(df.shape)


# ============================================================
# 2. SEPARATE FEATURES AND TARGET
# ============================================================

X = df.drop(
    columns=["AcademicRisk"]
)

y = df["AcademicRisk"]


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
# 4. CREATE SHAP EXPLAINER
# ============================================================

print(
    "\n========== SHAP EXPLAINER =========="
)

explainer = shap.TreeExplainer(
    model
)

print(
    "SHAP TreeExplainer created successfully."
)


# ============================================================
# 5. CALCULATE SHAP VALUES
# ============================================================

print(
    "\nCalculating SHAP values..."
)

shap_values = explainer(
    X
)

print(
    "SHAP values calculated successfully."
)


# ============================================================
# 6. DISPLAY SHAP VALUE INFORMATION
# ============================================================

print(
    "\n========== SHAP VALUE INFORMATION =========="
)

print(
    "SHAP values shape:",
    shap_values.values.shape
)

print(
    "Feature data shape:",
    X.shape
)


# ============================================================
# 7. GLOBAL FEATURE IMPORTANCE USING SHAP
# ============================================================

print(
    "\n========== GLOBAL SHAP FEATURE IMPORTANCE =========="
)

# Calculate mean absolute SHAP value
# across all students and all classes

mean_abs_shap = (
    abs(shap_values.values)
    .mean(axis=2)
    .mean(axis=0)
)


shap_importance_df = pd.DataFrame(
    {
        "Feature": X.columns,
        "Mean_Absolute_SHAP": mean_abs_shap
    }
)


# Sort from highest to lowest

shap_importance_df = (
    shap_importance_df
    .sort_values(
        by="Mean_Absolute_SHAP",
        ascending=False
    )
    .reset_index(
        drop=True
    )
)


print(
    shap_importance_df.to_string(
        index=False
    )
)


# ============================================================
# 8. SAVE GLOBAL SHAP IMPORTANCE
# ============================================================

output_path = Path(
    "reports/shap_feature_importance.csv"
)

shap_importance_df.to_csv(
    output_path,
    index=False
)


print(
    "\n========== SHAP REPORT SAVED =========="
)

print(
    f"Results saved to: {output_path}"
)


# ============================================================
# 9. EXPLAIN ONE SAMPLE STUDENT
# ============================================================

print(
    "\n========== INDIVIDUAL STUDENT EXPLANATION =========="
)

student_index = 0

student_data = X.iloc[
    [student_index]
]

student_prediction = model.predict(
    student_data
)[0]

print(
    "Student index:",
    student_index
)

print(
    "Predicted Academic Risk:",
    student_prediction
)


# ============================================================
# 10. GET SHAP VALUES FOR PREDICTED CLASS
# ============================================================

predicted_class_index = list(
    model.classes_
).index(
    student_prediction
)


student_shap_values = (
    shap_values.values[
        student_index,
        :,
        predicted_class_index
    ]
)


student_explanation_df = pd.DataFrame(
    {
        "Feature": X.columns,
        "Feature_Value": student_data.iloc[0].values,
        "SHAP_Value": student_shap_values
    }
)


# Sort by absolute SHAP value

student_explanation_df[
    "Absolute_SHAP"
] = abs(
    student_explanation_df[
        "SHAP_Value"
    ]
)


student_explanation_df = (
    student_explanation_df
    .sort_values(
        by="Absolute_SHAP",
        ascending=False
    )
    .reset_index(
        drop=True
    )
)


print(
    "\n========== STUDENT FEATURE CONTRIBUTIONS =========="
)

print(
    student_explanation_df.to_string(
        index=False
    )
)


# ============================================================
# 11. SAVE INDIVIDUAL EXPLANATION
# ============================================================

individual_output_path = Path(
    "reports/student_0_shap_explanation.csv"
)

student_explanation_df.to_csv(
    individual_output_path,
    index=False
)


print(
    "\n========== INDIVIDUAL EXPLANATION SAVED =========="
)

print(
    f"Results saved to: {individual_output_path}"
)


print(
    "\n✅ SHAP EXPLAINABILITY ANALYSIS COMPLETED SUCCESSFULLY."
)