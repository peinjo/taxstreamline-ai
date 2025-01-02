export interface TaxRate {
  id: string;
  name: string;
  rate: number;
}

export const TAX_TYPES: TaxRate[] = [
  { id: "cit", name: "Corporate Income Tax", rate: 0.30 },
  { id: "vat", name: "VAT", rate: 0.16 },
  { id: "paye", name: "PAYE", rate: 0.25 },
];

export const calculateTax = (income: number, taxTypeId: string): number => {
  const taxType = TAX_TYPES.find((tax) => tax.id === taxTypeId);
  
  if (!taxType) {
    throw new Error("Invalid tax type");
  }

  // Placeholder logic - will be replaced with actual Nigerian tax calculations
  return income * taxType.rate;
};