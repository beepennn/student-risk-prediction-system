export interface StudentPrediction {
  id?: number;
  risk_level?: string | null;
  risk_score?: number | null;
  prediction_date?: string | null;
  explanation?: string | null;
}

export type StudentPredictionsResponse = StudentPrediction[];