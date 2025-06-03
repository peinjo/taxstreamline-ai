
export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  company: string;
  user_id: string;
  created_at: string;
  category: string;
  priority: string;
  status: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  recurrence_pattern?: string;
  recurrence_end_date?: string;
  parent_event_id?: number;
  reminder_minutes: number;
  color: string;
}

export const EVENT_CATEGORIES = [
  { value: 'meeting', label: 'Meeting', color: '#3B82F6' },
  { value: 'deadline', label: 'Deadline', color: '#EF4444' },
  { value: 'appointment', label: 'Appointment', color: '#10B981' },
  { value: 'conference', label: 'Conference', color: '#8B5CF6' },
  { value: 'training', label: 'Training', color: '#F59E0B' },
  { value: 'review', label: 'Review', color: '#06B6D4' },
  { value: 'other', label: 'Other', color: '#6B7280' }
];

export const EVENT_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
  { value: 'urgent', label: 'Urgent', color: '#DC2626' }
];

export const EVENT_STATUSES = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const RECURRENCE_PATTERNS = [
  { value: '', label: 'No Repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];
