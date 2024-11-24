export interface Activity {
  id: number;
  text: string;
  created_at: string;
}

export interface Deadline {
  id: number;
  text: string;
  date: string;
}

export interface DashboardMetrics {
  upcoming_deadlines: number;
  active_clients: number;
  documents_pending: number;
  compliance_alerts: number;
}