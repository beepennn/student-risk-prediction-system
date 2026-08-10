import api from "../../../config/api";

import type { AdminDashboardResponse } from "../types/dashboard";

export async function getAdminDashboard(
  token: string
): Promise<AdminDashboardResponse> {
  const response = await api.get<AdminDashboardResponse>(
    "/admin/dashboard",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}