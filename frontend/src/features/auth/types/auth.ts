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


export interface ApiMessageResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}