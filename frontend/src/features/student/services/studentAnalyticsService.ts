import api from "../../../config/api";

import type {
  StudentAnalyticsResponse,
} from "../types/studentAnalytics";

export async function getStudentAnalytics(
  token: string,
): Promise<StudentAnalyticsResponse> {
  const response =
    await api.get<StudentAnalyticsResponse>(
      "/students/me/analytics",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  return response.data;
}