from pathlib import Path

import pandas as pd


# ============================================================
# PROCESSED DATASET PATH
# ============================================================

PROCESSED_DATASET = Path(
    "data/processed/student_performance_processed.csv"
)


# ============================================================
# TEST 1: CHECK PROCESSED DATASET EXISTS
# ============================================================

def test_processed_dataset_exists():

    assert PROCESSED_DATASET.exists(), (
        "Processed dataset does not exist."
    )


# ============================================================
# TEST 2: CHECK PROCESSED DATASET HAS NO MISSING VALUES
# ============================================================

def test_processed_dataset_has_no_missing_values():

    df = pd.read_csv(
        PROCESSED_DATASET
    )

    assert not df.isnull().values.any(), (
        "Processed dataset contains missing values."
    )


# ============================================================
# TEST 3: CHECK EXPECTED BACKEND FEATURES
# ============================================================

def test_processed_dataset_has_expected_features():

    df = pd.read_csv(
        PROCESSED_DATASET
    )

    expected_features = [
        "attendance",
        "internal_marks",
        "assignment_score",
        "quiz_score",
        "previous_gpa",
        "semester",
        "gender",
        "AcademicRisk"
    ]

    for feature in expected_features:

        assert feature in df.columns, (
            f"Expected feature missing: {feature}"
        )