from sqlalchemy.orm import Session

from app.models.shap_explanation import SHAPExplanation


def save_shap_explanations(
    db: Session,
    prediction_id: int,
    shap_values: dict,
):
    if not shap_values:
        return

    for feature_name, explanation in shap_values.items():

        shap_record = SHAPExplanation(
            prediction_id=prediction_id,
            feature_name=feature_name,
            feature_value=str(
                explanation.get("feature_value")
            ),
            shap_value=float(
                explanation.get("shap_value", 0)
            ),
        )

        db.add(shap_record)

    db.commit()


def get_shap_explanations(
    db: Session,
    prediction_id: int,
):
    """
    Retrieve all SHAP explanations for a prediction.
    """

    return (
        db.query(SHAPExplanation)
        .filter(
            SHAPExplanation.prediction_id == prediction_id
        )
        .order_by(SHAPExplanation.id)
        .all()
    )