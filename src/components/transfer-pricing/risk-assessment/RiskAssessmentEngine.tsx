import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Shield, TrendingUp, FileText, Globe, Clock, Calculator } from 'lucide-react';
import { RiskFactorAssessment } from './RiskFactorAssessment';
import { JurisdictionRiskAnalysis } from './JurisdictionRiskAnalysis';
import { RiskMitigationPlan } from './RiskMitigationPlan';
import { TPRiskAssessment, TPEntity, TPTransaction } from '@/types/transfer-pricing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/logger';

interface RiskAssessmentEngineProps {
  entityId?: string;
  transactionId?: string;
}

interface RiskScore {
  category: string;
  score: number;
  weight: number;
  factors: string[];
}

interface OverallRiskAssessment {
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  categories: RiskScore[];
  recommendations: string[];
}

const RISK_COLORS = {
  low: '#22c55e',      // green-500
  medium: '#f59e0b',   // amber-500
  high: '#ef4444',     // red-500
  critical: '#dc2626'  // red-600
};

export function RiskAssessmentEngine({ entityId, transactionId }: RiskAssessmentEngineProps) {
  const [assessments, setAssessments] = useState<TPRiskAssessment[]>([]);
  const [entities, setEntities] = useState<TPEntity[]>([]);
  const [transactions, setTransactions] = useState<TPTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [overallAssessment, setOverallAssessment] = useState<OverallRiskAssessment | null>(null);

  useEffect(() => {
    fetchData();
  }, [entityId, transactionId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch risk assessments
      let riskQuery = supabase.from('tp_risk_assessments').select('*');
      if (entityId) riskQuery = riskQuery.eq('entity_id', entityId);
      if (transactionId) riskQuery = riskQuery.eq('transaction_id', transactionId);
      
      const { data: risks, error: riskError } = await riskQuery.order('assessment_date', { ascending: false });

      // Fetch entities and transactions for context
      const [entitiesResult, transactionsResult] = await Promise.all([
        supabase.from('tp_entities').select('*'),
        supabase.from('tp_transactions').select('*')
      ]);

      if (riskError) throw riskError;

      const typedRisks: TPRiskAssessment[] = (risks || []).map(risk => ({
        ...risk,
        risk_factors: risk.risk_factors as Record<string, any>
      }));

      const typedEntities: TPEntity[] = (entitiesResult.data || []).map(entity => ({
        ...entity,
        functional_analysis: entity.functional_analysis as Record<string, any>,
        financial_data: entity.financial_data as Record<string, any>
      }));

      const typedTransactions: TPTransaction[] = (transactionsResult.data || []).map(transaction => ({
        ...transaction,
        arm_length_range: transaction.arm_length_range as Record<string, any>
      }));

      setAssessments(typedRisks);
      setEntities(typedEntities);
      setTransactions(typedTransactions);

      // Calculate overall risk assessment
      if (typedRisks.length > 0) {
        calculateOverallRisk(typedRisks, typedEntities, typedTransactions);
      }

    } catch (error) {
      logger.error('Error fetching data', error as Error, { component: 'RiskAssessmentEngine' });
      toast.error('Failed to load risk assessment data');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallRisk = (risks: TPRiskAssessment[], entities: TPEntity[], transactions: TPTransaction[]) => {
    // Simplified risk calculation algorithm
    const categories: RiskScore[] = [
      {
        category: 'Documentation',
        score: calculateDocumentationRisk(entities, transactions),
        weight: 0.25,
        factors: ['Missing documentation', 'Incomplete analysis', 'Outdated studies']
      },
      {
        category: 'Compliance',
        score: calculateComplianceRisk(entities),
        weight: 0.20,
        factors: ['Deadline adherence', 'Regulatory changes', 'Filing requirements']
      },
      {
        category: 'Economic',
        score: calculateEconomicRisk(transactions),
        weight: 0.30,
        factors: ['Arm\'s length pricing', 'Benchmarking quality', 'Profit margins']
      },
      {
        category: 'Operational',
        score: calculateOperationalRisk(entities, transactions),
        weight: 0.15,
        factors: ['Business complexity', 'Related party dependencies', 'Geographic spread']
      },
      {
        category: 'Regulatory',
        score: calculateRegulatoryRisk(entities),
        weight: 0.10,
        factors: ['Jurisdiction risk', 'BEPS compliance', 'Audit history']
      }
    ];

    const overall_score = categories.reduce((sum, cat) => sum + (cat.score * cat.weight), 0);
    
    let risk_level: 'low' | 'medium' | 'high' | 'critical';
    if (overall_score >= 80) risk_level = 'critical';
    else if (overall_score >= 60) risk_level = 'high';
    else if (overall_score >= 40) risk_level = 'medium';
    else risk_level = 'low';

    const recommendations = generateRecommendations(categories, risk_level);

    setOverallAssessment({
      overall_score,
      risk_level,
      categories,
      recommendations
    });
  };

  const calculateDocumentationRisk = (entities: TPEntity[], transactions: TPTransaction[]): number => {
    let score = 0;
    
    // Check for missing entity documentation
    entities.forEach(entity => {
      if (!entity.functional_analysis || Object.keys(entity.functional_analysis).length === 0) score += 20;
      if (!entity.financial_data || Object.keys(entity.financial_data).length === 0) score += 15;
      if (!entity.business_description) score += 10;
    });

    // Check for missing transaction documentation
    transactions.forEach(transaction => {
      if (!transaction.description) score += 15;
      if (!transaction.pricing_method) score += 20;
      if (transaction.documentation_status === 'pending') score += 10;
    });

    return Math.min(100, score);
  };

  const calculateComplianceRisk = (entities: TPEntity[]): number => {
    // Simplified compliance risk calculation
    let score = 0;
    
    // Multi-jurisdiction entities have higher compliance risk
    const jurisdictions = new Set(entities.map(e => e.country_code));
    if (jurisdictions.size > 3) score += 30;
    else if (jurisdictions.size > 1) score += 15;

    // High-risk jurisdictions
    const highRiskCountries = ['US', 'DE', 'FR', 'UK', 'AU'];
    entities.forEach(entity => {
      if (highRiskCountries.includes(entity.country_code)) score += 10;
    });

    return Math.min(100, score);
  };

  const calculateEconomicRisk = (transactions: TPTransaction[]): number => {
    let score = 0;

    transactions.forEach(transaction => {
      // High-value transactions carry more risk
      if ((transaction.amount || 0) > 10000000) score += 20; // > $10M
      else if ((transaction.amount || 0) > 1000000) score += 10; // > $1M

      // Missing arm's length analysis
      if (!transaction.arm_length_range || Object.keys(transaction.arm_length_range).length === 0) {
        score += 25;
      }

      // Complex transaction types
      if (transaction.transaction_type === 'intangible_property') score += 15;
      if (transaction.transaction_type === 'financial_transactions') score += 10;
    });

    return Math.min(100, score / Math.max(1, transactions.length));
  };

  const calculateOperationalRisk = (entities: TPEntity[], transactions: TPTransaction[]): number => {
    let score = 0;

    // Large number of entities increases complexity
    if (entities.length > 10) score += 20;
    else if (entities.length > 5) score += 10;

    // Large number of transactions
    if (transactions.length > 20) score += 15;
    else if (transactions.length > 10) score += 8;

    return Math.min(100, score);
  };

  const calculateRegulatoryRisk = (entities: TPEntity[]): number => {
    let score = 0;

    // BEPS Action 13 jurisdictions
    const bepsJurisdictions = ['US', 'UK', 'DE', 'FR', 'AU', 'CA', 'JP'];
    entities.forEach(entity => {
      if (bepsJurisdictions.includes(entity.country_code)) score += 15;
    });

    return Math.min(100, score);
  };

  const generateRecommendations = (categories: RiskScore[], riskLevel: string): string[] => {
    const recommendations: string[] = [];

    categories.forEach(category => {
      if (category.score > 60) {
        switch (category.category) {
          case 'Documentation':
            recommendations.push('Complete missing transfer pricing documentation');
            recommendations.push('Update functional and risk analysis');
            break;
          case 'Economic':
            recommendations.push('Perform detailed benchmarking study');
            recommendations.push('Review arm\'s length pricing policies');
            break;
          case 'Compliance':
            recommendations.push('Establish compliance monitoring system');
            recommendations.push('Review filing requirements across jurisdictions');
            break;
          case 'Operational':
            recommendations.push('Simplify inter-company transaction structure');
            recommendations.push('Implement centralized TP management');
            break;
          case 'Regulatory':
            recommendations.push('Monitor regulatory changes in key jurisdictions');
            recommendations.push('Consider advance pricing agreement (APA)');
            break;
        }
      }
    });

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Consider engaging external transfer pricing advisor');
      recommendations.push('Implement immediate risk mitigation measures');
    }

    return recommendations;
  };

  const getRiskLevelColor = (level: string) => {
    return RISK_COLORS[level as keyof typeof RISK_COLORS] || RISK_COLORS.medium;
  };

  const performNewAssessment = async () => {
    // Trigger new risk assessment calculation
    calculateOverallRisk(assessments, entities, transactions);
    toast.success('Risk assessment updated');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Assessment Engine</h2>
          <p className="text-muted-foreground">
            Comprehensive transfer pricing risk analysis and monitoring
          </p>
        </div>
        <Button onClick={performNewAssessment}>
          <Calculator className="h-4 w-4 mr-2" />
          Run Assessment
        </Button>
      </div>

      {/* Overall Risk Score */}
      {overallAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Overall Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="relative">
                  <div className="text-4xl font-bold mb-2" style={{ color: getRiskLevelColor(overallAssessment.risk_level) }}>
                    {Math.round(overallAssessment.overall_score)}
                  </div>
                  <Badge 
                    variant="outline" 
                    className="uppercase"
                    style={{ 
                      borderColor: getRiskLevelColor(overallAssessment.risk_level),
                      color: getRiskLevelColor(overallAssessment.risk_level)
                    }}
                  >
                    {overallAssessment.risk_level} Risk
                  </Badge>
                </div>
                <Progress 
                  value={overallAssessment.overall_score} 
                  className="mt-4"
                />
              </div>

              <div className="col-span-2">
                <h4 className="font-medium mb-3">Risk Categories</h4>
                <div className="space-y-2">
                  {overallAssessment.categories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <span className="text-sm">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={category.score} className="w-20" />
                        <span className="text-sm font-medium w-8">{Math.round(category.score)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Chart */}
            {overallAssessment && (
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overallAssessment.categories}
                          dataKey="score"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ category, score }) => `${category}: ${Math.round(score)}`}
                        >
                          {overallAssessment.categories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {overallAssessment && (
              <Card>
                <CardHeader>
                  <CardTitle>Priority Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overallAssessment.recommendations.slice(0, 5).map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="factors">
          <RiskFactorAssessment 
            entities={entities}
            transactions={transactions}
            assessments={assessments}
          />
        </TabsContent>

        <TabsContent value="jurisdictions">
          <JurisdictionRiskAnalysis 
            entities={entities}
            transactions={transactions}
          />
        </TabsContent>

        <TabsContent value="mitigation">
          <RiskMitigationPlan 
            overallAssessment={overallAssessment}
            entities={entities}
            transactions={transactions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}