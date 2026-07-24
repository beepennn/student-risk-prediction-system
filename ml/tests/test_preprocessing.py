from pathlib import Path
import pandas as pd


def test_processed_dataset_exists():

    processed_path = Path(
        "data/processed/student_performance_processed.csv"
    )

    assert processed_path.exists()


def test_processed_dataset_has_no_missing_values():

    processed_path = Path(
        "data/processed/student_performance_processed.csv"
    )

    df = pd.read_csv(
        processed_path
    )

    assert not df.isnull().values.any()


def test_processed_dataset_has_expected_features():

    processed_path = Path(
        "data/processed/student_performance_processed.csv"
    )

    df = pd.read_csv(
        processed_path
    )

    expected_features = [
        "AttendanceRate",
        "StudyHoursPerWeek",
        "PreviousGrade",
        "ExtracurricularActivities",
        "Study Hours",
        "Gender_Male",
        "ParentalSupport_Low",
        "ParentalSupport_Medium"
    ]

    for feature in expected_features:

        assert feature in df.columns