

export type UserRole = 'admin' | 'consultant' | 'client';
export type DocumentType = 'master' | 'local' | 'supporting';
export type DocumentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type PricingMethod = 'CUP' | 'TNMM' | 'CPM' | 'PSM' | 'RPM' | 'OTHER';

// Enhanced database-aligned types
export type TPEntityType = 'parent' | 'subsidiary' | 'branch' | 'partnership' | 'other';
export type TPTransactionType = 'tangible_goods' | 'intangible_property' | 'services' | 'financial_transactions' | 'other';
export type TPRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TPComplianceStatus = 'compliant' | 'pending' | 'overdue' | 'not_applicable';

// Missing types for DocumentWizard
export interface EntityDetails {
  companyName: string;
  structure: string;
  ownership: string;
  functions: string[];
  risks: string[];
  assets: string[];
}

export interface ControlledTransaction {
  type: string;
  parties: string[];
  amount: number;
  currency: string;
  pricingMethod: PricingMethod;
  description: string;
}

export interface TPEntity {
  id: string;
  user_id: string;
  name: string;
  entity_type: TPEntityType;
  country_code: string;
  tax_id?: string;
  business_description?: string;
  functional_analysis: Record<string, unknown>;
  financial_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TPTransaction {
  id: string;
  user_id: string;
  entity_id?: string;
  transaction_type: TPTransactionType;
  description: string;
  amount?: number;
  currency: string;
  pricing_method?: PricingMethod;
  arm_length_range: Record<string, unknown>;
  documentation_status: string;
  created_at: string;
  updated_at: string;
}

export interface TPBenchmark {
  id: string;
  user_id: string;
  transaction_id?: string;
  comparable_name: string;
  country: string;
  industry?: string;
  financial_data: Record<string, unknown>;
  search_criteria: Record<string, unknown>;
  reliability_score: number;
  created_at: string;
}

export interface TPDeadline {
  id: string;
  user_id: string;
  country_code: string;
  deadline_type: string;
  description?: string;
  due_date: string;
  status: TPComplianceStatus;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface TPRiskAssessment {
  id: string;
  user_id: string;
  entity_id?: string;
  transaction_id?: string;
  risk_level: TPRiskLevel;
  risk_factors: Record<string, unknown>;
  recommendations?: string;
  assessment_date: string;
  created_at: string;
}

export interface TPTemplate {
  id: string;
  name: string;
  template_type: string;
  jurisdiction: string;
  version: string;
  content: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TPDocument {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  content: string | Record<string, unknown>;
  company_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  version: number;
  entity_id?: string;
  template_id?: string;
  jurisdiction?: string;
  compliance_status?: TPComplianceStatus;
  risk_level?: TPRiskLevel;
  last_reviewed_at?: string;
}

// Dashboard metrics
export interface TPDashboardMetrics {
  total_entities: number;
  total_transactions: number;
  pending_deadlines: number;
  high_risk_items: number;
  compliance_score: number;
  recent_activity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// AI Generator types for SmartDocumentGenerator
export interface EntityData {
  id: string;
  name: string;
  country_code: string;
}

export interface TransactionData {
  id: string;
  description: string;
  transaction_type: string;
}

export interface DocumentData {
  id: string;
  title: string;
  type: string;
}

