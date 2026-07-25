export interface DashboardSummary {
  total_students: number;
  total_teachers: number;
  total_predictions: number;
  total_recommendations: number;
  total_notifications: number;
  total_interventions: number;
}

export interface RiskDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface DepartmentSummary {
  department: string;
  total_students: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
}

export interface SemesterSummary {
  semester: number;
  total_students: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
}

export interface TeacherSummary {
  teacher_id: number;
  teacher_name: string;
  email: string;
  total_interventions: number;
  students_handled: number;
}

export interface LatestPrediction {
  student_id: number;
  risk_level: string;
  date: string;
}

export interface LatestIntervention {
  student_id: number;
  teacher_id: number;
  date: string;
}

export interface RecentActivity {
  latest_prediction: LatestPrediction;
  latest_intervention: LatestIntervention;
}

export interface AdminDashboardResponse {
  summary: DashboardSummary;
  risk_distribution: RiskDistribution;
  department_summary: DepartmentSummary[];
  semester_summary: SemesterSummary[];
  teacher_summary: TeacherSummary[];
  recent_activity: RecentActivity;
}