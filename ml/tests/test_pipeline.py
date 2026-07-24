from pathlib import Path


def test_model_comparison_report_exists():

    report_path = Path(
        "reports/model_comparison.csv"
    )

    assert report_path.exists()


def test_feature_importance_report_exists():

    report_path = Path(
        "reports/feature_importance.csv"
    )

    assert report_path.exists()


def test_shap_report_exists():

    report_path = Path(
        "reports/shap_feature_importance.csv"
    )

    assert report_path.exists()


def test_prediction_history_exists():

    history_path = Path(
        "reports/prediction_history.csv"
    )

    assert history_path.exists()