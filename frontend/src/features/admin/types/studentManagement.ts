export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface Student {
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

export interface AdminStudent extends Student {
  full_name: string;
  email: string;
  is_active: boolean;
}

export interface StudentFilters {
  skip: number;
  limit: number;
  search?: string;
  semester?: number;
  department?: string;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  role: "student";
}

export interface CreateStudentPayload {
  user_id: number;
  roll_number: string;
  department: string;
  semester: number;
  phone?: string | null;
  parent_email?: string | null;
  enrollment_year: number;
  status: string;
}

export interface CreateAdminStudentPayload {
  full_name: string;
  email: string;
  password: string;
  roll_number: string;
  department: string;
  semester: number;
  phone?: string | null;
  parent_email?: string | null;
  enrollment_year: number;
  status: string;
}

export interface UpdateAdminStudentPayload {
  full_name: string;
  email: string;
  roll_number: string;
  department: string;
  semester: number;
  phone?: string | null;
  parent_email?: string | null;
  enrollment_year: number;
  status: string;
}