import pandas as pd
from pathlib import Path


def load_data():
    """
    Load raw student performance dataset.
    """

    data_path = Path("data/raw/student_performance.csv")

    df = pd.read_csv(data_path)

    return df



def create_academic_risk(df):
    """
    Create target variable from FinalGrade.

    Mapping:
    80-100  -> Low Risk
    70-79   -> Medium Risk
    Below 70 -> High Risk
    """

    def risk_category(grade):

        if pd.isna(grade):
            return None

        elif grade >= 80:
            return "Low Risk"

        elif grade >= 70:
            return "Medium Risk"

        else:
            return "High Risk"


    df["AcademicRisk"] = df["FinalGrade"].apply(risk_category)

    return df



def clean_data(df):
    """
    Remove unnecessary columns
    and fix invalid values.
    """

    # Remove identifier columns
    df = df.drop(
        columns=["StudentID", "Name"]
    )

    # Remove FinalGrade to avoid target leakage
    df = df.drop(
        columns=["FinalGrade"]
    )

    # Replace impossible negative study hours
    df.loc[
        df["Study Hours"] < 0,
        "Study Hours"
    ] = None

    return df



def handle_missing_values(df):
    """
    Handle missing values.

    Numerical:
    Median imputation

    Categorical:
    Mode imputation
    """

    numeric_columns = df.select_dtypes(
        include=["number"]
    ).columns


    categorical_columns = df.select_dtypes(
        include=["object", "string"]
    ).columns


    for column in numeric_columns:
        df[column] = df[column].fillna(
            df[column].median()
        )


    for column in categorical_columns:
        df[column] = df[column].fillna(
            df[column].mode()[0]
        )


    return df



def encode_features(X):
    """
    Encode only feature columns.
    Target remains unchanged.
    """

    categorical_columns = X.select_dtypes(
        include=["object", "string"]
    ).columns


    X = pd.get_dummies(
        X,
        columns=categorical_columns,
        drop_first=True
    )


    return X



def save_processed_data(X, y):
    """
    Save final processed dataset.
    """

    output_path = Path(
        "data/processed/student_performance_processed.csv"
    )


    processed_data = X.copy()

    processed_data["AcademicRisk"] = y


    processed_data.to_csv(
        output_path,
        index=False
    )


    print("\n✅ Processed dataset saved successfully.")



if __name__ == "__main__":

    # Load dataset
    df = load_data()


    # Create target
    df = create_academic_risk(df)


    # Separate target and features
    y = df["AcademicRisk"]

    X = df.drop(
        columns=["AcademicRisk"]
    )


    # Clean features
    X = clean_data(X)


    # Handle missing values
    X = handle_missing_values(X)


    # Encode categorical features
    X = encode_features(X)


    print("\n========== PROCESSED DATA INFORMATION ==========")
    X.info()


    print("\n========== TARGET DISTRIBUTION ==========")
    print(y.value_counts())


    print("\n========== MISSING VALUES ==========")
    print(X.isnull().sum())


    print("\n========== FIRST 5 ROWS ==========")
    print(X.head())


    save_processed_data(X, y)