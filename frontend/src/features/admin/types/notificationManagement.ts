export interface Notification {
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

export interface AdminNotification
  extends Notification {
  student_name: string;
  roll_number: string;
  department: string;
  semester: number;
}

export interface NotificationPayload {
  student_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_sent: boolean;
}