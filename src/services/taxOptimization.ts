
import { TaxCalculation, TaxCalculationResult } from "@/types/tax";

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSavings: number | null;
  applicability: 'high' | 'medium' | 'low';
  category: 'deduction' | 'credit' | 'exemption' | 'deferral' | 'other';
}

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

// General tax optimization suggestions based on historical tax calculations
export const getGeneralSuggestions = (): OptimizationSuggestion[] => {
  return [
    {
      id: 'tax-timing',
      title: 'Optimize Tax Payment Timing',
      description: 'Consider timing of income recognition and expense payments to manage cash flow and tax liability effectively.',
      potentialSavings: null,
      applicability: 'medium',
      category: 'deferral'
    },
    {
      id: 'tax-planning-session',
      title: 'Schedule Annual Tax Planning Session',
      description: 'Consider scheduling a dedicated tax planning session with a tax professional to review your specific circumstances and develop a personalized tax strategy.',
      potentialSavings: null,
      applicability: 'high',
      category: 'other'
    },
    {
      id: 'tax-education',
      title: 'Stay Informed of Tax Changes',
      description: 'Tax laws change frequently. Stay informed about new tax incentives, deductions, and credits that may benefit your situation.',
      potentialSavings: null,
      applicability: 'medium',
      category: 'other'
    }
  ];
};

// Get sector-specific tax incentives
export const getSectorIncentives = (industry: string): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];
  
  switch (industry.toLowerCase()) {
    case 'agriculture':
      suggestions.push({
        id: 'agric-incentives',
        title: 'Agricultural Tax Incentives',
        description: 'Agricultural businesses may be eligible for various tax incentives including tax holidays, enhanced capital allowances, and export incentives.',
        potentialSavings: null,
        applicability: 'high',
        category: 'exemption'
      });
      break;
      
    case 'manufacturing':
      suggestions.push({
        id: 'manufacturing-incentives',
        title: 'Manufacturing Sector Incentives',
        description: 'Manufacturing companies may qualify for pioneer status, rural location incentives, and export processing zone benefits.',
        potentialSavings: null,
        applicability: 'high',
        category: 'exemption'
      });
      break;
      
    case 'technology':
      suggestions.push({
        id: 'tech-incentives',
        title: 'Technology Investment Incentives',
        description: 'Technology companies may be eligible for R&D tax credits, pioneer status for innovative products, and investment allowances for technology infrastructure.',
        potentialSavings: null,
        applicability: 'high',
        category: 'credit'
      });
      break;
      
    case 'oil_and_gas':
      suggestions.push({
        id: 'oil-gas-incentives',
        title: 'Oil & Gas Sector Incentives',
        description: 'Consider investment tax allowances, graduated royalty rates, and gas utilization incentives that may apply to your operations.',
        potentialSavings: null,
        applicability: 'high',
        category: 'deduction'  // Changed from "allowance" to "deduction"
      });
      break;
      
    default:
      suggestions.push({
        id: 'industry-review',
        title: 'Industry-Specific Tax Incentives',
        description: 'Consult with a tax specialist about industry-specific tax incentives that may apply to your business sector.',
        potentialSavings: null,
        applicability: 'medium',
        category: 'other'
      });
  }
  
  return suggestions;
};

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
