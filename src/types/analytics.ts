export interface AnalyticsData {
  analysis: AnalysisResult;
  metric: string;
  opportunities: AnalysisOpportunity[];
  risks: AnalysisRisk[];
  riskTolerance: string;
}

export interface AnalysisResult {
  taxLiability?: number;
  complianceScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: string[];
  trends?: AnalyticsTrend[];
  // Dynamic properties for different analysis types
  [key: string]: unknown;
}

export interface AnalysisOpportunity {
  id?: string;
  type: 'deduction' | 'credit' | 'exemption' | 'deferral' | 'deduction_review' | 'vat_optimization' | 'timing_optimization';
  title?: string;
  description: string;
  potential_savings?: number;
  potentialSavings?: number;
  confidence?: number;
  priority?: 'low' | 'medium' | 'high';
  requirements?: string[];
}

export interface AnalysisRisk {
  id?: string;
  category?: string;
  type: 'compliance' | 'audit' | 'penalty' | 'operational' | 'overdue_obligations' | 'high_priority_load' | 'high_tax_liability' | 'data_security';
  severity?: 'low' | 'medium' | 'high';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | string;
  mitigationSteps?: string[];
}

export interface AnalyticsTrend {
  period: string;
  value: number;
  change: number;
  changePercentage: number;
  category: string;
}

export interface ComplianceInsight {
  metric: string;
  score: number;
  recommendations: string[];
  alerts: string[];
  trends: AnalyticsTrend[];
}

export interface TaxRecommendation {
  type: string;
  description: string;
  potentialSavings: number;
  confidence: 'low' | 'medium' | 'high';
  actionRequired: string[];
}

export interface RiskRecommendation {
  riskId: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  mitigationStrategy: string;
  timeline: string;
}