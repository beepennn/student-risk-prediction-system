export interface StudentRecommendation {
  id?: number;
  title?: string | null;
  recommendation?: string | null;
  priority?: string | null;
  category?: string | null;
  created_at?: string | null;
  date?: string | null;
}

export type StudentRecommendationsResponse =
  StudentRecommendation[];