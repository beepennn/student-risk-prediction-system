export interface TeacherDashboardSummary {
  total_students: number;
  high_risk_students: number;
  medium_risk_students: number;
  low_risk_students: number;
  total_interventions: number;
}

export interface TeacherStudent {
  student_id: number;
  student_name: string;
  roll_number: string;
  department: string;
  semester: number;
  risk_level: string;
  prediction_date: string;
}

export interface TeacherIntervention {
  id: number;
  student_id: number;
  student_name: string;
  roll_number: string;
  department: string;
  semester: number;
  action_taken: string;
  remarks: string;
  date: string;
}

export interface TeacherDashboardResponse {
  summary: TeacherDashboardSummary;
  high_risk_students: TeacherStudent[];
  medium_risk_students: TeacherStudent[];
  low_risk_students: TeacherStudent[];
  students_without_intervention: TeacherStudent[];
  recent_interventions: TeacherIntervention[];
}