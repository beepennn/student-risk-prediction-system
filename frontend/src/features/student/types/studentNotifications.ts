export interface StudentNotification {
  id: number;
  student_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_sent: boolean;
  is_read: boolean;
  sent_at: string | null;
  created_at: string;
}

export type StudentNotificationsResponse =
  StudentNotification[];