import api from "../../../config/api";
import type { TeacherDashboardResponse } from "../types/teacherDashboard";

export async function getTeacherDashboardData(
  token: string
): Promise<TeacherDashboardResponse> {
  const response = await api.get<TeacherDashboardResponse>(
    "/teacher/dashboard",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}