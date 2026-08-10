import pandas as pd
import joblib
import shap

from pathlib import Path


# ============================================================
# PATHS
# ============================================================

MODEL_PATH = Path(
    "models/trained/random_forest_tuned.pkl"
)

OUTPUT_PATH = Path(
    "reports/shap_feature_importance.csv"
)


# ============================================================
# LOAD COMPLETE PIPELINE
# ============================================================

def load_pipeline():

    pipeline = joblib.load(
        MODEL_PATH
    )

    return pipeline


# ============================================================
# PREPARE STUDENT DATA
# ============================================================

def prepare_student_data(
    student_features
):

    required_features = [

        "attendance",

        "internal_marks",

        "assignment_score",

        "quiz_score",

        "previous_gpa",

        "semester",

        "gender"

    ]

    missing_features = [

        feature

        for feature in required_features

        if feature not in student_features

    ]

    if missing_features:

        raise ValueError(

            f"Missing required features: "
            f"{missing_features}"

        )

    return pd.DataFrame(

        [

            {

                feature: student_features[feature]

                for feature in required_features

            }

        ]

    )


# ============================================================
# GENERATE SHAP EXPLANATION
# ============================================================

def generate_shap(
    student_features
):

    pipeline = load_pipeline()

    student_data = prepare_student_data(

        student_features

    )


    # --------------------------------------------------------
    # Get preprocessing step
    # --------------------------------------------------------

    preprocessor = pipeline.named_steps[

        "preprocessor"

    ]


    # --------------------------------------------------------
    # Get Random Forest classifier
    # --------------------------------------------------------

    classifier = pipeline.named_steps[

        "classifier"

    ]


    # --------------------------------------------------------
    # Transform raw backend data
    # --------------------------------------------------------

    transformed_data = preprocessor.transform(

        student_data

    )


    # --------------------------------------------------------
    # Get transformed feature names
    # --------------------------------------------------------

    feature_names = (

        preprocessor.get_feature_names_out()

    )


    # --------------------------------------------------------
    # Create SHAP TreeExplainer
    # --------------------------------------------------------

    explainer = shap.TreeExplainer(

        classifier

    )


    # --------------------------------------------------------
    # Calculate SHAP values
    # --------------------------------------------------------

    shap_values = explainer.shap_values(

        transformed_data

    )


    # --------------------------------------------------------
    # Get prediction
    # --------------------------------------------------------

    prediction = pipeline.predict(

        student_data

    )[0]


    # --------------------------------------------------------
    # Get predicted class index
    # --------------------------------------------------------

    predicted_class_index = list(

        classifier.classes_

    ).index(

        prediction

    )


    # --------------------------------------------------------
    # Handle SHAP output
    # --------------------------------------------------------

    if isinstance(

        shap_values,

        list

    ):

        student_shap_values = (

            shap_values[

                predicted_class_index

            ][0]

        )

    else:

        student_shap_values = (

            shap_values[

                0,

                :,

                predicted_class_index

            ]

        )


    # --------------------------------------------------------
    # Create explanation DataFrame
    # --------------------------------------------------------

    shap_df = pd.DataFrame(

        {

            "Feature":

                feature_names,

            "SHAP_Value":

                student_shap_values

        }

    )


    # --------------------------------------------------------
    # Absolute SHAP
    # --------------------------------------------------------

    shap_df[

        "Absolute_SHAP"

    ] = (

        shap_df[

            "SHAP_Value"

        ].abs()

    )


    # --------------------------------------------------------
    # Sort by importance
    # --------------------------------------------------------

    shap_df = (

        shap_df

        .sort_values(

            by="Absolute_SHAP",

            ascending=False

        )

        .reset_index(

            drop=True

        )

    )


    return {

        "prediction":

            prediction,

        "explanation":

            shap_df

    }


# ============================================================
# TEST ONLY WHEN RUN DIRECTLY
# ============================================================

if __name__ == "__main__":

    print(

        "========== SHAP EXPLANATION TEST =========="

    )


    sample_student = {

        "attendance": 87,

        "internal_marks": 61,

        "assignment_score": 78,

        "quiz_score": 74,

        "previous_gpa": 3.45,

        "semester": 5,

        "gender": "Male"

    }


    result = generate_shap(

        sample_student

    )


    print(

        "\nPredicted Risk:",

        result["prediction"]

    )


    print(

        "\n========== TOP SHAP FEATURES =========="

    )


    print(

        result[

            "explanation"

        ].head(

            10

        ).to_string(

            index=False

        )

    )


    # Save report

    OUTPUT_PATH.parent.mkdir(

        parents=True,

        exist_ok=True

    )


    result[

        "explanation"

    ].to_csv(

        OUTPUT_PATH,

        index=False

    )


    print(

        "\nSHAP report saved to:",

        OUTPUT_PATH

    )


    print(

        "\n✅ SHAP explanation completed successfully."

    )