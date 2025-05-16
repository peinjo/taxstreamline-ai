
import { MaterialityFormData, MaterialityResults } from "./types";
import type { MaterialityCalculation } from "@/types";

export function calculateMateriality(formData: MaterialityFormData): MaterialityResults {
  const materialityThreshold = (formData.preTaxIncome * formData.materialityPercentage) / 100;
  const performanceMateriality = (materialityThreshold * formData.performanceMaterialityPercentage) / 100;
  
  return {
    materialityThreshold,
    performanceMateriality
  };
}

export function getCurrentYearOptions(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear();
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(
    (year) => ({
      value: year.toString(),
      label: year.toString(),
    })
  );
}

export function prepareCalculationForSave(
  formData: MaterialityFormData, 
  results: MaterialityResults
): MaterialityCalculation {
  return {
    pre_tax_income: formData.preTaxIncome,
    materiality_percentage: formData.materialityPercentage,
    performance_materiality_percentage: formData.performanceMaterialityPercentage,
    materiality_threshold: results.materialityThreshold,
    performance_materiality: results.performanceMateriality,
    year: formData.year,
    industry: formData.industry || null,
    notes: formData.notes || null
  };
}
