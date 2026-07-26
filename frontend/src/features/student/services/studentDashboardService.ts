import api from "../../../config/api";

import type { StudentDashboardResponse } from "../types/studentDashboard";

export async function getStudentDashboardData(
  token: string,
): Promise<StudentDashboardResponse> {
  const response = await api.get<StudentDashboardResponse>(
    "/students/me/dashboard",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}