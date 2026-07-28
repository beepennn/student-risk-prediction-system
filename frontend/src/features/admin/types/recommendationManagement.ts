export type RecommendationPriority =
  | "High"
  | "Medium"
  | "Low";

export type RecommendationStatus =
  | "Pending"
  | "Completed";

export interface Recommendation {
  id: number;
  prediction_id: number;
  title: string;
  description: string;
  priority: RecommendationPriority | string;
  status: RecommendationStatus | string;
  completed_at: string | null;
}

export interface AdminRecommendation
  extends Recommendation {
  student_id: number;
  student_name: string;
  roll_number: string;
  department: string;
  semester: number;
  risk_level: string;
}

export interface RecommendationPayload {
  prediction_id: number;
  title: string;
  description: string;
  priority: RecommendationPriority;
}

export interface RecommendationFilters {
  priority?: string;
  semester?: number;
  department?: string;
  skip?: number;
  limit?: number;
}