import api from "../../../config/api";

import type {
  Notification,
  NotificationPayload,
} from "../types/notificationManagement";

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminNotifications(
  token: string,
): Promise<Notification[]> {
  const response = await api.get<Notification[]>(
    "/notifications/admin",
    {
      headers: getAuthHeaders(token),
      params: {
        skip: 0,
        limit: 1000,
      },
    },
  );

  return response.data;
}

export async function createAdminNotification(
  token: string,
  payload: NotificationPayload,
): Promise<Notification> {
  const response = await api.post<Notification>(
    "/notifications/",
    payload,
    {
      headers: getAuthHeaders(token),
    },
  );

  return response.data;
}

export async function markAdminNotificationAsSent(
  token: string,
  notificationId: number,
): Promise<void> {
  await api.patch(
    `/notifications/${notificationId}/sent`,
    null,
    {
      headers: getAuthHeaders(token),
    },
  );
}

export async function deleteAdminNotification(
  token: string,
  notificationId: number,
): Promise<void> {
  await api.delete(
    `/notifications/${notificationId}`,
    {
      headers: getAuthHeaders(token),
    },
  );
}