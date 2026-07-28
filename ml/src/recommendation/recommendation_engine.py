from __future__ import annotations

from collections.abc import Mapping
from typing import Any


SUPPORTED_FEATURES = {
    "attendance",
    "internal_marks",
    "assignment_score",
    "quiz_score",
    "previous_gpa",
}


FEATURE_LABELS = {
    "attendance": "Attendance",
    "internal_marks": "Internal Marks",
    "assignment_score": "Assignment Score",
    "quiz_score": "Quiz Score",
    "previous_gpa": "Previous GPA",
}


def safe_float(
    value: Any,
    default: float = 0.0,
) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_feature_name(
    feature_name: str,
) -> str | None:
    """
    Convert transformed SHAP names such as
    numeric__attendance into attendance.
    """

    normalized_name = (
        feature_name.strip().lower()
    )

    for feature in SUPPORTED_FEATURES:
        if feature in normalized_name:
            return feature

    return None


def extract_shap_impacts(
    shap_values: Mapping[str, Any] | None,
) -> dict[str, float]:
    impacts = {
        feature: 0.0
        for feature in SUPPORTED_FEATURES
    }

    if not shap_values:
        return impacts

    for (
        feature_name,
        shap_information,
    ) in shap_values.items():
        normalized_feature = (
            normalize_feature_name(
                str(feature_name)
            )
        )

        if normalized_feature is None:
            continue

        if isinstance(
            shap_information,
            Mapping,
        ):
            shap_value = safe_float(
                shap_information.get(
                    "shap_value",
                    0.0,
                )
            )
        else:
            shap_value = safe_float(
                shap_information
            )

        impacts[normalized_feature] = (
            shap_value
        )

    return impacts


def create_focus_area(
    feature: str,
    value: float,
    severe_threshold: float,
    moderate_threshold: float,
    watch_threshold: float,
    severe_advice: str,
    moderate_advice: str,
    watch_advice: str,
    shap_impact: float,
) -> dict[str, Any] | None:
    if value < severe_threshold:
        severity = 3
        deficiency = (
            severe_threshold - value
        )
        advice = severe_advice

    elif value < moderate_threshold:
        severity = 2
        deficiency = (
            moderate_threshold - value
        )
        advice = moderate_advice

    elif value < watch_threshold:
        severity = 1
        deficiency = (
            watch_threshold - value
        )
        advice = watch_advice

    else:
        return None

    return {
        "feature": feature,
        "label": FEATURE_LABELS[feature],
        "value": value,
        "severity": severity,
        "deficiency": deficiency,
        "shap_impact": shap_impact,
        "advice": advice,
    }


def collect_focus_areas(
    student_data: Mapping[str, Any],
    shap_values: Mapping[str, Any] | None,
) -> list[dict[str, Any]]:
    shap_impacts = extract_shap_impacts(
        shap_values
    )

    attendance = safe_float(
        student_data.get("attendance")
    )

    internal_marks = safe_float(
        student_data.get(
            "internal_marks"
        )
    )

    assignment_score = safe_float(
        student_data.get(
            "assignment_score"
        )
    )

    quiz_score = safe_float(
        student_data.get(
            "quiz_score"
        )
    )

    previous_gpa = safe_float(
        student_data.get(
            "previous_gpa"
        )
    )

    possible_focus_areas = [
        create_focus_area(
            feature="attendance",
            value=attendance,
            severe_threshold=60,
            moderate_threshold=75,
            watch_threshold=85,
            severe_advice=(
                "Create an immediate attendance recovery plan, "
                "review missed lessons and meet the class teacher."
            ),
            moderate_advice=(
                "Improve weekly attendance and review lessons "
                "missed during absent days."
            ),
            watch_advice=(
                "Maintain more regular attendance to prevent "
                "future learning gaps."
            ),
            shap_impact=shap_impacts[
                "attendance"
            ],
        ),
        create_focus_area(
            feature="internal_marks",
            value=internal_marks,
            severe_threshold=40,
            moderate_threshold=60,
            watch_threshold=75,
            severe_advice=(
                "Arrange subject-focused tutoring and prepare "
                "a weekly revision plan for weak topics."
            ),
            moderate_advice=(
                "Review weak subjects with the teacher and "
                "practise more internal assessment questions."
            ),
            watch_advice=(
                "Continue targeted revision to improve "
                "internal assessment performance."
            ),
            shap_impact=shap_impacts[
                "internal_marks"
            ],
        ),
        create_focus_area(
            feature="assignment_score",
            value=assignment_score,
            severe_threshold=40,
            moderate_threshold=60,
            watch_threshold=75,
            severe_advice=(
                "Complete missing assignments immediately and "
                "request teacher feedback before the next submission."
            ),
            moderate_advice=(
                "Use an assignment schedule and improve each "
                "submission using teacher feedback."
            ),
            watch_advice=(
                "Improve assignment consistency and submit "
                "work before the deadline."
            ),
            shap_impact=shap_impacts[
                "assignment_score"
            ],
        ),
        create_focus_area(
            feature="quiz_score",
            value=quiz_score,
            severe_threshold=40,
            moderate_threshold=60,
            watch_threshold=75,
            severe_advice=(
                "Begin short daily quiz practice and revise "
                "foundational concepts with teacher support."
            ),
            moderate_advice=(
                "Practise topic-based quizzes every week and "
                "review incorrect answers."
            ),
            watch_advice=(
                "Continue regular quiz practice to strengthen "
                "recall and accuracy."
            ),
            shap_impact=shap_impacts[
                "quiz_score"
            ],
        ),
        create_focus_area(
            feature="previous_gpa",
            value=previous_gpa,
            severe_threshold=2.0,
            moderate_threshold=2.8,
            watch_threshold=3.3,
            severe_advice=(
                "Prepare a semester recovery plan with a mentor "
                "and prioritise subjects with the lowest grades."
            ),
            moderate_advice=(
                "Set subject-wise GPA improvement targets and "
                "review progress every two weeks."
            ),
            watch_advice=(
                "Maintain consistent study habits and focus on "
                "subjects reducing the overall GPA."
            ),
            shap_impact=shap_impacts[
                "previous_gpa"
            ],
        ),
    ]

    focus_areas = [
        area
        for area in possible_focus_areas
        if area is not None
    ]

    focus_areas.sort(
        key=lambda area: (
            area["severity"],
            abs(area["shap_impact"]),
            area["deficiency"],
        ),
        reverse=True,
    )

    return focus_areas


