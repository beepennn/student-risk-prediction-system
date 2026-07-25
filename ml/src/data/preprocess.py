import pandas as pd

from pathlib import Path


# ============================================================
# 1. FILE PATHS
# ============================================================

INPUT_PATH = Path(
    "data/raw/student_performance_new_with_gpa_semester.csv"
)

OUTPUT_PATH = Path(
    "data/processed/student_performance_processed.csv"
)

REPORT_PATH = Path(
    "reports/preprocessing_report.md"
)


# ============================================================
# 2. LOAD NEW DATASET
# ============================================================

print("Loading new dataset...")

df = pd.read_csv(
    INPUT_PATH
)

print(
    "New dataset loaded successfully."
)

print(
    f"Original dataset shape: {df.shape}"
)


# ============================================================
# 3. RENAME COLUMNS TO BACKEND / ML SCHEMA
# ============================================================

column_mapping = {

    "Attendance (%)":
        "attendance",

    "Internal_marks":
        "internal_marks",

    "Assignments_Avg":
        "assignment_score",

    "Quizzes_score":
        "quiz_score",

    "Previous_gpa":
        "previous_gpa",

    "Semester":
        "semester",

    "Gender":
        "gender"
}


df = df.rename(
    columns=column_mapping
)

# ============================================================
# CONVERT SEMESTER TO NUMERIC
# ============================================================

semester_mapping = {
    "I/I": 1,
    "I/II": 2,
    "II/I": 3,
    "II/II": 4,
    "III/I": 5,
    "III/II": 6,
    "IV/I": 7,
    "IV/II": 8,
}

df["semester"] = df["semester"].replace(semester_mapping)


# ============================================================
# 4. CHECK REQUIRED COLUMNS
# ============================================================

required_columns = [

    "attendance",

    "internal_marks",

    "assignment_score",

    "quiz_score",

    "previous_gpa",

    "semester",

    "gender",

    "Final_Score"
]


missing_columns = [

    column
    for column in required_columns
    if column not in df.columns

]


if missing_columns:

    raise ValueError(
        "Missing required columns: "
        + str(missing_columns)
    )


print(
    "\nAll required columns are present."
)


# ============================================================
# 5. DISPLAY MISSING VALUES
# ============================================================

print(
    "\n========== MISSING VALUES =========="
)

print(
    df[required_columns]
    .isnull()
    .sum()
)


# ============================================================
# 6. REMOVE ROWS WITH MISSING REQUIRED VALUES
# ============================================================

before_rows = len(
    df
)


df = df.dropna(
    subset=required_columns
)


after_rows = len(
    df
)


rows_removed = (
    before_rows
    - after_rows
)


print(
    f"\nRows removed due to missing values: "
    f"{rows_removed}"
)


print(
    f"Rows remaining: {after_rows}"
)


# ============================================================
# 7. CREATE ACADEMIC RISK TARGET
# ============================================================

def create_academic_risk(
    final_score
):

    if final_score >= 80:

        return "Low Risk"

    elif final_score >= 60:

        return "Medium Risk"

    else:

        return "High Risk"


df[
    "AcademicRisk"
] = df[
    "Final_Score"
].apply(
    create_academic_risk
)


# ============================================================
# 8. DISPLAY ACADEMIC RISK DISTRIBUTION
# ============================================================

print(
    "\n========== ACADEMIC RISK DISTRIBUTION =========="
)

print(
    df[
        "AcademicRisk"
    ].value_counts()
)


# ============================================================
# 9. KEEP ONLY BACKEND-SUPPORTED ML FEATURES
# ============================================================

ml_features = [

    "attendance",

    "internal_marks",

    "assignment_score",

    "quiz_score",

    "previous_gpa",

    "semester",

    "gender"

]


processed_df = df[
    ml_features
    + [
        "AcademicRisk"
    ]
].copy()


# ============================================================
# 10. DISPLAY FINAL ML FEATURES
# ============================================================

print(
    "\n========== FINAL ML FEATURES =========="
)

print(
    ml_features
)


# ============================================================
# 11. DISPLAY SEMESTER DISTRIBUTION
# ============================================================

print(
    "\n========== SEMESTER DISTRIBUTION =========="
)

print(
    processed_df[
        "semester"
    ].value_counts()
    .sort_index()
)


# ============================================================
# 12. DISPLAY GENDER DISTRIBUTION
# ============================================================

print(
    "\n========== GENDER DISTRIBUTION =========="
)

print(
    processed_df[
        "gender"
    ].value_counts()
)


# ============================================================
# 13. DISPLAY PROCESSED DATASET SHAPE
# ============================================================

print(
    "\n========== PROCESSED DATASET SHAPE =========="
)

print(
    processed_df.shape
)


# ============================================================
# 14. DISPLAY PROCESSED DATASET PREVIEW
# ============================================================

print(
    "\n========== PROCESSED DATASET PREVIEW =========="
)

print(
    processed_df.head()
)


# ============================================================
# 15. CHECK PROCESSED DATASET FOR MISSING VALUES
# ============================================================

print(
    "\n========== PROCESSED DATASET MISSING VALUES =========="
)

print(
    processed_df.isnull().sum()
)


# ============================================================
# 16. CREATE OUTPUT DIRECTORIES
# ============================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

REPORT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 17. SAVE PROCESSED DATASET
# ============================================================

processed_df.to_csv(
    OUTPUT_PATH,
    index=False
)


print(
    f"\nProcessed dataset saved to: "
    f"{OUTPUT_PATH}"
)


# ============================================================
# 18. CREATE PREPROCESSING REPORT
# ============================================================

report_content = f"""
# Preprocessing Report

## Dataset

Input file:

`{INPUT_PATH}`

Output file:

`{OUTPUT_PATH}`

## Dataset Shape

Original rows: {before_rows}

Rows removed: {rows_removed}

Final rows: {after_rows}

Final columns: {len(processed_df.columns)}

## ML Features

The final backend-compatible ML features are:

- attendance
- internal_marks
- assignment_score
- quiz_score
- previous_gpa
- semester
- gender

## Target

Target variable:

`AcademicRisk`

## Academic Risk Distribution

{df["AcademicRisk"].value_counts().to_string()}

## Semester Distribution

{processed_df["semester"].value_counts().sort_index().to_string()}

## Gender Distribution

{processed_df["gender"].value_counts().to_string()}

## Missing Values

{processed_df.isnull().sum().to_string()}

## Encoding

Gender and semester are kept as raw values.

Encoding is handled automatically by the sklearn Pipeline using OneHotEncoder.

The preprocessing script does not manually create:

- Gender_Male
- Semester_1
- Semester_2
- Semester_3
- etc.
"""


REPORT_PATH.write_text(
    report_content,
    encoding="utf-8"
)


print(
    f"Preprocessing report saved to: "
    f"{REPORT_PATH}"
)


print(
    "\n✅ NEW DATASET PREPROCESSING COMPLETED SUCCESSFULLY."
)