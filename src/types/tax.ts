export interface TaxRate {
  id: number;
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

export interface CorporateIncomeTaxInput {
  annualIncome: number;
  deductibleExpenses: number;
  exemptions: number;
}

export interface VATInput {
  totalSales: number;
  exemptSales: number;
}

export interface PAYEInput {
  grossSalary: number;
  pensionContributions: number;
  allowances: number;
}

export interface CapitalGainsTaxInput {
  purchasePrice: number;
  sellingPrice: number;
}

export interface WithholdingTaxInput {
  paymentAmount: number;
  category: string;
}

export interface TaxFiling {
  type: string;
  year: number;
  period: string;
  data: Record<string, any>;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  reference: string;
  status: string;
  metadata?: Record<string, any>;
}
