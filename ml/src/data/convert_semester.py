import pandas as pd
from pathlib import Path


# ============================================================
# 1. FILE PATHS
# ============================================================

input_path = Path(
    "data/raw/student_performance_new_with_gpa_semester.csv"
)

output_path = Path(
    "data/raw/student_performance_new_backend_ready.csv"
)


# ============================================================
# 2. LOAD NEW DATASET
# ============================================================

print("Loading dataset...")

df = pd.read_csv(
    input_path
)

print(
    f"Dataset loaded successfully: {df.shape}"
)


# ============================================================
# 3. SEMESTER MAPPING
# ============================================================

semester_mapping = {

    "I/I": 1,

    "I/II": 2,

    "II/I": 3,

    "II/II": 4,

    "III/I": 5,

    "III/II": 6,

    "IV/I": 7,

    "IV/II": 8

}


# ============================================================
# 4. CONVERT SEMESTER TO NUMBERS
# ============================================================

df["Semester"] = df[
    "Semester"
].map(
    semester_mapping
)


# ============================================================
# 5. VERIFY CONVERSION
# ============================================================

print(
    "\n========== SEMESTER VALUES =========="
)

print(
    sorted(
        df["Semester"].unique()
    )
)


# ============================================================
# 6. CHECK MISSING VALUES
# ============================================================

missing_semester = df[
    "Semester"
].isna().sum()


print(
    "\nMissing Semester values:",
    missing_semester
)


if missing_semester > 0:

    raise ValueError(
        "Some Semester values could not be converted."
    )


# ============================================================
# 7. SAVE NEW DATASET
# ============================================================

df.to_csv(

    output_path,

    index=False

)


print(
    "\n========== DATASET SAVED =========="
)

print(
    f"Saved to: {output_path}"
)


# ============================================================
# 8. FINAL VERIFICATION
# ============================================================

print(
    "\n========== FINAL DATASET =========="
)

print(
    df[
        [
            "Student_ID",
            "Semester"
        ]
    ].head(
        10
    )
)


print(
    "\nFinal dataset shape:",
    df.shape
)


print(
    "\n✅ Semester conversion completed successfully."
)