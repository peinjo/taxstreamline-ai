
export interface MaterialityCalculation {
  id?: string;
  pre_tax_income: number;
  materiality_percentage: number;
  performance_materiality_percentage: number;
  materiality_threshold: number;
  performance_materiality: number;
  year: number;
  industry?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface InternalControl {
  id?: string;
  control_name: string;
  control_description: string;
  risk_level: string;
  status: string;
  last_tested?: string | null;
  test_result?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ConfirmationRequest {
  id?: string;
  entity_name: string;
  contact_email: string;
  request_type: string;
  amount?: number | null;
  status: string;
  response?: string | null;
  date_requested?: string;
  date_responded?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuditReportMetrics {
  total_liability: number;
  filing_count: number;
  pending_payments: number;
  compliance_rate: number;
}

export interface TaxReport {
  id: number;
  tax_type: string;
  amount: number | null;
  status: string;
  tax_year: number;
  created_at?: string;
  updated_at?: string;
}
