export interface Prediction {
  id: number;
  student_id: number;
  risk_level: string;
  low_probability: number;
  medium_probability: number;
  high_probability: number;
  confidence: number | null;
  confidence_percentage: number | null;
  prediction_date?: string | null;
}

export interface AdminPrediction extends Prediction {
  student_name: string;
  roll_number: string;
  department: string;
  semester: number;
}

export interface PredictionFilters {
  riskLevel?: string;
  semester?: number;
  department?: string;
  skip?: number;
  limit?: number;
}

export interface ShapExplanation {
  id?: number;
  prediction_id?: number;
  feature_name: string;
  feature_value: string | number | null;
  shap_value: number;
}