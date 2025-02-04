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

export interface TaxRate {
  id: string;
  category: string;
  subcategory?: string;
  rate: number;
  description?: string;
}

export interface TaxCalculationResult {
  taxAmount: number;
  effectiveRate: number;
  details: Record<string, any>;
}

export interface CapitalGainsTaxInput {
  purchasePrice: number;
  sellingPrice: number;
}

export interface CorporateIncomeTaxInput {
  annualIncome: number;
  deductibleExpenses: number;
  exemptions: number;
}

export interface PAYEInput {
  grossSalary: number;
  pensionContributions: number;
  allowances: number;
}

export interface VATInput {
  totalSales: number;
  exemptSales: number;
}

export interface WithholdingTaxInput {
  paymentAmount: number;
  category: string;
}