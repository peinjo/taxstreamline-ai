import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, TrendingUp, DollarSign, Globe, FileText, Clock } from 'lucide-react';
import { TPRiskAssessment, TPEntity, TPTransaction } from '@/types/transfer-pricing';

interface RiskFactorAssessmentProps {
  entities: TPEntity[];
  transactions: TPTransaction[];
  assessments: TPRiskAssessment[];
}

interface RiskFactor {
  id: string;
  category: 'documentation' | 'economic' | 'compliance' | 'operational' | 'regulatory';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  present: boolean;
  impact: number;
  recommendations: string[];
}

const RISK_FACTORS: Omit<RiskFactor, 'present'>[] = [
  // Documentation Risk Factors
  {
    id: 'doc_missing_studies',
    category: 'documentation',
    title: 'Missing Transfer Pricing Studies',
    description: 'Lack of comprehensive transfer pricing documentation for controlled transactions',
    severity: 'high',
    impact: 85,
    recommendations: [
      'Prepare comprehensive transfer pricing studies',
      'Document functional analysis and risk allocation',
      'Maintain contemporaneous documentation'
    ]
  },
  {
    id: 'doc_outdated_analysis',
    category: 'documentation',
    title: 'Outdated Economic Analysis',
    description: 'Transfer pricing analysis not updated within the last 3 years',
    severity: 'medium',
    impact: 60,
    recommendations: [
      'Update benchmarking studies with recent data',
      'Review and refresh functional analysis',
      'Validate current arm\'s length range'
    ]
  },
  {
    id: 'doc_incomplete_benchmarking',
    category: 'documentation',
    title: 'Incomplete Benchmarking',
    description: 'Insufficient comparable companies or weak benchmarking methodology',
    severity: 'high',
    impact: 75,
    recommendations: [
      'Expand comparable company search',
      'Strengthen search and selection criteria',
      'Perform statistical validation of results'
    ]
  },

  // Economic Risk Factors
  {
    id: 'econ_high_profit_margins',
    category: 'economic',
    title: 'Unusually High Profit Margins',
    description: 'Profit margins significantly above arm\'s length range',
    severity: 'critical',
    impact: 90,
    recommendations: [
      'Review pricing policies immediately',
      'Perform detailed comparability analysis',
      'Consider primary adjustment calculations'
    ]
  },
  {
    id: 'econ_loss_making_entities',
    category: 'economic',
    title: 'Persistent Loss-Making Entities',
    description: 'Related entities showing consistent losses without business rationale',
    severity: 'high',
    impact: 80,
    recommendations: [
      'Analyze business rationale for losses',
      'Review cost allocation methodologies',
      'Consider restructuring transactions'
    ]
  },
  {
    id: 'econ_intangible_complexity',
    category: 'economic',
    title: 'Complex Intangible Arrangements',
    description: 'Significant intangible property transactions without proper DEMPE analysis',
    severity: 'high',
    impact: 85,
    recommendations: [
      'Perform DEMPE (Development, Enhancement, Maintenance, Protection, Exploitation) analysis',
      'Document value creation activities',
      'Align pricing with value creation'
    ]
  },

  // Compliance Risk Factors
  {
    id: 'comp_missed_deadlines',
    category: 'compliance',
    title: 'Missed Filing Deadlines',
    description: 'History of late or missed transfer pricing documentation filings',
    severity: 'medium',
    impact: 65,
    recommendations: [
      'Implement compliance calendar system',
      'Set up automated deadline reminders',
      'Assign dedicated compliance resources'
    ]
  },
  {
    id: 'comp_multiple_jurisdictions',
    category: 'compliance',
    title: 'Multiple High-Risk Jurisdictions',
    description: 'Operations in jurisdictions with aggressive transfer pricing enforcement',
    severity: 'high',
    impact: 75,
    recommendations: [
      'Monitor local TP regulations closely',
      'Consider advance pricing agreements (APAs)',
      'Maintain jurisdiction-specific documentation'
    ]
  },
  {
    id: 'comp_cbcr_thresholds',
    category: 'compliance',
    title: 'CbCR Threshold Exposure',
    description: 'Near or above Country-by-Country Reporting thresholds',
    severity: 'medium',
    impact: 70,
    recommendations: [
      'Prepare for CbCR obligations',
      'Implement group reporting systems',
      'Review master file requirements'
    ]
  },

  // Operational Risk Factors
  {
    id: 'op_complex_structure',
    category: 'operational',
    title: 'Complex Corporate Structure',
    description: 'Multiple intermediary holding companies or complex ownership structures',
    severity: 'medium',
    impact: 55,
    recommendations: [
      'Simplify corporate structure where possible',
      'Document business rationale for structure',
      'Ensure substance in key jurisdictions'
    ]
  },
  {
    id: 'op_frequent_restructuring',
    category: 'operational',
    title: 'Frequent Business Restructuring',
    description: 'Regular changes in business operations, functions, or ownership',
    severity: 'medium',
    impact: 60,
    recommendations: [
      'Document business reasons for restructuring',
      'Perform step-by-step analysis',
      'Maintain arm\'s length compensation for transfers'
    ]
  },

  // Regulatory Risk Factors
  {
    id: 'reg_audit_history',
    category: 'regulatory',
    title: 'Transfer Pricing Audit History',
    description: 'Previous transfer pricing audits or adjustments by tax authorities',
    severity: 'high',
    impact: 80,
    recommendations: [
      'Address previous audit findings',
      'Strengthen documentation in problematic areas',
      'Consider voluntary disclosure for similar issues'
    ]
  },
  {
    id: 'reg_beps_exposure',
    category: 'regulatory',
    title: 'BEPS Action Plan Exposure',
    description: 'Structures potentially affected by BEPS implementation measures',
    severity: 'medium',
    impact: 65,
    recommendations: [
      'Review BEPS Action Plan impacts',
      'Assess substance requirements',
      'Consider proactive compliance measures'
    ]
  }
];

