import pandas as pd


# ============================================================
# PERSONALIZED RECOMMENDATION ENGINE
# ============================================================

def generate_recommendations(
    predicted_risk,
    student_data,
    shap_df
):
    """
    Generate personalized recommendations
    based on predicted academic risk,
    student features, and SHAP explanations.
    """

    recommendations = []


    # ========================================================
    # 1. RISK-BASED RECOMMENDATION
    # ========================================================

    if predicted_risk == "High Risk":

        recommendations.append(
            "The student is at high academic risk. "
            "Immediate academic support and close monitoring are recommended."
        )

    elif predicted_risk == "Medium Risk":

        recommendations.append(
            "The student is at medium academic risk. "
            "Academic progress should be monitored regularly."
        )

    else:

        recommendations.append(
            "The student is at low academic risk. "
            "Continue maintaining consistent academic performance."
        )


    # ========================================================
    # 2. ATTENDANCE RECOMMENDATION
    # ========================================================

    attendance = float(
        student_data["AttendanceRate"].iloc[0]
    )

    if attendance < 75:

        recommendations.append(
            "Attendance is below 75%. "
            "The student should improve class attendance "
            "to reduce the risk of academic difficulties."
        )

    elif attendance < 85:

        recommendations.append(
            "Attendance is moderate. "
            "Maintaining regular class attendance is recommended."
        )

    else:

        recommendations.append(
            "Attendance is good. "
            "Continue maintaining regular class attendance."
        )


    # ========================================================
    # 3. STUDY HOURS PER WEEK
    # ========================================================

    study_hours_week = float(
        student_data[
            "StudyHoursPerWeek"
        ].iloc[0]
    )

    if study_hours_week < 10:

        recommendations.append(
            "Weekly study time is low. "
            "The student should gradually increase dedicated study time."
        )

    elif study_hours_week < 20:

        recommendations.append(
            "Weekly study time is moderate. "
            "Maintaining a consistent study schedule is recommended."
        )

    else:

        recommendations.append(
            "The student has strong weekly study habits. "
            "Continue maintaining consistent study time."
        )


    # ========================================================
    # 4. PREVIOUS GRADE
    # ========================================================

    previous_grade = float(
        student_data[
            "PreviousGrade"
        ].iloc[0]
    )

    if previous_grade < 60:

        recommendations.append(
            "Previous academic performance is low. "
            "Additional academic support and focused revision are recommended."
        )

    elif previous_grade < 75:

        recommendations.append(
            "Previous academic performance is moderate. "
            "The student should focus on improving weak subjects."
        )

    else:

        recommendations.append(
            "Previous academic performance is good. "
            "Continue using effective study strategies."
        )


    # ========================================================
    # 5. DAILY STUDY HOURS
    # ========================================================

    daily_study_hours = float(
        student_data[
            "Study Hours"
        ].iloc[0]
    )

    if daily_study_hours < 2:

        recommendations.append(
            "Daily study time is low. "
            "The student should establish a regular daily study routine."
        )

    elif daily_study_hours < 4:

        recommendations.append(
            "Daily study time is moderate. "
            "Increasing focused study sessions may improve performance."
        )

    else:

        recommendations.append(
            "The student maintains a good daily study routine. "
            "Continue with consistent and focused study."
        )


    # ========================================================
    # 6. PARENTAL SUPPORT
    # ========================================================

    parental_support_low = bool(
        student_data[
            "ParentalSupport_Low"
        ].iloc[0]
    )

    parental_support_medium = bool(
        student_data[
            "ParentalSupport_Medium"
        ].iloc[0]
    )


    if parental_support_low:

        recommendations.append(
            "Parental support appears limited. "
            "Additional mentoring or academic guidance may be beneficial."
        )

    elif parental_support_medium:

        recommendations.append(
            "Moderate parental support is available. "
            "Encouraging continued family involvement may help academic progress."
        )

    else:

        recommendations.append(
            "Strong parental support is indicated. "
            "Continue encouraging positive family involvement in education."
        )


    # ========================================================
    # 7. SHAP-BASED TOP FACTORS
    # ========================================================

    if shap_df is not None and not shap_df.empty:

        top_features = shap_df.head(
            3
        )["Feature"].tolist()

        recommendations.append(
            "The main features influencing the model prediction are: "
            + ", ".join(top_features)
            + "."
        )


    # ========================================================
    # 8. RETURN RECOMMENDATIONS
    # ========================================================

    return recommendations


# ============================================================
# TEST RECOMMENDATION ENGINE
# ============================================================

if __name__ == "__main__":

    print(
        "========== RECOMMENDATION ENGINE TEST =========="
    )


    # Sample student

    sample_student = pd.DataFrame(
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


    # Sample SHAP results

    sample_shap = pd.DataFrame(
        {
            "Feature": [
                "Study Hours",
                "AttendanceRate",
                "PreviousGrade"
            ],
            "SHAP_Value": [
                0.0376,
                0.0230,
                0.0181
            ]
        }
    )


    # Generate recommendations

    recommendations = generate_recommendations(
        predicted_risk="Low Risk",
        student_data=sample_student,
        shap_df=sample_shap
    )


    # Display recommendations

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


    print(
        "\n✅ Recommendation Engine test completed successfully."
    )