import pandas as pd

from pathlib import Path
from datetime import datetime


# ============================================================
# PREDICTION HISTORY CONFIGURATION
# ============================================================

HISTORY_PATH = Path(
    "reports/prediction_history.csv"
)


# ============================================================
# SAVE PREDICTION TO HISTORY
# ============================================================

def save_prediction_history(
    predicted_risk,
    confidence,
    student_data
):
    """
    Save a student's prediction to prediction history.

    Parameters:
        predicted_risk: Predicted academic risk level
        confidence: Model prediction confidence
        student_data: Student feature DataFrame
    """

    # Create reports directory if it does not exist

    HISTORY_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )


    # Create prediction record

    prediction_record = pd.DataFrame(
        [
            {
                "PredictionDateTime": datetime.now().strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),

                "PredictedRisk": predicted_risk,

                "Confidence": round(
                    confidence,
                    4
                ),

                "ConfidencePercentage": round(
                    confidence * 100,
                    2
                ),

                "AttendanceRate": student_data[
                    "AttendanceRate"
                ].iloc[0],

                "StudyHoursPerWeek": student_data[
                    "StudyHoursPerWeek"
                ].iloc[0],

                "PreviousGrade": student_data[
                    "PreviousGrade"
                ].iloc[0],

                "ExtracurricularActivities": student_data[
                    "ExtracurricularActivities"
                ].iloc[0],

                "Study Hours": student_data[
                    "Study Hours"
                ].iloc[0]
            }
        ]
    )


    # ========================================================
    # APPEND TO EXISTING HISTORY
    # ========================================================

    if HISTORY_PATH.exists():

        prediction_record.to_csv(
            HISTORY_PATH,
            mode="a",
            header=False,
            index=False
        )

    else:

        prediction_record.to_csv(
            HISTORY_PATH,
            mode="w",
            header=True,
            index=False
        )


    print(
        "\n========== PREDICTION HISTORY SAVED =========="
    )

    print(
        f"Prediction history saved to: {HISTORY_PATH}"
    )


# ============================================================
# TEST PREDICTION HISTORY
# ============================================================

if __name__ == "__main__":

    print(
        "========== PREDICTION HISTORY TEST =========="
    )


    # Sample student data

    sample_student = pd.DataFrame(
        [
            {
                "AttendanceRate": 85.0,
                "StudyHoursPerWeek": 15.0,
                "PreviousGrade": 78.0,
                "ExtracurricularActivities": 1.0,
                "Study Hours": 4.8
            }
        ]
    )


    # Save sample prediction

    save_prediction_history(
        predicted_risk="Low Risk",
        confidence=0.4345,
        student_data=sample_student
    )


    print(
        "\n✅ Prediction History test completed successfully."
    )