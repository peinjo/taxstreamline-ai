export interface IntegrationConfig {
  name: string;
  type: 'export' | 'import' | 'sync' | 'notification';
  enabled: boolean;
  settings: Record<string, unknown>;
  lastSync?: string;
  status: 'active' | 'inactive' | 'error';
}

export interface ExportRequest {
  format: 'excel' | 'csv' | 'pdf' | 'xml' | 'json' | 'ical';
  dataType: 'events' | 'compliance' | 'reports' | 'documents';
  filters?: Record<string, unknown>;
  template?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  errors: string[];
  summary: string;
}

export interface ReportData {
  id: string;
  title: string;
  type: string;
  format: string;
  data: Record<string, unknown>;
  generatedAt: string;
  downloadUrl?: string;
}

export interface IntegrationCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  attendees?: string[];
  recurrence?: RecurrenceRule;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  until?: string;
  count?: number;
}

export interface ThirdPartyIntegration {
  provider: string;
  apiKey: string;
  baseUrl: string;
  version: string;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface SyncConfiguration {
  enabled: boolean;
  schedule: string; // cron expression
  lastSync: string;
  nextSync: string;
  autoSync: boolean;
  syncFields: string[];
}