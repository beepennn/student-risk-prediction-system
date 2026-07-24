import api from "../../../config/api";

import type {
  LoginRequest,
  LoginResponse,
  User,
} from "../types/auth";

export async function login(
  data: LoginRequest
): Promise<LoginResponse> {
  const formData = new URLSearchParams();

  formData.append("username", data.email);
  formData.append("password", data.password);

  const response = await api.post<LoginResponse>(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
}

export async function getCurrentUser(
  token: string
): Promise<User> {
  const response = await api.get<User>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}