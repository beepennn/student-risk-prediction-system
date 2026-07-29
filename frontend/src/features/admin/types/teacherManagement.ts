export interface AdminTeacher {
  id: number;
  full_name: string;
  email: string;
  role?: string;
  is_active: boolean;
}


export interface CreateTeacherPayload {
  full_name: string;
  email: string;
  password: string;
  is_active: boolean;
}


export interface UpdateTeacherPayload {
  full_name: string;
  email: string;
  is_active: boolean;
}


export interface DeleteTeacherResponse {
  message: string;
}