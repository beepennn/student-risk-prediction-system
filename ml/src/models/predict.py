import pandas as pd
import joblib
import shap

from pathlib import Path

from src.recommendation.recommendation_engine import (
    generate_recommendations
)

from src.history.prediction_history import (
    save_prediction_history
)
# ============================================================
# 1. LOAD TRAINED MODEL
# ============================================================

model_path = Path(
    "models/trained/random_forest_tuned.pkl"
)

model = joblib.load(
    model_path
)

print(
    "Tuned Random Forest model loaded successfully."
)


# ============================================================
# 2. CREATE SHAP EXPLAINER
# ============================================================

explainer = shap.TreeExplainer(
    model
)

print(
    "SHAP TreeExplainer created successfully."
)


# ============================================================
# 3. CREATE SAMPLE STUDENT INPUT
# ============================================================

student_data = pd.DataFrame(
    [
        {
            "AttendanceRate": 85.0,
            "StudyHoursPerWeek": 15.0,
            "PreviousGrade": 78.0,
            "ExtracurricularActivities": 1.0,
            "Study Hours": 4.8,
            "Gender_Male": True,
            "ParentalSupport_Low": False,
            "ParentalSupport_Medium": False
        }
    ]
)


print(
    "\n========== STUDENT INPUT =========="
)

print(
    student_data.to_string(
        index=False
    )
)


# ============================================================
# 4. MAKE PREDICTION
# ============================================================

prediction = model.predict(
    student_data
)

predicted_risk = prediction[0]


# ============================================================
# 5. GET PREDICTION PROBABILITIES
# ============================================================

probabilities = model.predict_proba(
    student_data
)[0]


print(
    "\n========== PREDICTION RESULT =========="
)

print(
    "Predicted Academic Risk:",
    predicted_risk
)


print(
    "\n========== PREDICTION PROBABILITIES =========="
)

for class_name, probability in zip(
    model.classes_,
    probabilities
):

    print(
        f"{class_name}: {probability:.4f}"
    )


# ============================================================
# 6. PREDICTION CONFIDENCE
# ============================================================

confidence = max(
    probabilities
)


print(
    "\n========== PREDICTION CONFIDENCE =========="
)

print(
    f"Confidence: {confidence:.4f}"
)

print(
    f"Confidence Percentage: {confidence * 100:.2f}%"
)


# ============================================================
# 7. CALCULATE SHAP VALUES
# ============================================================

print(
    "\n========== SHAP EXPLANATION =========="
)

shap_explanation = explainer(
    student_data
)


# ============================================================
# 8. FIND PREDICTED CLASS INDEX
# ============================================================

predicted_class_index = list(
    model.classes_
).index(
    predicted_risk
)


# ============================================================
# 9. EXTRACT SHAP VALUES FOR PREDICTED CLASS
# ============================================================

student_shap_values = (
    shap_explanation.values[
        0,
        :,
        predicted_class_index
    ]
)


# ============================================================
# 10. CREATE SHAP EXPLANATION TABLE
# ============================================================

shap_df = pd.DataFrame(
    {
        "Feature": student_data.columns,
        "Feature_Value": student_data.iloc[0].values,
        "SHAP_Value": student_shap_values
    }
)


# Calculate absolute SHAP values

shap_df[
    "Absolute_SHAP"
] = abs(
    shap_df[
        "SHAP_Value"
    ]
)


# Sort by contribution

shap_df = (
    shap_df
    .sort_values(
        by="Absolute_SHAP",
        ascending=False
    )
    .reset_index(
        drop=True
    )
)


# ============================================================
# 11. DISPLAY SHAP EXPLANATION
# ============================================================

print(
    "\nTop factors influencing this prediction:"
)

print(
    shap_df[
        [
            "Feature",
            "Feature_Value",
            "SHAP_Value"
        ]
    ].to_string(
        index=False
    )
)


# ============================================================
# 12. DISPLAY TOP 3 CONTRIBUTING FEATURES
# ============================================================

print(
    "\n========== TOP 3 CONTRIBUTING FEATURES =========="
)

top_features = shap_df.head(
    3
)


for index, row in top_features.iterrows():

    direction = (
        "increased"
        if row["SHAP_Value"] > 0
        else "decreased"
    )

    print(
        f"{index + 1}. "
        f"{row['Feature']} "
        f"({direction} contribution: "
        f"{row['SHAP_Value']:.4f})"
    )

# ============================================================
# 13. PERSONALIZED RECOMMENDATION ENGINE
# ============================================================

recommendations = generate_recommendations(
    predicted_risk=predicted_risk,
    student_data=student_data,
    shap_df=shap_df
)


print(
    "\n========== PERSONALIZED RECOMMENDATIONS =========="
)


for number, recommendation in enumerate(
    recommendations,
    start=1
):

    print(
        f"{number}. {recommendation}"
    )

# ============================================================
# 14. SAVE PREDICTION HISTORY
# ============================================================

save_prediction_history(
    predicted_risk=predicted_risk,
    confidence=confidence,
    student_data=student_data
)