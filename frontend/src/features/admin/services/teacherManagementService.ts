import api from "../../../config/api";

import type {
  AdminTeacher,
  CreateTeacherPayload,
  DeleteTeacherResponse,
  UpdateTeacherPayload,
} from "../types/teacherManagement";


function createAuthHeaders(
  token: string,
) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}


export async function getAdminTeachers(
  token: string,
): Promise<AdminTeacher[]> {
  const response =
    await api.get<AdminTeacher[]>(
      "/teacher",
      createAuthHeaders(token),
    );

  return response.data;
}


export async function createAdminTeacher(
  token: string,
  payload: CreateTeacherPayload,
): Promise<AdminTeacher> {
  const response =
    await api.post<AdminTeacher>(
      "/teacher",
      payload,
      createAuthHeaders(token),
    );

  return response.data;
}


export async function updateAdminTeacher(
  token: string,
  teacherId: number,
  payload: UpdateTeacherPayload,
): Promise<AdminTeacher> {
  const response =
    await api.put<AdminTeacher>(
      `/teacher/${teacherId}`,
      payload,
      createAuthHeaders(token),
    );

  return response.data;
}


export async function deleteAdminTeacher(
  token: string,
  teacherId: number,
): Promise<DeleteTeacherResponse> {
  const response =
    await api.delete<DeleteTeacherResponse>(
      `/teacher/${teacherId}`,
      createAuthHeaders(token),
    );

  return response.data;
}