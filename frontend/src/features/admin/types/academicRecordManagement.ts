export interface CurriculumSubject {
  code: string;
  name: string;
  credits: number;
  standard_assessment: boolean;
}

export interface SubjectAcademicRecord {
  id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  attendance: number;
  internal_marks: number;
  assignment_score: number;
  quiz_score: number;
  included_in_ml: boolean;
}

export interface SubjectAcademicRecordPayload {
  subject_code: string;
  attendance: number;
  internal_marks: number;
  assignment_score: number;
  quiz_score: number;
}

export interface AcademicRecord {
  id: number;
  student_id: number;

  /*
   * These are semester averages calculated
   * by the backend from subject-wise records.
   */
  attendance: number;
  internal_marks: number;
  assignment_score: number;
  quiz_score: number;

  previous_gpa: number | null;
  semester: number;
  gender: string;

  subject_records: SubjectAcademicRecord[];
}

export interface CreateAcademicRecordPayload {
  student_id: number;

  previous_gpa: number | null;

  semester: number;

  gender: string;

  subject_records: SubjectAcademicRecordPayload[];

  /*
   * Kept optional only for compatibility
   * with any older code that may still use
   * semester-level values.
   */
  attendance?: number;
  internal_marks?: number;
  assignment_score?: number;
  quiz_score?: number;
}

export interface AcademicRecordFormState {
  studentId: string;
  previousGpa: string;
  semester: string;
  gender: string;
}

export interface SubjectAcademicRecordFormState {
  subjectCode: string;
  subjectName: string;
  credits: number;

  attendance: string;
  internalMarks: string;
  assignmentScore: string;
  quizScore: string;
}

export type SubjectScoreField =
  | "attendance"
  | "internalMarks"
  | "assignmentScore"
  | "quizScore";

export type SubjectFormErrors = Record<
  string,
  Partial<
    Record<
      SubjectScoreField,
      string
    >
  >
>;