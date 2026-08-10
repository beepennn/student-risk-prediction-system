import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# 1. FILE PATHS
# ============================================================

input_path = Path(
    "data/raw/student_performance_new.csv"
)

output_path = Path(
    "data/raw/student_performance_new_with_gpa_semester.csv"
)


# ============================================================
# 2. LOAD ONLY THE NEW CSV
# ============================================================

print("Loading new dataset...")

df = pd.read_csv(input_path)

print("New dataset loaded successfully.")

print(
    f"Number of students: {len(df)}"
)


# ============================================================
# 3. VERIFY REQUIRED ORIGINAL COLUMNS
# ============================================================

required_columns = [
    "Student_ID",
    "First_Name",
    "Last_Name",
    "Gender",
    "Attendance (%)",
    "Internal_marks",
    "Final_Score",
    "Assignments_Avg",
    "Quizzes_score"
]


missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]


if missing_columns:

    raise ValueError(
        f"Missing required columns: {missing_columns}"
    )


print(
    "\nAll original columns verified successfully."
)


# ============================================================
# 4. GENERATE REALISTIC PREVIOUS GPA VALUES
# ============================================================

np.random.seed(42)

df["Previous_gpa"] = np.round(
    np.random.uniform(
        2.00,
        4.00,
        size=len(df)
    ),
    2
)


# ============================================================
# 5. GENERATE RANDOM SEMESTER VALUES
# ============================================================

semester_values = [
    "I/I",
    "I/II",
    "II/I",
    "II/II",
    "III/I",
    "III/II",
    "IV/I",
    "IV/II"
]


df["Semester"] = np.random.choice(
    semester_values,
    size=len(df)
)


# ============================================================
# 6. VERIFY NEW COLUMNS
# ============================================================

print(
    "\n========== NEW COLUMNS =========="
)

print(
    df[
        [
            "Student_ID",
            "Previous_gpa",
            "Semester"
        ]
    ].head(10).to_string(
        index=False
    )
)


# ============================================================
# 7. VERIFY NO MISSING VALUES
# ============================================================

print(
    "\n========== MISSING VALUES =========="
)

print(
    df[
        [
            "Previous_gpa",
            "Semester"
        ]
    ].isnull().sum()
)


# ============================================================
# 8. VERIFY ALL STUDENTS HAVE VALUES
# ============================================================

assert (
    df["Previous_gpa"].notna().all()
), "Some students are missing Previous_gpa."

assert (
    df["Semester"].notna().all()
), "Some students are missing Semester."


# ============================================================
# 9. VERIFY ORIGINAL COLUMNS ARE STILL PRESENT
# ============================================================

for column in required_columns:

    assert (
        column in df.columns
    ), f"Original column missing: {column}"


# ============================================================
# 10. SAVE UPDATED DATASET
# ============================================================

df.to_csv(
    output_path,
    index=False
)


print(
    "\n========== DATASET SAVED =========="
)

print(
    "Updated dataset saved successfully."
)

print(
    f"Output file: {output_path}"
)

print(
    f"Total students: {len(df)}"
)

print(
    f"Total columns: {len(df.columns)}"
)


print(
    "\n✅ Previous_gpa and Semester added successfully "
    "to every student."
)

print(
    "✅ Original new CSV was not modified."
)