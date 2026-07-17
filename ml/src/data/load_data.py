import pandas as pd
from pathlib import Path


def load_data():
    """
    Load the raw student performance dataset.

    Returns:
        pandas.DataFrame: Loaded dataset.
    """

    data_path = Path("data/raw/student_performance.csv")

    try:
        df = pd.read_csv(data_path)
        print("Dataset loaded successfully.")
        return df

    except FileNotFoundError:
        print(f"Dataset not found: {data_path}")
        return None

    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None


if __name__ == "__main__":
    dataframe = load_data()

    if dataframe is not None:
        print("\nFirst 5 Rows:")
        print(dataframe.head())

        print("\nDataset Shape:")
        print(dataframe.shape)

        print("\nColumn Names:")
        print(dataframe.columns)

        print("\nData Types:")
        print(dataframe.dtypes)

        print("\nMissing Values:")
        print(dataframe.isnull().sum())

        print("\nDuplicate Rows:")
        print(dataframe.duplicated().sum())