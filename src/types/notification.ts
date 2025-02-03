export interface Notification {
  id: number;
  user_id?: string;
  title: string;
  message: string;
  type: string;
  status: string;
  due_date?: string;
  created_at: string;
}