import pandas as pd

from pathlib import Path


# ============================================================
# PERFORMANCE MONITORING CONFIGURATION
# ============================================================

HISTORY_PATH = Path(
    "reports/prediction_history.csv"
)


# ============================================================
# LOAD PREDICTION HISTORY
# ============================================================

def load_prediction_history():

    if not HISTORY_PATH.exists():

        print(
            "Prediction history file not found."
        )

        return pd.DataFrame()


    history = pd.read_csv(
        HISTORY_PATH
    )

    return history


# ============================================================
# ANALYZE RISK DISTRIBUTION
# ============================================================

def analyze_risk_distribution(
    history
):

    print(
        "\n========== RISK DISTRIBUTION =========="
    )

    if history.empty:

        print(
            "No prediction history available."
        )

        return


    risk_counts = history[
        "PredictedRisk"
    ].value_counts()


    print(
        risk_counts.to_string()
    )


# ============================================================
# ANALYZE RISK TREND
# ============================================================

def analyze_risk_trend(
    history
):

    print(
        "\n========== RISK TREND ANALYSIS =========="
    )

    if history.empty:

        print(
            "No prediction history available."
        )

        return


    if len(history) < 2:

        print(
            "At least two predictions are required "
            "to analyze risk trend."
        )

        return


    risk_order = {
        "Low Risk": 1,
        "Medium Risk": 2,
        "High Risk": 3
    }


    history = history.copy()


    history[
        "RiskLevel"
    ] = history[
        "PredictedRisk"
    ].map(
        risk_order
    )


    first_risk = history[
        "RiskLevel"
    ].iloc[0]


    latest_risk = history[
        "RiskLevel"
    ].iloc[-1]


    if latest_risk > first_risk:

        trend = "Increasing Risk"

        status = (
            "The student's academic risk "
            "has increased."
        )


    elif latest_risk < first_risk:

        trend = "Decreasing Risk"

        status = (
            "The student's academic risk "
            "has decreased."
        )


    else:

        trend = "Stable Risk"

        status = (
            "The student's academic risk "
            "has remained stable."
        )


    print(
        f"Risk Trend: {trend}"
    )

    print(
        f"Monitoring Status: {status}"
    )


# ============================================================
# DISPLAY PREDICTION HISTORY
# ============================================================

def display_prediction_history(
    history
):

    print(
        "\n========== PREDICTION HISTORY =========="
    )

    if history.empty:

        print(
            "No prediction history available."
        )

        return


    print(
        history.to_string(
            index=False
        )
    )


# ============================================================
# MAIN PERFORMANCE MONITORING
# ============================================================

def monitor_performance():

    print(
        "========== STUDENT PERFORMANCE MONITORING =========="
    )


    history = load_prediction_history()


    if history.empty:

        return


    display_prediction_history(
        history
    )


    analyze_risk_distribution(
        history
    )


    analyze_risk_trend(
        history
    )


    print(
        "\n✅ Performance monitoring analysis completed successfully."
    )


# ============================================================
# RUN PERFORMANCE MONITORING
# ============================================================

if __name__ == "__main__":

    monitor_performance()