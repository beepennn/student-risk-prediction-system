import api from "../../../config/api";

import type {
  StudentNotificationsResponse,
} from "../types/studentNotifications";

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getStudentNotifications(
  token: string,
): Promise<StudentNotificationsResponse> {
  const response =
    await api.get<StudentNotificationsResponse>(
      "/notifications/me",
      {
        headers: getAuthHeaders(token),
      },
    );

  return response.data;
}

export async function markStudentNotificationAsRead(
  token: string,
  notificationId: number,
): Promise<void> {
  await api.patch(
    `/notifications/${notificationId}/read`,
    {},
    {
      headers: getAuthHeaders(token),
    },
  );
}

export async function markAllStudentNotificationsAsRead(
  token: string,
): Promise<void> {
  await api.patch(
    "/notifications/read-all",
    {},
    {
      headers: getAuthHeaders(token),
    },
  );
}