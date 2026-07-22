import pandas as pd
from pathlib import Path


# ============================================================
# 1. LOAD RAW DATASET
# ============================================================

def load_data():
    """
    Load the raw student performance dataset.
    """

    data_path = Path(
        "data/raw/student_performance.csv"
    )

    df = pd.read_csv(data_path)

    return df


# ============================================================
# 2. CREATE ACADEMIC RISK TARGET
# ============================================================

def create_academic_risk(df):
    """
    Create the AcademicRisk target variable from FinalGrade.

    Risk Classification:
    80-100   -> Low Risk
    70-79    -> Medium Risk
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

    df["AcademicRisk"] = df["FinalGrade"].apply(
        risk_category
    )

    return df


# ============================================================
# 3. REMOVE MISSING TARGET VALUES
# ============================================================

def remove_missing_target(df):
    """
    Remove records where AcademicRisk is missing.

    AcademicRisk is derived from FinalGrade.
    If FinalGrade is missing, the target cannot be
    determined reliably.

    Target values are NOT imputed.
    """

    before_count = len(df)

    df = df.dropna(
        subset=["AcademicRisk"]
    ).copy()

    after_count = len(df)

    removed_count = before_count - after_count

    print("\n========== MISSING TARGET HANDLING ==========")
    print(
        f"Rows before removing missing target: {before_count}"
    )

    print(
        f"Rows removed due to missing AcademicRisk: {removed_count}"
    )

    print(
        f"Rows remaining: {after_count}"
    )

    return df


# ============================================================
# 4. CLEAN DATA
# ============================================================

def clean_data(df):
    """
    Remove unnecessary columns and handle invalid values.
    """

    # Remove identifier columns.
    # These do not provide meaningful predictive information.
    df = df.drop(
        columns=[
            "StudentID",
            "Name"
        ]
    )

    # FinalGrade was used to create AcademicRisk.
    # Keeping it would cause target leakage.
    df = df.drop(
        columns=[
            "FinalGrade"
        ]
    )

    # Study Hours cannot be negative.
    # Replace invalid negative values with NaN.
    df.loc[
        df["Study Hours"] < 0,
        "Study Hours"
    ] = None

    return df


# ============================================================
# 5. HANDLE MISSING FEATURE VALUES
# ============================================================

def handle_missing_values(df):
    """
    Handle missing values in feature columns.

    Numerical features:
    Median imputation.

    Categorical features:
    Mode imputation.
    """

    # Select numerical feature columns
    numeric_columns = df.select_dtypes(
        include=["number"]
    ).columns

    # Select categorical feature columns
    categorical_columns = df.select_dtypes(
        include=["object", "string"]
    ).columns

    # Median imputation for numerical features
    for column in numeric_columns:

        df[column] = df[column].fillna(
            df[column].median()
        )

    # Mode imputation for categorical features
    for column in categorical_columns:

        if not df[column].mode().empty:

            df[column] = df[column].fillna(
                df[column].mode()[0]
            )

    return df


# ============================================================
# 6. ENCODE CATEGORICAL FEATURES
# ============================================================

def encode_features(X):
    """
    Convert categorical feature columns into numerical
    representation using one-hot encoding.

    drop_first=True avoids redundant dummy variables.
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


# ============================================================
# 7. SAVE PROCESSED DATASET
# ============================================================

def save_processed_data(X, y):

    output_path = Path(
        "data/processed/student_performance_processed.csv"
    )

    processed_data = X.copy()

    processed_data["AcademicRisk"] = y.values

    processed_data.to_csv(
        output_path,
        index=False
    )

    print(
        "\n✅ Processed dataset saved successfully."
    )

    print(
        f"Saved to: {output_path}"
    )


# ============================================================
# MAIN PREPROCESSING PIPELINE
# ============================================================

if __name__ == "__main__":

    # --------------------------------------------------------
    # Step 1: Load raw dataset
    # --------------------------------------------------------

    df = load_data()

    print(
        "Dataset loaded successfully."
    )

    print(
        "\nOriginal dataset shape:"
    )

    print(
        df.shape
    )


    # --------------------------------------------------------
    # Step 2: Create AcademicRisk target
    # --------------------------------------------------------

    df = create_academic_risk(df)


    # --------------------------------------------------------
    # Step 3: Remove rows with missing target
    # --------------------------------------------------------

    df = remove_missing_target(df)


    # --------------------------------------------------------
    # Step 4: Separate target and features
    # --------------------------------------------------------

    y = df["AcademicRisk"].copy()

    X = df.drop(
        columns=[
            "AcademicRisk"
        ]
    ).copy()


    # --------------------------------------------------------
    # Step 5: Clean feature data
    # --------------------------------------------------------

    X = clean_data(X)


    # --------------------------------------------------------
    # Step 6: Handle missing feature values
    # --------------------------------------------------------

    X = handle_missing_values(X)


    # --------------------------------------------------------
    # Step 7: Encode categorical features
    # --------------------------------------------------------

    X = encode_features(X)


    # --------------------------------------------------------
    # Step 8: Display processed dataset information
    # --------------------------------------------------------

    print(
        "\n========== PROCESSED DATA INFORMATION =========="
    )

    X.info()


    # --------------------------------------------------------
    # Step 9: Display target distribution
    # --------------------------------------------------------

    print(
        "\n========== TARGET DISTRIBUTION =========="
    )

    print(
        y.value_counts()
    )


    # --------------------------------------------------------
    # Step 10: Display missing values
    # --------------------------------------------------------

    print(
        "\n========== MISSING VALUES =========="
    )

    print(
        X.isnull().sum()
    )


    # --------------------------------------------------------
    # Step 11: Display first five rows
    # --------------------------------------------------------

    print(
        "\n========== FIRST 5 ROWS =========="
    )

    print(
        X.head()
    )


    # --------------------------------------------------------
    # Step 12: Save processed dataset
    # --------------------------------------------------------

    save_processed_data(
        X,
        y
    )