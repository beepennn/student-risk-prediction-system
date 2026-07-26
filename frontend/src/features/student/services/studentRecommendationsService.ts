import api from "../../../config/api";

import type { StudentRecommendationsResponse } from "../types/studentRecommendations";

export async function getStudentRecommendations(
  token: string,
): Promise<StudentRecommendationsResponse> {
  const response =
    await api.get<StudentRecommendationsResponse>(
      "/students/me/recommendations",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  return response.data;
}