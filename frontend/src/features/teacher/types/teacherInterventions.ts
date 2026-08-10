export interface TeacherIntervention {
  id: number;
  student_id: number;
  student_name: string;
  action_taken: string;
  remarks: string;
}

export type TeacherInterventionsResponse =
  TeacherIntervention[];