import api from "../../../config/api";

import type {
  LoginRequest,
  LoginResponse,
  User,
} from "../types/auth";

export async function login(
  data: LoginRequest
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
}

export async function getCurrentUser(
  token: string
): Promise<User> {
  const response = await api.get<User>(
    "/auth/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}