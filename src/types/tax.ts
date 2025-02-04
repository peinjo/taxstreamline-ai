export interface TaxCalculation {
  id: number;
  tax_type: string;
  income: number;
  tax_amount: number;
  user_id: string;
  created_at: string;
  input_data: Record<string, any>;
  calculation_details: Record<string, any>;
}

export interface TaxReport {
  id: number;
  tax_type: string;
  amount: number;
  status: string;
  tax_year: number;
  created_at: string;
}