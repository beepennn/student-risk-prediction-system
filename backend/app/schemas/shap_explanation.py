from pydantic import BaseModel, ConfigDict


class SHAPExplanationResponse(BaseModel):
    id: int
    prediction_id: int
    feature_name: str
    feature_value: str
    shap_value: float

    model_config = ConfigDict(from_attributes=True)