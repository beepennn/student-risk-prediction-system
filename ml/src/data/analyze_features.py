import pandas as pd
from pathlib import Path


def load_data():
    data_path = Path("data/raw/student_performance.csv")

    df = pd.read_csv(data_path)

    return df


def analyze_features(df):

    print("\n========== UNIQUE VALUES ==========")

    for column in df.columns:
        print("\n", column)
        print(df[column].unique()[:10])


    print("\n========== STUDY HOURS COMPARISON ==========")

    if "StudyHoursPerWeek" in df.columns and "Study Hours" in df.columns:

        comparison = df[["StudyHoursPerWeek", "Study Hours"]].describe()

        print(comparison)


    print("\n========== CORRELATION ANALYSIS ==========")

    numeric_df = df.select_dtypes(include="number")

    print(numeric_df.corr())


if __name__ == "__main__":

    data = load_data()

    analyze_features(data)