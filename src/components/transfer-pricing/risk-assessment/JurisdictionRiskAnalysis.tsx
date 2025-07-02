import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { TPEntity, TPTransaction } from '@/types/transfer-pricing';

interface JurisdictionRiskAnalysisProps {
  entities: TPEntity[];
  transactions: TPTransaction[];
}

interface JurisdictionRisk {
  country_code: string;
  country_name: string;
  entity_count: number;
  transaction_value: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: string[];
  compliance_requirements: string[];
  deadlines: string[];
  recommendations: string[];
}

const JURISDICTION_DATA: Record<string, {
  name: string;
  base_risk: number;
  factors: string[];
  requirements: string[];
  deadlines: string[];
}> = {
  'US': {
    name: 'United States',
    base_risk: 85,
    factors: [
      'Aggressive transfer pricing enforcement',
      'Complex regulations (IRC 482)',
      'High penalty regime',
      'Extensive documentation requirements'
    ],
    requirements: [
      'Form 8865 for foreign partnerships',
      'Form 5471 for foreign corporations',
      'Transfer pricing study documentation',
      'Country-by-Country Reporting'
    ],
    deadlines: [
      'Income tax return: March 15 (corporations)',
      'CbCR filing: 12 months after year-end',
      'Form 5471: With income tax return'
    ]
  },
  'DE': {
    name: 'Germany',
    base_risk: 80,
    factors: [
      'Strict OECD implementation',
      'Business restructuring provisions',
      'Hypothetical arm\'s length test',
      'Secondary adjustment rules'
    ],
    requirements: [
      'Master File and Local File',
      'Extraordinary business transactions documentation',
      'Transfer pricing documentation for €5M+ transactions',
      'Country-by-Country Reporting'
    ],
    deadlines: [
      'Master File: 12 months after year-end',
      'Local File: 12 months after year-end',
      'Documentation: With tax return filing'
    ]
  },
  'UK': {
    name: 'United Kingdom',
    base_risk: 75,
    factors: [
      'Diverted profits tax',
      'OECD BEPS implementation',
      'Thin capitalization rules',
      'Transfer pricing penalty regime'
    ],
    requirements: [
      'Master File and Local File',
      'Transfer pricing return',
      'Country-by-Country Reporting',
      'Advance pricing agreement option'
    ],
    deadlines: [
      'Corporation tax return: 12 months after year-end',
      'CbCR filing: 12 months after year-end',
      'Master File: On request'
    ]
  },
  'AU': {
    name: 'Australia',
    base_risk: 78,
    factors: [
      'Multinational anti-avoidance law',
      'Transfer pricing benefit test',
      'Reconstruction approach',
      'Administrative penalties'
    ],
    requirements: [
      'Master File and Local File',
      'Local File for A$25M+ transactions',
      'Country-by-Country Reporting',
      'Transfer pricing records'
    ],
    deadlines: [
      'Income tax return: April 30 or May 15',
      'CbCR filing: 12 months after year-end',
      'Local File: With tax return'
    ]
  },
  'FR': {
    name: 'France',
    base_risk: 72,
    factors: [
      'Comprehensive transfer pricing rules',
      'Documentation obligations',
      'Secondary adjustment provisions',
      'Withholding tax on management fees'
    ],
    requirements: [
      'Master File and Local File',
      'Transfer pricing documentation',
      'Country-by-Country Reporting',
      'Annual summary table'
    ],
    deadlines: [
      'Corporate income tax: 3 months + 2 days after year-end',
      'Master File: On request',
      'Local File: On request'
    ]
  }
};

