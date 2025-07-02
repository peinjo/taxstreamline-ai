import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, Info, FileText, Building2, TrendingUp, Shield } from 'lucide-react';
import type { DocumentWizardData, ValidationResult } from '../../types/wizard-types';

interface ReviewAndValidationStepProps {
  data: DocumentWizardData;
  validation: ValidationResult;
}

export function ReviewAndValidationStep({ data, validation }: ReviewAndValidationStepProps) {
  
  const getSectionSummary = () => {
    return [
      {
        title: 'Entity Details',
        icon: Building2,
        items: [
          `Company: ${data.entityDetails.companyName}`,
          `Jurisdiction: ${data.entityDetails.jurisdiction}`,
          `Tax ID: ${data.entityDetails.taxId}`,
          `Fiscal Year End: ${data.entityDetails.fiscalYearEnd}`
        ],
        completeness: data.entityDetails.companyName && data.entityDetails.jurisdiction ? 100 : 50
      },
      {
        title: 'Controlled Transactions',
        icon: TrendingUp,
        items: [
          `${data.controlledTransactions.length} transaction(s) documented`,
          `Total value: ${data.controlledTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()} USD`,
          `Types: ${Array.from(new Set(data.controlledTransactions.map(tx => tx.type))).join(', ')}`
        ],
        completeness: data.controlledTransactions.length > 0 ? 100 : 0
      },
      {
        title: 'Functional Analysis',
        icon: FileText,
        items: [
          `${data.functionalAnalysis.functions.length} function(s) analyzed`,
          `${data.functionalAnalysis.assets.length} asset(s) documented`,
          `${data.functionalAnalysis.risks.length} risk(s) assessed`
        ],
        completeness: (data.functionalAnalysis.functions.length + data.functionalAnalysis.assets.length + data.functionalAnalysis.risks.length) > 0 ? 75 : 0
      },
      {
        title: 'Economic Analysis',
        icon: TrendingUp,
        items: [
          `${Object.keys(data.economicAnalysis.pricingMethods).length} pricing method(s) applied`,
          `${data.economicAnalysis.benchmarkingData.length} comparable(s) identified`,
          `Methods: ${Object.keys(data.economicAnalysis.pricingMethods).join(', ')}`
        ],
        completeness: Object.keys(data.economicAnalysis.pricingMethods).length > 0 ? 80 : 0
      },
      {
        title: 'OECD Compliance',
        icon: Shield,
        items: [
          `Master File: ${data.oecdCompliance.masterFileRequired ? 'Required' : 'Not Required'}`,
          `Local File: ${data.oecdCompliance.localFileRequired ? 'Required' : 'Not Required'}`,
          `CbCR: ${data.oecdCompliance.cbcrRequired ? 'Required' : 'Not Required'}`,
          `${data.oecdCompliance.jurisdictionSpecificRequirements.length} jurisdiction requirement(s)`
        ],
        completeness: 90
      }
    ];
  };

  const getValidationIcon = () => {
    if (validation.isValid) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    } else if (validation.errors.length > 0) {
      return <XCircle className="h-6 w-6 text-red-600" />;
    } else {
      return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getValidationStatus = () => {
    if (validation.isValid) {
      return { text: 'Ready for Generation', variant: 'default' as const };
    } else if (validation.errors.length > 0) {
      return { text: 'Requires Corrections', variant: 'destructive' as const };
    } else {
      return { text: 'Needs Review', variant: 'secondary' as const };
    }
  };

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const sectionSummary = getSectionSummary();
  const validationStatus = getValidationStatus();

  return (
    <div className="space-y-6">
      {/* Validation Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getValidationIcon()}
              Document Validation Status
            </CardTitle>
            <Badge variant={validationStatus.variant}>
              {validationStatus.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{validation.completeness.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Completeness</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl font-bold ${getRiskLevelColor(validation.riskLevel)}`}>
                {validation.riskLevel?.toUpperCase() || 'MEDIUM'}
              </div>
              <div className="text-sm text-muted-foreground">Risk Level</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{validation.errors.length}</div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{validation.completeness.toFixed(0)}%</span>
            </div>
            <Progress value={validation.completeness} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Section Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionSummary.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5" />
                  {section.title}
                  <Badge variant="outline" className="ml-auto">
                    {section.completeness}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Issues Found:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm">
              Please resolve these issues before generating the document.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Recommendations for Improvement:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm">
              These recommendations will improve the quality and compliance of your documentation.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* OECD Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>OECD BEPS Action 13 Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 border rounded-lg ${data.oecdCompliance.masterFileRequired ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Master File</span>
                {data.oecdCompliance.masterFileRequired ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {data.oecdCompliance.masterFileRequired 
                  ? 'Required - will be generated'
                  : 'Not required for this entity'
                }
              </p>
            </div>

            <div className={`p-4 border rounded-lg ${data.oecdCompliance.localFileRequired ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Local File</span>
                {data.oecdCompliance.localFileRequired ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {data.oecdCompliance.localFileRequired 
                  ? 'Required - will be generated'
                  : 'Not required for this entity'
                }
              </p>
            </div>

            <div className={`p-4 border rounded-lg ${data.oecdCompliance.cbcrRequired ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">CbC Reporting</span>
                {data.oecdCompliance.cbcrRequired ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {data.oecdCompliance.cbcrRequired 
                  ? 'Required - separate filing needed'
                  : 'Not required for this entity'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Preview */}
      {validation.isValid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Generation Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your transfer pricing documentation will be generated with the following structure:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Executive Summary</li>
                  <li>Entity Information and Organizational Structure</li>
                  <li>Controlled Transactions Analysis</li>
                  <li>Functional Analysis (Functions, Assets, Risks)</li>
                  <li>Economic Analysis and Benchmarking</li>
                  <li>OECD Compliance Documentation</li>
                  <li>Supporting Documentation and Appendices</li>
                </ul>
                <p className="mt-2 text-sm">
                  The document will be saved as a draft and can be further edited after generation.
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}