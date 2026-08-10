export interface StudentAnalyticsLatest {
  attendance: number | null;
  internal_marks: number | null;
  assignment_score: number | null;
  quiz_score: number | null;
  previous_gpa: number | null;
  risk_level: string | null;
  recommendation_priority: string | null;
  total_notifications: number;
}

export interface StudentAnalyticsHistoryItem {
  attendance?: number | null;
  internal_marks?: number | null;
  assignment_score?: number | null;
  quiz_score?: number | null;
  previous_gpa?: number | null;
  risk_level?: string | null;
  recommendation_priority?: string | null;
  total_notifications?: number;
  created_at?: string;
  date?: string;
}

export interface StudentAnalyticsResponse {
  latest: StudentAnalyticsLatest;
  history: StudentAnalyticsHistoryItem[];
}