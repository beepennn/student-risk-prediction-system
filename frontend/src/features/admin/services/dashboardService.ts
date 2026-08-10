import api from "../../../config/api";
import type { DashboardResponse } from "../types/dashboard";

export async function getDashboardData(
  token: string
): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>(
    "/admin/dashboard",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}