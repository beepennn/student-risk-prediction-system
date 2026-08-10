from __future__ import annotations

from collections.abc import Mapping

import pandas as pd


FEATURE_WEIGHTS = {
    "attendance": 0.25,
    "internal_marks": 0.20,
    "assignment_score": 0.15,
    "quiz_score": 0.15,
    "previous_gpa": 0.25,
}


def clamp(
    value: float,
    minimum: float,
    maximum: float,
) -> float:
    return max(
        minimum,
        min(maximum, value),
    )


def calculate_performance_score(
    student_data: Mapping[str, object] | pd.Series,
) -> float:
    """
    Calculate an academic performance score from 0 to 100.

    Previous GPA is expected to be between 0 and 4 and is
    converted into a percentage.
    """

    attendance = clamp(
        float(student_data["attendance"]),
        0,
        100,
    )

    internal_marks = clamp(
        float(student_data["internal_marks"]),
        0,
        100,
    )

    assignment_score = clamp(
        float(student_data["assignment_score"]),
        0,
        100,
    )

    quiz_score = clamp(
        float(student_data["quiz_score"]),
        0,
        100,
    )

    previous_gpa = clamp(
        float(student_data["previous_gpa"]),
        0,
        4,
    )

    gpa_percentage = (
        previous_gpa / 4
    ) * 100

    performance_score = (
        attendance
        * FEATURE_WEIGHTS["attendance"]
        + internal_marks
        * FEATURE_WEIGHTS["internal_marks"]
        + assignment_score
        * FEATURE_WEIGHTS["assignment_score"]
        + quiz_score
        * FEATURE_WEIGHTS["quiz_score"]
        + gpa_percentage
        * FEATURE_WEIGHTS["previous_gpa"]
    )

    return round(
        performance_score,
        2,
    )


def create_academic_risk(
    performance_score: float,
) -> str:
    """
    Risk classification:

    Below 50  -> High Risk
    50 to 69  -> Medium Risk
    70+       -> Low Risk
    """

    if performance_score < 50:
        return "High Risk"

    if performance_score < 70:
        return "Medium Risk"

    return "Low Risk"


def add_academic_risk_target(
    dataframe: pd.DataFrame,
) -> pd.DataFrame:
    required_columns = list(
        FEATURE_WEIGHTS.keys()
    )

    missing_columns = [
        column
        for column in required_columns
        if column not in dataframe.columns
    ]

    if missing_columns:
        raise ValueError(
            "Missing columns required for target "
            f"creation: {missing_columns}"
        )

    result = dataframe.copy()

    result["performance_score"] = (
        result.apply(
            calculate_performance_score,
            axis=1,
        )
    )

    result["AcademicRisk"] = (
        result["performance_score"].apply(
            create_academic_risk
        )
    )

    return result


if __name__ == "__main__":
    test_students = [
        {
            "name": "High-risk example",
            "attendance": 19,
            "internal_marks": 10,
            "assignment_score": 1,
            "quiz_score": 1,
            "previous_gpa": 1.0,
        },
        {
            "name": "Medium-risk example",
            "attendance": 62,
            "internal_marks": 55,
            "assignment_score": 60,
            "quiz_score": 58,
            "previous_gpa": 2.4,
        },
        {
            "name": "Low-risk example",
            "attendance": 90,
            "internal_marks": 85,
            "            "attendance": 62,
            "internal_marks": 55,
            "assignment_score": 60,
           assignment_score": 88,
            "quiz_score": 82,
            "previous_gpa": 3.6,
        },
    ]

    for student in test_students:
        name = str(student.pop("name"))

        score = calculate_performance_score(
            student
        )

        risk = create_academic_risk(
            score
        )

        print(
            f"{name}: score={score}, risk={risk}"
        )