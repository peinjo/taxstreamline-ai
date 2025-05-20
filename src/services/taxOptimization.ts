
import { TaxCalculationResult } from "@/types/tax";
import { 
  analyzeIncomeTax, 
  analyzeCorporateTax, 
  analyzeVAT 
} from "./taxOptimization/analyzers";
import { 
  getSectorIncentives,
  getGeneralSuggestions 
} from "./taxOptimization/incentives";
import { OptimizationSuggestion } from "./taxOptimization/types";

// Re-export the types for backward compatibility
export type { OptimizationSuggestion } from "./taxOptimization/types";

// Re-export functions that were moved to individual files
export { getSectorIncentives, getGeneralSuggestions } from "./taxOptimization/incentives";

// Get all applicable tax optimization suggestions based on tax data
export const getTaxOptimizationSuggestions = (
  taxType: string, 
  inputs: Record<string, any>,
  result: TaxCalculationResult
): OptimizationSuggestion[] => {
  let suggestions: OptimizationSuggestion[] = [];
  
  // Add specific suggestions based on tax type
  switch (taxType) {
    case 'income_tax':
    case 'income':
      suggestions = [
        ...analyzeIncomeTax(inputs.annualIncome || inputs.income || 0, result.taxAmount),
      ];
      break;
      
    case 'corporate_income':
    case 'corporate':
      suggestions = [
        ...analyzeCorporateTax(
          inputs.annualIncome || 0, 
          inputs.deductibleExpenses || 0, 
          result.taxAmount
        ),
      ];
      break;
      
    case 'vat':
      suggestions = [
        ...analyzeVAT(
          inputs.totalSales || 0,
          inputs.exemptSales || 0
        ),
      ];
      break;
      
    case 'industry':
      const industry = inputs.industry || 'general';
      suggestions = [
        ...getSectorIncentives(industry),
      ];
      break;
  }
  
  // Add general suggestions to all tax types
  suggestions = [
    ...suggestions,
    ...getGeneralSuggestions()
  ];
  
  return suggestions;
};
