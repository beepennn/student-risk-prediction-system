export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "Admin" | "Teacher" | "Student";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}