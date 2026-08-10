export interface AdminAuditLog {
  id: number;
  user_id: number;

  user_name: string | null;
  user_email: string | null;

  action: string;
  entity: string;
  entity_id: number;

  created_at: string | null;
}

export interface AuditLogQuery {
  skip?: number;
  limit?: number;
  action?: string;
  entity?: string;
  user_id?: number;
  search?: string;
  sort_by?: string;
  order?: "asc" | "desc";
}

export type AuditActionFilter =
  | "All"
  | "CREATE"
  | "UPDATE"
  | "DELETE";