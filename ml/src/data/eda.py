import pandas as pd
from pathlib import Path


def load_data():
    """
    Load student performance dataset.
    """

    data_path = Path("data/raw/student_performance.csv")

    df = pd.read_csv(data_path)

    return df


def perform_eda(df):
    """
    Perform basic exploratory data analysis.
    """

    print("\n========== DATASET INFORMATION ==========")

    print("\nDataset Shape:")
    print(df.shape)

    print("\nColumn Names:")
    print(df.columns.tolist())

    print("\nData Types:")
    print(df.dtypes)

    print("\n========== STATISTICAL SUMMARY ==========")

    print(df.describe())

    print("\n========== MISSING VALUES ==========")

    print(df.isnull().sum())

    print("\n========== DUPLICATE CHECK ==========")

    print(df.duplicated().sum())


if __name__ == "__main__":

    data = load_data()

    perform_eda(data)