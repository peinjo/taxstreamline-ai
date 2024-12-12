export interface DashboardMetrics {
  upcoming_deadlines: number;
  active_clients: number;
  documents_pending: number;
  compliance_alerts: number;
}

export interface Deadline {
  id: number;
  text: string;
  date: string;
}