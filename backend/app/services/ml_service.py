import random


def predict_student_risk(student_data: dict):
    """
    Temporary prediction service.

    Later this function will load Kishor's trained .pkl model
    and replace the dummy prediction.
    """

    low = round(random.uniform(0.05, 0.25), 2)
    medium = round(random.uniform(0.20, 0.50), 2)
    high = round(1 - low - medium, 2)

    probabilities = {
        "Low": low,
        "Medium": medium,
        "High": high,
    }

    risk_level = max(probabilities, key=probabilities.get)

    return {
        "risk_level": risk_level,
        "low_probability": low,
        "medium_probability": medium,
        "high_probability": high,
    }