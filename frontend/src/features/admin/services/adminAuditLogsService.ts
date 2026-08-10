import api from "../../../config/api";

import type {
  AdminAuditLog,
  AuditLogQuery,
} from "../types/adminAuditLogs";


function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}


export async function getAdminAuditLogs(
  token: string,
  query: AuditLogQuery = {},
): Promise<AdminAuditLog[]> {
  const response =
    await api.get<AdminAuditLog[]>(
      "/audit-logs/",
      {
        params: {
          skip: query.skip ?? 0,
          limit: query.limit ?? 200,
          action: query.action,
          entity: query.entity,
          user_id: query.user_id,
          search: query.search,
          sort_by:
            query.sort_by
            ?? "created_at",
          order:
            query.order
            ?? "desc",
        },

        headers: getAuthHeaders(token),
      },
    );

  return response.data;
}