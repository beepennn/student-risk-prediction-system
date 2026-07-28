export interface StudentPrediction {
  id: number;
  student_id: number;
  risk_level: string;
  low_probability: number;
  medium_probability: number;
  high_probability: number;
  prediction_date: string;
}

export type StudentPredictionsResponse =
  StudentPrediction[];