export function JurisdictionRiskAnalysis({ entities, transactions }: JurisdictionRiskAnalysisProps) {
  const jurisdictionAnalysis = useMemo(() => {
    const jurisdictionMap = new Map<string, JurisdictionRisk>();

    // Initialize with entities
    entities.forEach(entity => {
      const countryCode = entity.country_code;
      const jurisdictionInfo = JURISDICTION_DATA[countryCode];
      
      if (!jurisdictionMap.has(countryCode)) {
        let riskScore = jurisdictionInfo?.base_risk || 50;
        
        // Adjust risk based on entity complexity
        if ((entity.financial_data?.revenue || 0) > 100000000) riskScore += 10; // >$100M
        if (entity.entity_type === 'parent') riskScore += 5;
        
        jurisdictionMap.set(countryCode, {
          country_code: countryCode,
          country_name: jurisdictionInfo?.name || countryCode,
          entity_count: 1,
          transaction_value: 0,
          risk_score: riskScore,
          risk_level: getRiskLevel(riskScore),
          risk_factors: jurisdictionInfo?.factors || [],
          compliance_requirements: jurisdictionInfo?.requirements || [],
          deadlines: jurisdictionInfo?.deadlines || [],
          recommendations: generateRecommendations(countryCode, riskScore)
        });
      } else {
        const existing = jurisdictionMap.get(countryCode)!;
        existing.entity_count += 1;
      }
    });

    // Add transaction values
    transactions.forEach(transaction => {
      // For simplicity, we'll distribute transaction value across all jurisdictions
      // In practice, you'd need to map transactions to specific jurisdictions
      const transactionValue = transaction.amount || 0;
      jurisdictionMap.forEach(jurisdiction => {
        jurisdiction.transaction_value += transactionValue / jurisdictionMap.size;
        
        // Adjust risk based on transaction complexity
        if (transaction.transaction_type === 'intangible_property') {
          jurisdiction.risk_score += 5;
        }
        if (transactionValue > 10000000) { // >$10M
          jurisdiction.risk_score += 3;
        }
        
        jurisdiction.risk_level = getRiskLevel(jurisdiction.risk_score);
      });
    });

    return Array.from(jurisdictionMap.values()).sort((a, b) => b.risk_score - a.risk_score);
  }, [entities, transactions]);

  function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 65) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
  }

  function generateRecommendations(countryCode: string, riskScore: number): string[] {
    const recommendations = [];
    
    if (riskScore >= 80) {
      recommendations.push('Consider engaging local transfer pricing expert');
      recommendations.push('Implement comprehensive documentation strategy');
    }
    
    if (riskScore >= 65) {
      recommendations.push('Monitor local regulatory developments closely');
      recommendations.push('Consider advance pricing agreement (APA)');
    }
    
    switch (countryCode) {
      case 'US':
        recommendations.push('Ensure IRC 482 compliance');
        recommendations.push('Maintain detailed transfer pricing studies');
        break;
      case 'DE':
        recommendations.push('Document extraordinary business transactions');
        recommendations.push('Prepare for hypothetical arm\'s length test');
        break;
      case 'UK':
        recommendations.push('Assess diverted profits tax exposure');
        recommendations.push('Consider UK transfer pricing exemptions');
        break;
      case 'AU':
        recommendations.push('Ensure MAAL compliance');
        recommendations.push('Document reconstruction approach');
        break;
      case 'FR':
        recommendations.push('Prepare annual summary table');
        recommendations.push('Review withholding tax obligations');
        break;
    }
    
    return recommendations;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'secondary';
      case 'medium': return 'outline';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const totalTransactionValue = jurisdictionAnalysis.reduce((sum, j) => sum + j.transaction_value, 0);
  const averageRiskScore = jurisdictionAnalysis.length > 0 
    ? jurisdictionAnalysis.reduce((sum, j) => sum + j.risk_score, 0) / jurisdictionAnalysis.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Global Risk Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Risk Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{jurisdictionAnalysis.length}</div>
              <p className="text-sm text-muted-foreground">Jurisdictions</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(averageRiskScore)}</div>
              <p className="text-sm text-muted-foreground">Avg Risk Score</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {jurisdictionAnalysis.filter(j => j.risk_level === 'high' || j.risk_level === 'critical').length}
              </div>
              <p className="text-sm text-muted-foreground">High Risk</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${(totalTransactionValue / 1000000).toFixed(1)}M
              </div>
              <p className="text-sm text-muted-foreground">Transaction Value</p>
            </div>
          </div>

          {jurisdictionAnalysis.some(j => j.risk_level === 'critical') && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical Jurisdiction Alert:</strong> You have operations in jurisdictions with critical 
                transfer pricing risk. Immediate attention and specialized expertise are recommended.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Jurisdiction Analysis */}
      <div className="space-y-4">
        {jurisdictionAnalysis.map((jurisdiction) => (
          <Card key={jurisdiction.country_code}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getFlagEmoji(jurisdiction.country_code)}</span>
                  {jurisdiction.country_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={getRiskBadgeVariant(jurisdiction.risk_level)}>
                    {jurisdiction.risk_level} risk
                  </Badge>
                  <span className={`text-lg font-bold ${getRiskColor(jurisdiction.risk_level)}`}>
                    {Math.round(jurisdiction.risk_score)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Metrics */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Risk Score</span>
                      <span className="text-sm">{Math.round(jurisdiction.risk_score)}/100</span>
                    </div>
                    <Progress value={jurisdiction.risk_score} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{jurisdiction.entity_count} entities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${(jurisdiction.transaction_value / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div>
                    <h4 className="font-medium mb-2">Key Risk Factors</h4>
                    <ul className="text-sm space-y-1">
                      {jurisdiction.risk_factors.slice(0, 3).map((factor, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Compliance Requirements */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Compliance Requirements</h4>
                    <ul className="text-sm space-y-1">
                      {jurisdiction.compliance_requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {jurisdiction.deadlines.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Key Deadlines</h4>
                      <ul className="text-sm space-y-1">
                        {jurisdiction.deadlines.map((deadline, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            {deadline}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {jurisdiction.recommendations.length > 0 && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Recommended Actions</h4>
                  <ul className="text-sm space-y-1">
                    {jurisdiction.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {jurisdictionAnalysis.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No jurisdiction data available.</p>
            <p className="text-sm text-muted-foreground">Add entities to analyze jurisdiction-specific risks.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    'US': '🇺🇸',
    'DE': '🇩🇪',
    'UK': '🇬🇧',
    'AU': '🇦🇺',
    'FR': '🇫🇷',
    'IT': '🇮🇹',
    'ES': '🇪🇸',
    'NL': '🇳🇱',
    'CA': '🇨🇦',
    'JP': '🇯🇵',
    'SG': '🇸🇬',
    'HK': '🇭🇰',
    'CH': '🇨🇭',
    'IE': '🇮🇪',
    'LU': '🇱🇺',
    'BE': '🇧🇪',
    'SE': '🇸🇪',
    'NO': '🇳🇴'
  };
  
  return flags[countryCode] || '🏳️';
}