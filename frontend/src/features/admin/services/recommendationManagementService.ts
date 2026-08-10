import api from "../../../config/api";

import type {
  Recommendation,
  RecommendationFilters,
  RecommendationPayload,
  RecommendationStatus,
} from "../types/recommendationManagement";

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminRecommendations(
  token: string,
  filters: RecommendationFilters = {},
): Promise<Recommendation[]> {
  const response = await api.get<Recommendation[]>(
    "/recommendations/admin",
    {
      headers: getAuthHeaders(token),
      params: {
        priority: filters.priority || undefined,
        semester: filters.semester || undefined,
        department:
          filters.department || undefined,
        skip: filters.skip ?? 0,
        limit: filters.limit ?? 1000,
      },
    },
  );

  return response.data;
}

export async function createAdminRecommendation(
  token: string,
  payload: RecommendationPayload,
): Promise<Recommendation> {
  const response = await api.post<Recommendation>(
    "/recommendations/",
    payload,
    {
      headers: getAuthHeaders(token),
    },
  );

  return response.data;
}

export async function updateAdminRecommendation(
  token: string,
  recommendationId: number,
  payload: RecommendationPayload,
): Promise<Recommendation> {
  const response = await api.put<Recommendation>(
    `/recommendations/${recommendationId}`,
    payload,
    {
      headers: getAuthHeaders(token),
    },
  );

  return response.data;
}

export async function updateAdminRecommendationStatus(
  token: string,
  recommendationId: number,
  status: RecommendationStatus,
): Promise<Recommendation> {
  const response = await api.put<Recommendation>(
    `/recommendations/${recommendationId}/status`,
    {
      status,
    },
    {
      headers: getAuthHeaders(token),
    },
  );

  return response.data;
}

export async function deleteAdminRecommendation(
  token: string,
  recommendationId: number,
): Promise<void> {
  await api.delete(
    `/recommendations/${recommendationId}`,
    {
      headers: getAuthHeaders(token),
    },
  );
}