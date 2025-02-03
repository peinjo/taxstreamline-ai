export interface TaxRate {
  id: number;
  category: string;
  subcategory?: string;
  rate: number;
  description?: string;
}

export interface TaxCalculation {
  id: number;
  tax_type: string;
  income: number;
  tax_amount: number;
  user_id?: string;
  created_at: string;
  input_data?: Record<string, any>;
  calculation_details?: Record<string, any>;
}

export interface TaxFiling {
  id: number;
  user_id?: string;
  filing_type: string;
  filing_data: Record<string, any>;
  status: string;
  firs_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface TaxDocument {
  id: number;
  filename: string;
  file_path: string;
  content_type: string;
  size: number;
  user_id?: string;
  created_at: string;
}

export interface TaxReport {
  id: number;
  user_id?: string;
  tax_year: number;
  tax_type: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TaxTemplate {
  id: number;
  title: string;
  description?: string;
  file_path: string;
  file_type: string;
  template_type: string;
  created_at: string;
  updated_at: string;
}

export interface TaxGuide {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}