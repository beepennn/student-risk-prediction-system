from pathlib import Path


# ============================================================
# REPORT PATHS
# ============================================================

SHAP_REPORT = Path(
    "reports/shap_feature_importance.csv"
)

MODEL_COMPARISON_REPORT = Path(
    "reports/model_comparison.csv"
)


# ============================================================
# TEST 1: SHAP REPORT EXISTS
# ============================================================

def test_shap_report_exists():

    assert SHAP_REPORT.exists(), (
        f"SHAP report not found: {SHAP_REPORT}"
    )


# ============================================================
# TEST 2: MODEL COMPARISON REPORT EXISTS
# ============================================================

def test_model_comparison_report_exists():

    assert MODEL_COMPARISON_REPORT.exists(), (
        f"Model comparison report not found: "
        f"{MODEL_COMPARISON_REPORT}"
    )