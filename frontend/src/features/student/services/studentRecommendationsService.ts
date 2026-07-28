import api from "../../../config/api";

import type {
  StudentRecommendationsResponse,
} from "../types/studentRecommendations";

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getStudentRecommendations(
  token: string,
): Promise<StudentRecommendationsResponse> {
  const response =
    await api.get<StudentRecommendationsResponse>(
      "/students/me/recommendations",
      {
        headers: getAuthHeaders(token),
      },
    );

  return response.data;
}