export interface AcademicRecord {
  id: number;
  student_id: number;
  attendance: number;
  internal_marks: number;
  assignment_score: number;
  quiz_score: number;
  previous_gpa: number;
  semester: number;
  gender: string;
}

export interface CreateAcademicRecordPayload {
  student_id: number;
  attendance: number;
  internal_marks: number;
  assignment_score: number;
  quiz_score: number;
  previous_gpa: number;
  semester: number;
  gender: string;
}

export interface AcademicRecordFormState {
  studentId: string;
  attendance: string;
  internalMarks: string;
  assignmentScore: string;
  quizScore: string;
  previousGpa: string;
  semester: string;
  gender: string;
}