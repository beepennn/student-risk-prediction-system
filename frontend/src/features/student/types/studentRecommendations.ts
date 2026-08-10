export interface StudentRecommendation {
  id: number;
  prediction_id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  completed_at: string | null;
}

export type StudentRecommendationsResponse =
  StudentRecommendation[];