export interface TeacherStudentProfileInfo {
  user_id: number;
  roll_number: string;
  department: string;
  semester: number;
  phone: string;
  parent_email: string;
  enrollment_year: number;
  status: string;
  id: number;
}

export interface TeacherStudentAcademicRecord {
  student_id: number;
  attendance: number;
  internal_marks: number;
  assignment_score: number;
  quiz_score: number;
  previous_gpa: number;
  semester: number;
  gender: string;
  id: number;
}

export interface TeacherStudentPrediction {
  student_id: number;
  risk_level: string;
  low_probability: number;
  medium_probability: number;
  high_probability: number;
  id: number;
}

export interface TeacherStudentRecommendation {
  prediction_id: number;
  title: string;
  description: string;
  priority: string;
  id: number;
}

export interface TeacherStudentIntervention {
  student_id: number;
  teacher_id: number;
  action_taken: string;
  remarks: string;
  id: number;
}

export interface TeacherStudentProfileResponse {
  student: TeacherStudentProfileInfo;
  academic_records: TeacherStudentAcademicRecord[];
  latest_prediction: TeacherStudentPrediction | null;
  latest_recommendation: TeacherStudentRecommendation | null;
  interventions: TeacherStudentIntervention[];
}