def build_title(
    predicted_risk: str,
    focus_areas: list[dict[str, Any]],
) -> str:
    if not focus_areas:
        if predicted_risk == "Low Risk":
            return (
                "Maintain Strong Academic Performance"
            )

        return (
            "Continue Academic Monitoring"
        )

    focus_labels = [
        str(area["label"])
        for area in focus_areas[:2]
    ]

    focus_text = " and ".join(
        focus_labels
    )

    if predicted_risk == "High Risk":
        title = (
            f"Immediate Support for {focus_text}"
        )

    elif predicted_risk == "Medium Risk":
        title = (
            f"Focused Improvement in {focus_text}"
        )

    else:
        title = (
            f"Strengthen {focus_text}"
        )

    return title[:200]


def build_description(
    predicted_risk: str,
    focus_areas: list[dict[str, Any]],
) -> str:
    if predicted_risk == "High Risk":
        introduction = (
            "The student is currently at high academic risk "
            "and requires prompt, closely monitored support."
        )

    elif predicted_risk == "Medium Risk":
        introduction = (
            "The student is currently at medium academic risk "
            "and needs focused improvement and regular reviews."
        )

    else:
        introduction = (
            "The student is currently at low academic risk and "
            "should continue maintaining consistent performance."
        )

    if not focus_areas:
        description = (
            f"{introduction} Continue regular monitoring, "
            "maintain attendance and follow the current study routine."
        )

        return description[:500]

    advice = [
        str(area["advice"])
        for area in focus_areas[:3]
    ]

    description = " ".join(
        [introduction] + advice
    )

    if len(description) > 500:
        description = (
            description[:497].rstrip()
            + "..."
        )

    return description


def generate_personalized_recommendation(
    predicted_risk: str,
    student_data: Mapping[str, Any],
    shap_values: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Generate a personalised recommendation using
    academic values and SHAP feature contributions.
    """

    focus_areas = collect_focus_areas(
        student_data=student_data,
        shap_values=shap_values,
    )

    priority_mapping = {
        "High Risk": "High",
        "Medium Risk": "Medium",
        "Low Risk": "Low",
    }

    return {
        "title": build_title(
            predicted_risk,
            focus_areas,
        ),
        "description": build_description(
            predicted_risk,
            focus_areas,
        ),
        "priority": priority_mapping.get(
            predicted_risk,
            "Medium",
        ),
        "focus_areas": [
            {
                "feature": area["feature"],
                "label": area["label"],
                "value": area["value"],
                "severity": area["severity"],
                "shap_impact": area[
                    "shap_impact"
                ],
            }
            for area in focus_areas[:3]
        ],
    }


if __name__ == "__main__":
    test_students = [
        {
            "name": "Low attendance student",
            "risk_level": "High Risk",
            "features": {
                "attendance": 19,
                "internal_marks": 70,
                "assignment_score": 75,
                "quiz_score": 68,
                "previous_gpa": 2.8,
                "semester": 6,
                "gender": "Male",
            },
        },
        {
            "name": "Weak assessment student",
            "risk_level": "Medium Risk",
            "features": {
                "attendance": 90,
                "internal_marks": 45,
                "assignment_score": 42,
                "quiz_score": 38,
                "previous_gpa": 3.0,
                "semester": 5,
                "gender": "Female",
            },
        },
        {
            "name": "Strong student",
            "risk_level": "Low Risk",
            "features": {
                "attendance": 94,
                "internal_marks": 88,
                "assignment_score": 90,
                "quiz_score": 86,
                "previous_gpa": 3.7,
                "semester": 4,
                "gender": "Female",
            },
        },
    ]

    for student in test_students:
        result = (
            generate_personalized_recommendation(
                predicted_risk=student[
                    "risk_level"
                ],
                student_data=student[
                    "features"
                ],
            )
        )

        print(
            f"\n{student['name']}"
        )

        print(
            "Title:",
            result["title"],
        )

        print(
            "Priority:",
            result["priority"],
        )

        print(
            "Description:",
            result["description"],
        )

        print(
            "Focus areas:",
            result["focus_areas"],
        )