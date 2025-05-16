
// Local types specifically for the materiality calculator
export interface MaterialityFormData {
  preTaxIncome: number;
  materialityPercentage: number;
  performanceMaterialityPercentage: number;
  year: number;
  industry: string;
  notes: string;
}

export interface MaterialityResults {
  materialityThreshold: number;
  performanceMateriality: number;
}
