import { supabase } from "@/integrations/supabase/client";
import type { TaxRate, TaxCalculationResult } from "@/types/tax";

export const calculateIndustryTax = (
  inputs: Record<string, number>,
  industry: string,
  rate: number
): TaxCalculationResult => {
  const { revenue, operatingCosts, capitalAllowance } = inputs;
  let taxableIncome = revenue - operatingCosts - capitalAllowance;

  if (industry === "oil_and_gas") {
    const { royalties, petroleumProfitTax } = inputs;
    taxableIncome -= (royalties + petroleumProfitTax);
  }

  const taxAmount = Math.max(0, taxableIncome * (rate / 100));

  return {
    taxAmount,
    effectiveRate: (taxAmount / revenue) * 100,
    details: {
      taxableIncome,
      rateApplied: rate,
      industry,
      ...inputs,
    },
  };
};

export const fetchTaxRates = async (category: string): Promise<TaxRate[]> => {
  const { data, error } = await supabase
    .from("tax_rates")
    .select("*")
    .eq("category", category);

  if (error) throw error;
  return data;
};

export const saveTaxCalculation = async (
  taxType: string,
  income: number,
  taxAmount: number,
  inputData: Record<string, any>,
  calculationDetails: Record<string, any>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User must be authenticated to save tax calculations");

  const { data, error } = await supabase.from("tax_calculations").insert([
    {
      tax_type: taxType,
      income,
      tax_amount: taxAmount,
      input_data: inputData,
      calculation_details: calculationDetails,
      user_id: user.id
    },
  ]);

  if (error) throw error;
  return data;
};

export const calculatePAYETax = (
  grossSalary: number,
  pensionContributions: number,
  allowances: number,
  taxBrackets: TaxRate[]
): TaxCalculationResult => {
  const taxableIncome = grossSalary - pensionContributions - allowances;
  let totalTax = 0;
  const brackets = [300000, 600000, 1100000, 1600000, 3200000];
  const details: Record<string, number> = {};

  let remainingIncome = taxableIncome;
  let previousBracket = 0;

  taxBrackets.forEach((bracket, index) => {
    const bracketLimit = brackets[index] || Infinity;
    const bracketIncome = Math.min(
      Math.max(remainingIncome, 0),
      bracketLimit - previousBracket
    );
    
    const bracketTax = bracketIncome * (bracket.rate / 100);
    totalTax += bracketTax;
    details[`bracket_${index + 1}`] = bracketTax;
    
    remainingIncome -= bracketIncome;
    previousBracket = bracketLimit;
  });

  return {
    taxAmount: totalTax,
    effectiveRate: (totalTax / grossSalary) * 100,
    details,
  };
};

export const calculateCorporateIncomeTax = (
  annualIncome: number,
  deductibleExpenses: number,
  exemptions: number,
  rate: number
): TaxCalculationResult => {
  const taxableIncome = Math.max(annualIncome - deductibleExpenses - exemptions, 0);
  const taxAmount = taxableIncome * (rate / 100);

  return {
    taxAmount,
    effectiveRate: (taxAmount / annualIncome) * 100,
    details: {
      taxableIncome,
      rateApplied: rate,
    },
  };
};

export const calculateVAT = (
  totalSales: number,
  exemptSales: number,
  rate: number
): TaxCalculationResult => {
  const taxableSales = totalSales - exemptSales;
  const taxAmount = taxableSales * (rate / 100);

  return {
    taxAmount,
    effectiveRate: (taxAmount / totalSales) * 100,
    details: {
      taxableSales,
      rateApplied: rate,
    },
  };
};

export const calculateCapitalGainsTax = (
  purchasePrice: number,
  sellingPrice: number,
  rate: number
): TaxCalculationResult => {
  const capitalGain = Math.max(sellingPrice - purchasePrice, 0);
  const taxAmount = capitalGain * (rate / 100);

  return {
    taxAmount,
    effectiveRate: rate,
    details: {
      capitalGain,
      rateApplied: rate,
    },
  };
};

export const calculateWithholdingTax = (
  paymentAmount: number,
  rate: number
): TaxCalculationResult => {
  const taxAmount = paymentAmount * (rate / 100);

  return {
    taxAmount,
    effectiveRate: rate,
    details: {
      paymentAmount,
      rateApplied: rate,
    },
  };
};
