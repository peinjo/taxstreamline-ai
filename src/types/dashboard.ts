export interface DashboardMetrics {
  upcoming_deadlines: number;
  active_clients: number;
  documents_pending: number;
  compliance_alerts: number;
}

export interface Activity {
  id: number;
  action: string;
  document_title: string;
  document_type: string;
  created_at: string;
}

export interface Deadline {
  id: number;
  text: string;
  date: string;
}