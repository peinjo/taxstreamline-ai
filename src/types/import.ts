export type ImportType = 
  | 'tax_reports' 
  | 'compliance_items' 
  | 'calendar_events'
  | 'tax_calculations';

export interface ImportHistoryRecord {
  id: string;
  user_id: string;
  file_name: string;
  import_type: ImportType;
  total_records: number;
  successful_records: number;
  failed_records: number;
  errors: ImportError[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  can_rollback: boolean;
  rolled_back_at?: string;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: ImportError[];
  data: any[];
}

export interface ImportPreview {
  headers: string[];
  rows: any[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ImportError[];
}
