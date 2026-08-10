export interface TeacherStudent {
  student_id: number;
  student_name: string | null;
  roll_number: string;
  department: string;
  semester: number;
  status: string;
  risk_level: string | null;
}

export type TeacherStudentsResponse =
  TeacherStudent[];