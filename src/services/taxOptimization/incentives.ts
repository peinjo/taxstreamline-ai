
import { OptimizationSuggestion } from "./types";

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
        category: 'deduction'
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
