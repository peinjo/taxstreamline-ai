
export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSavings: number | null;
  applicability: 'high' | 'medium' | 'low';
  category: 'deduction' | 'credit' | 'exemption' | 'deferral' | 'other';
}
