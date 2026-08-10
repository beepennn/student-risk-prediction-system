export interface TeacherStudentProfileInfo {
  id: number;
  user_id: number;
  roll_number: string;
  department: string;
  semester: number;
  phone: string | null;
  parent_email: string | null;
  enrollment_year: number;
  status: string;
}

export interface TeacherStudentAcademicRecord {
  id: number;
  student_id: number;
  attendance: number;
  internal_marks: number;
  assignment_score: number;
  quiz_score: number;
  previous_gpa: number;
  semester: number;
  gender: string;
  created_at?: string | null;
}

export interface TeacherStudentPrediction {
  id: number;
  student_id: number;
  risk_level: string;
  low_probability: number;
  medium_probability: number;
  high_probability: number;
  confidence?: number | null;
  confidence_percentage?: number | null;
  prediction_date?: string | null;
}

export interface TeacherStudentRecommendation {
  id: number;
  prediction_id: number;
  title: string;
  description: string;
  priority: string;
  status?: string;
  completed_at?: string | null;
  created_at?: string | null;
}

export interface TeacherStudentIntervention {
  id: number;
  student_id: number;
  teacher_id: number;
  action_taken: string;
  remarks: string | null;
  intervention_date?: string | null;
}

export interface TeacherStudentProfileResponse {
  student: TeacherStudentProfileInfo;
  academic_records: TeacherStudentAcademicRecord[];
  latest_prediction: TeacherStudentPrediction | null;
  latest_recommendation: TeacherStudentRecommendation | null;
  interventions: TeacherStudentIntervention[];
}

export interface CreateTeacherInterventionPayload {
  action_taken: string;
  remarks: string | null;
}

export interface TeacherShapFeature {
  featureName: string;
  featureValue: number | null;
  shapValue: number;
}