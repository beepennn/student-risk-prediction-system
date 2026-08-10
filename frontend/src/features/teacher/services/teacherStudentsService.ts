import api from "../../../config/api";

import type { TeacherStudentsResponse } from "../types/teacherStudents";

export async function getTeacherStudents(
  token: string,
): Promise<TeacherStudentsResponse> {
  const response = await api.get<TeacherStudentsResponse>(
    "/teacher/students",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}