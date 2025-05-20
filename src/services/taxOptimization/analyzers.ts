
import { OptimizationSuggestion } from "./types";

// Analyze income tax data and provide optimization suggestions
export const analyzeIncomeTax = (income: number, taxAmount: number): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];
  
  // Pension contribution suggestion
  if (income > 500000) {
    const pensionRate = 0.08;
    const potentialContribution = income * pensionRate;
    const estimatedTaxRate = taxAmount / income;
    const potentialSavings = potentialContribution * estimatedTaxRate;
    
    suggestions.push({
      id: 'pension-contribution',
      title: 'Increase Pension Contributions',
      description: `Consider contributing up to ${pensionRate * 100}% of your income (₦${potentialContribution.toLocaleString()}) to a pension scheme. This is tax-deductible and could reduce your taxable income.`,
      potentialSavings: potentialSavings,
      applicability: income > 1000000 ? 'high' : 'medium',
      category: 'deduction'
    });
  }
  
  // Charitable donations suggestion
  if (income > 300000) {
    suggestions.push({
      id: 'charitable-donations',
      title: 'Consider Charitable Donations',
      description: 'Donations to approved charities can be tax-deductible up to certain limits. Consider planning your giving to maximize tax benefits.',
      potentialSavings: null,
      applicability: 'medium',
      category: 'deduction'
    });
  }
  
  // Income splitting for high earners
  if (income > 2000000) {
    suggestions.push({
      id: 'income-splitting',
      title: 'Explore Income Splitting Opportunities',
      description: 'If applicable, consider legitimate ways to split income among family members or through a business structure to reduce your overall tax bracket.',
      potentialSavings: null,
      applicability: 'high',
      category: 'other'
    });
  }
  
  return suggestions;
};

// Analyze corporate tax data and provide optimization suggestions
export const analyzeCorporateTax = (
  annualIncome: number,
  deductibleExpenses: number,
  taxAmount: number
): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];
  const taxableIncome = annualIncome - deductibleExpenses;
  
  // Expense optimization suggestion
  if (deductibleExpenses / annualIncome < 0.3 && annualIncome > 1000000) {
    suggestions.push({
      id: 'expense-optimization',
      title: 'Review Deductible Business Expenses',
      description: 'Your deductible expenses appear lower than industry average. Consider reviewing your expense categorization to ensure all eligible business expenses are properly claimed.',
      potentialSavings: taxableIncome * 0.05 * 0.3, // Assumes 5% more expenses could be deductible at 30% tax rate
      applicability: 'high',
      category: 'deduction'
    });
  }
  
  // Capital allowance suggestion
  suggestions.push({
    id: 'capital-allowances',
    title: 'Maximize Capital Allowances',
    description: 'Ensure you are claiming all available capital allowances on business assets. Consider timing of asset purchases to maximize tax benefits.',
    potentialSavings: null,
    applicability: 'medium',
    category: 'deduction'
  });
  
  // Research and development
  if (annualIncome > 5000000) {
    suggestions.push({
      id: 'research-development',
      title: 'Research & Development Incentives',
      description: 'If your business conducts R&D activities, you may be eligible for special tax incentives and deductions for innovation.',
      potentialSavings: null,
      applicability: 'medium',
      category: 'credit'
    });
  }
  
  return suggestions;
};

// Analyze VAT data and provide optimization suggestions
export const analyzeVAT = (
  totalSales: number,
  exemptSales: number
): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];
  
  // VAT recovery suggestion
  suggestions.push({
    id: 'vat-recovery',
    title: 'Optimize VAT Recovery',
    description: 'Ensure you are claiming all input VAT on business expenses. Consider a comprehensive VAT review to identify recovery opportunities.',
    potentialSavings: totalSales * 0.01, // Rough estimate of potential VAT recovery
    applicability: 'high',
    category: 'credit'
  });
  
  // Review exempt sales
  if (exemptSales / totalSales < 0.1) {
    suggestions.push({
      id: 'exempt-sales-review',
      title: 'Review Potentially Exempt Sales',
      description: 'Your exempt sales ratio appears low. Consider reviewing your supplies against VAT exemption rules to ensure correct classification.',
      potentialSavings: null,
      applicability: 'medium',
      category: 'other'
    });
  }
  
  return suggestions;
};