export function RiskFactorAssessment({ entities, transactions, assessments }: RiskFactorAssessmentProps) {
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>(() => {
    return RISK_FACTORS.map(factor => ({
      ...factor,
      present: evaluateRiskFactor(factor, entities, transactions, assessments)
    }));
  });

  function evaluateRiskFactor(
    factor: Omit<RiskFactor, 'present'>, 
    entities: TPEntity[], 
    transactions: TPTransaction[], 
    assessments: TPRiskAssessment[]
  ): boolean {
    // Simplified risk factor evaluation logic
    switch (factor.id) {
      case 'doc_missing_studies':
        return transactions.some(t => t.documentation_status === 'pending');
      
      case 'doc_outdated_analysis':
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
        return assessments.some(a => new Date(a.assessment_date || '') < threeYearsAgo);
      
      case 'doc_incomplete_benchmarking':
        return transactions.some(t => !t.arm_length_range || Object.keys(t.arm_length_range).length === 0);
      
      case 'econ_high_profit_margins':
        // Check if any entity has unusually high margins (simplified)
        return entities.some(e => {
          const financialData = e.financial_data || {};
          return Number(financialData.operating_margin || 0) > 30; // 30% threshold
        });
      
      case 'econ_loss_making_entities':
        return entities.some(e => {
          const financialData = e.financial_data || {};
          return Number(financialData.net_profit || 0) < 0;
        });
      
      case 'econ_intangible_complexity':
        return transactions.some(t => t.transaction_type === 'intangible_property');
      
      case 'comp_missed_deadlines':
        // Would need deadline tracking data
        return false;
      
      case 'comp_multiple_jurisdictions':
        const highRiskJurisdictions = ['US', 'DE', 'AU', 'UK', 'FR'];
        const entityJurisdictions = entities.map(e => e.country_code);
        return highRiskJurisdictions.filter(j => entityJurisdictions.includes(j)).length > 2;
      
      case 'comp_cbcr_thresholds':
        // Check if group revenue might exceed €750M
        const totalRevenue = entities.reduce((sum, e) => {
          return sum + ((e.financial_data?.revenue || 0) as number);
        }, 0);
        return totalRevenue > 500000000; // $500M as proxy for €750M
      
      case 'op_complex_structure':
        return entities.length > 10; // Simplified complexity measure
      
      case 'op_frequent_restructuring':
        // Would need historical data
        return false;
      
      case 'reg_audit_history':
        // Would need audit history data
        return false;
      
      case 'reg_beps_exposure':
        return entities.some(e => ['LU', 'IE', 'NL', 'CH'].includes(e.country_code));
      
      default:
        return false;
    }
  }

  const toggleRiskFactor = (factorId: string) => {
    setRiskFactors(prev => prev.map(factor => 
      factor.id === factorId 
        ? { ...factor, present: !factor.present }
        : factor
    ));
  };

  const presentRiskFactors = riskFactors.filter(f => f.present);
  const totalRiskScore = presentRiskFactors.reduce((sum, factor) => sum + factor.impact, 0) / riskFactors.length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documentation': return <FileText className="h-4 w-4" />;
      case 'economic': return <TrendingUp className="h-4 w-4" />;
      case 'compliance': return <Clock className="h-4 w-4" />;
      case 'operational': return <Globe className="h-4 w-4" />;
      case 'regulatory': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low': return 'secondary';
      case 'medium': return 'outline';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const riskByCategory = riskFactors.reduce((acc, factor) => {
    if (!acc[factor.category]) {
      acc[factor.category] = [];
    }
    acc[factor.category].push(factor);
    return acc;
  }, {} as Record<string, RiskFactor[]>);

  return (
    <div className="space-y-6">
      {/* Risk Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Factor Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {presentRiskFactors.length}
              </div>
              <p className="text-sm text-muted-foreground">Active Risk Factors</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">
                {Math.round(totalRiskScore)}
              </div>
              <p className="text-sm text-muted-foreground">Overall Risk Score</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {presentRiskFactors.filter(f => f.severity === 'critical' || f.severity === 'high').length}
              </div>
              <p className="text-sm text-muted-foreground">High Priority Items</p>
            </div>
          </div>

          <div className="mt-6">
            <Progress value={totalRiskScore} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Risk Score: {Math.round(totalRiskScore)}/100
            </p>
          </div>

          {presentRiskFactors.filter(f => f.severity === 'critical').length > 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical Risk Alert:</strong> You have {presentRiskFactors.filter(f => f.severity === 'critical').length} critical risk factor(s) 
                that require immediate attention to avoid potential penalties or adjustments.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Risk Factors by Category */}
      {Object.entries(riskByCategory).map(([category, factors]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              {getCategoryIcon(category)}
              {category} Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {factors.map((factor) => (
                <div 
                  key={factor.id} 
                  className={`p-4 border rounded-lg ${factor.present ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={factor.present}
                      onCheckedChange={() => toggleRiskFactor(factor.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{factor.title}</h4>
                        <Badge variant={getSeverityBadge(factor.severity)}>
                          {factor.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Impact: {factor.impact}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {factor.description}
                      </p>

                      {factor.present && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                          <h5 className="font-medium text-amber-800 mb-2">Recommended Actions:</h5>
                          <ul className="text-sm text-amber-700 space-y-1">
                            {factor.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-amber-600">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Priority Action Items */}
      {presentRiskFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Priority Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {presentRiskFactors
                .sort((a, b) => {
                  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                  return severityOrder[b.severity] - severityOrder[a.severity] || b.impact - a.impact;
                })
                .slice(0, 5)
                .map((factor, index) => (
                  <div key={factor.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{factor.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {factor.recommendations[0]}
                      </p>
                    </div>
                    <Badge variant={getSeverityBadge(factor.severity)}>
                      {factor.severity}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}