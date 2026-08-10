export interface StudentProfile {
  id: number;
  full_name: string;
  roll_number: string;
  department: string;
  semester: number;
}

export interface AcademicSummary {
  attendance: number | null;
  internal_marks: number | null;
  assignment_score: number | null;
  quiz_score: number | null;
  previous_gpa: number | null;
}

export interface StudentNotifications {
  total: number;
  unread: number;
}

export interface StudentDashboardResponse {
  student: StudentProfile;

  /*
   * We currently only received null values for these fields.
   * We will replace unknown with exact interfaces after receiving
   * a response containing prediction and recommendation data.
   */
  latest_prediction: unknown | null;
  latest_recommendation: unknown | null;

  academic_summary: AcademicSummary;
  notifications: StudentNotifications;
}