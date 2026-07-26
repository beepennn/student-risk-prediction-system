export interface TeacherStudent {
  student_id: number;
  student_name: string;
  roll_number: string;
  department: string;
  semester: number;
  status: string;
  risk_level: string;
}

export type TeacherStudentsResponse = TeacherStudent[];