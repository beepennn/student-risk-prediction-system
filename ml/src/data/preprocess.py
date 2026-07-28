from pathlib import Path

import pandas as pd

from src.data.create_target import (
    add_academic_risk_target,
)


ML_ROOT = (
    Path(__file__)
    .resolve()
    .parents[2]
)

INPUT_PATH = (
    ML_ROOT
    / "data"
    / "raw"
    / "student_performance_new_with_gpa_semester.csv"
)

OUTPUT_PATH = (
    ML_ROOT
    / "data"
    / "processed"
    / "student_performance_processed.csv"
)

REPORT_PATH = (
    ML_ROOT
    / "reports"
    / "preprocessing_report.md"
)


COLUMN_MAPPING = {
    "Attendance (%)": "attendance",
    "Internal_marks": "internal_marks",
    "Assignments_Avg": "assignment_score",
    "Quizzes_score": "quiz_score",
    "Previous_gpa": "previous_gpa",
    "Semester": "semester",
    "Gender": "gender",
}


SEMESTER_MAPPING = {
    "I/I": 1,
    "I/II": 2,
    "II/I": 3,
    "II/II": 4,
    "III/I": 5,
    "III/II": 6,
    "IV/I": 7,
    "IV/II": 8,
}


NUMERIC_FEATURES = [
    "attendance",
    "internal_marks",
    "assignment_score",
    "quiz_score",
    "previous_gpa",
    "semester",
]


ML_FEATURES = [
    "attendance",
    "internal_marks",
    "assignment_score",
    "quiz_score",
    "previous_gpa",
    "semester",
    "gender",
]


def preprocess_dataset() -> pd.DataFrame:
    print("Loading dataset from:")
    print(INPUT_PATH)

    if not INPUT_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {INPUT_PATH}"
        )

    dataframe = pd.read_csv(INPUT_PATH)

    original_rows = len(dataframe)

    dataframe = dataframe.rename(
        columns=COLUMN_MAPPING
    )

    missing_columns = [
        column
        for column in ML_FEATURES
        if column not in dataframe.columns
    ]

    if missing_columns:
        raise ValueError(
            "Missing required columns: "
            f"{missing_columns}"
        )

    dataframe["semester"] = (
        dataframe["semester"]
        .replace(SEMESTER_MAPPING)
    )

    for column in NUMERIC_FEATURES:
        dataframe[column] = pd.to_numeric(
            dataframe[column],
            errors="coerce",
        )

    dataframe["gender"] = (
        dataframe["gender"]
        .astype("string")
        .str.strip()
        .str.title()
    )

    dataframe = dataframe.dropna(
        subset=ML_FEATURES
    )

    dataframe["attendance"] = (
        dataframe["attendance"].clip(0, 100)
    )

    dataframe["internal_marks"] = (
        dataframe["internal_marks"].clip(0, 100)
    )

    dataframe["assignment_score"] = (
        dataframe["assignment_score"].clip(
            0,
            100,
        )
    )

    dataframe["quiz_score"] = (
        dataframe["quiz_score"].clip(0, 100)
    )

    dataframe["previous_gpa"] = (
        dataframe["previous_gpa"].clip(0, 4)
    )

    dataframe = dataframe[
        dataframe["semester"].between(1, 8)
    ].copy()

    dataframe["semester"] = (
        dataframe["semester"].astype(int)
    )

    dataframe = add_academic_risk_target(
        dataframe
    )

    processed_dataframe = dataframe[
        ML_FEATURES
        + [
            "performance_score",
            "AcademicRisk",
        ]
    ].copy()

    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    REPORT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    processed_dataframe.to_csv(
        OUTPUT_PATH,
        index=False,
    )

    final_rows = len(processed_dataframe)

    risk_distribution = (
        processed_dataframe["AcademicRisk"]
        .value_counts()
    )

    report_content = f"""
# Preprocessing Report

## Input

`{INPUT_PATH}`

## Output

`{OUTPUT_PATH}`

## Rows

- Original rows: {original_rows}
- Final rows: {final_rows}
- Removed rows: {original_rows - final_rows}

## Features

- attendance
- internal_marks
- assignment_score
- quiz_score
- previous_gpa
- semester
- gender

## Target Method

The target is generated from an interpretable weighted
academic performance score:

- Attendance: 25%
- Internal marks: 20%
- Assignment score: 15%
- Quiz score: 15%
- Previous GPA: 25%

Risk categories:

- Performance score below 50: High Risk
- Performance score from 50 to below 70: Medium Risk
- Performance score 70 or above: Low Risk

## Risk Distribution

{risk_distribution.to_string()}

## Missing Values

{processed_dataframe.isnull().sum().to_string()}
"""

    REPORT_PATH.write_text(
        report_content.strip(),
        encoding="utf-8",
    )

    print(
        "\nRisk distribution:"
    )

    print(risk_distribution)

    print(
        "\nProcessed dataset saved to:"
    )

    print(OUTPUT_PATH)

    return processed_dataframe


if __name__ == "__main__":
    preprocess_dataset()

    print(
        "\nPreprocessing completed successfully."
    )