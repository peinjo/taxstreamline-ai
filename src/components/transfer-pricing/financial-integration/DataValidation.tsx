import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, X, Play, RefreshCw, FileText } from 'lucide-react';

interface ValidationResult {
  id: string;
  category: 'completeness' | 'accuracy' | 'consistency' | 'format';
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  affectedRecords: number;
  suggestions: string[];
  status: 'pending' | 'resolved' | 'ignored';
}

interface ValidationSummary {
  totalRecords: number;
  validRecords: number;
  errorRecords: number;
  warningRecords: number;
  completeness: number;
  accuracy: number;
  consistency: number;
}

const MOCK_VALIDATION_RESULTS: ValidationResult[] = [
  {
    id: 'val_1',
    category: 'completeness',
    severity: 'error',
    title: 'Missing Revenue Data',
    description: 'Revenue amounts are missing for Q3 2023 in Entity B financial statements',
    affectedRecords: 12,
    suggestions: [
      'Request complete Q3 2023 financial statements from Entity B',
      'Use interim financial data if available',
      'Contact Entity B finance team for missing data'
    ],
    status: 'pending'
  },
  {
    id: 'val_2',
    category: 'accuracy',
    severity: 'warning',
    title: 'Inconsistent Currency Format',
    description: 'Some amounts appear to be in wrong currency (USD vs EUR) for German entity',
    affectedRecords: 8,
    suggestions: [
      'Verify currency for all German entity transactions',
      'Apply appropriate exchange rates',
      'Standardize currency reporting format'
    ],
    status: 'pending'
  },
  {
    id: 'val_3',
    category: 'consistency',
    severity: 'warning',
    title: 'Account Classification Differences',
    description: 'Same expense types classified differently across entities',
    affectedRecords: 25,
    suggestions: [
      'Standardize chart of accounts across entities',
      'Create mapping for different classification systems',
      'Document classification differences'
    ],
    status: 'pending'
  },
  {
    id: 'val_4',
    category: 'format',
    severity: 'info',
    title: 'Date Format Inconsistency',
    description: 'Mixed date formats found (MM/DD/YYYY vs DD/MM/YYYY)',
    affectedRecords: 156,
    suggestions: [
      'Standardize to ISO format (YYYY-MM-DD)',
      'Apply consistent date parsing rules',
      'Validate date ranges for reasonableness'
    ],
    status: 'pending'
  },
  {
    id: 'val_5',
    category: 'accuracy',
    severity: 'error',
    title: 'Negative Asset Values',
    description: 'Fixed assets showing negative values which may indicate data entry errors',
    affectedRecords: 3,
    suggestions: [
      'Review source documents for affected entries',
      'Check for misclassified transactions',
      'Correct data entry errors'
    ],
    status: 'pending'
  }
];

const MOCK_SUMMARY: ValidationSummary = {
  totalRecords: 1250,
  validRecords: 1046,
  errorRecords: 15,
  warningRecords: 189,
  completeness: 88,
  accuracy: 94,
  consistency: 78
};

export function DataValidation() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>(MOCK_VALIDATION_RESULTS);
  const [summary] = useState<ValidationSummary>(MOCK_SUMMARY);
  const [isRunningValidation, setIsRunningValidation] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const runValidation = async () => {
    setIsRunningValidation(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsRunningValidation(false);
  };

  const updateValidationStatus = (id: string, status: ValidationResult['status']) => {
    setValidationResults(prev => prev.map(result => 
      result.id === id ? { ...result, status } : result
    ));
  };

  const getSeverityIcon = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'outline';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getCategoryColor = (category: ValidationResult['category']) => {
    switch (category) {
      case 'completeness':
        return 'text-purple-600';
      case 'accuracy':
        return 'text-red-600';
      case 'consistency':
        return 'text-orange-600';
      case 'format':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getValidationProgress = () => {
    return ((summary.validRecords / summary.totalRecords) * 100);
  };

  const errorCount = validationResults.filter(r => r.severity === 'error' && r.status === 'pending').length;
  const warningCount = validationResults.filter(r => r.severity === 'warning' && r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Validation Summary</CardTitle>
            <Button onClick={runValidation} disabled={isRunningValidation}>
              {isRunningValidation ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunningValidation ? 'Validating...' : 'Run Validation'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.totalRecords.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.validRecords.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Valid Records</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Data Quality</span>
                <span className="text-sm">{Math.round(getValidationProgress())}%</span>
              </div>
              <Progress value={getValidationProgress()} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Completeness</span>
                  <span className="text-sm font-medium">{summary.completeness}%</span>
                </div>
                <Progress value={summary.completeness} />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Accuracy</span>
                  <span className="text-sm font-medium">{summary.accuracy}%</span>
                </div>
                <Progress value={summary.accuracy} />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Consistency</span>
                  <span className="text-sm font-medium">{summary.consistency}%</span>
                </div>
                <Progress value={summary.consistency} />
              </div>
            </div>
          </div>

          {(errorCount > 0 || warningCount > 0) && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Data validation found {errorCount} critical issue(s) and {warningCount} warning(s) that should be 
                reviewed before proceeding with transfer pricing analysis.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Validation Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="completeness">Completeness</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="format">Format</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>All Validation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(result.severity)}
                        <div>
                          <h4 className="font-medium">{result.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityBadge(result.severity)}>
                          {result.severity}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(result.category)}>
                          {result.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{result.affectedRecords} records affected</span>
                      <span className="capitalize">Status: {result.status}</span>
                    </div>

                    <div className="mb-3">
                      <h5 className="font-medium text-sm mb-2">Suggestions:</h5>
                      <ul className="text-sm space-y-1">
                        {result.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateValidationStatus(result.id, 'resolved')}
                        disabled={result.status === 'resolved'}
                      >
                        Mark Resolved
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateValidationStatus(result.id, 'ignored')}
                        disabled={result.status === 'ignored'}
                      >
                        Ignore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {['completeness', 'accuracy', 'consistency', 'format'].map(category => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{category} Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {validationResults
                    .filter(result => result.category === category)
                    .map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getSeverityIcon(result.severity)}
                            <div>
                              <h4 className="font-medium">{result.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {result.description}
                              </p>
                            </div>
                          </div>
                          <Badge variant={getSeverityBadge(result.severity)}>
                            {result.severity}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground mb-3">
                          {result.affectedRecords} records affected
                        </div>

                        <div className="mb-3">
                          <h5 className="font-medium text-sm mb-2">Recommendations:</h5>
                          <ul className="text-sm space-y-1">
                            {result.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateValidationStatus(result.id, 'resolved')}
                            disabled={result.status === 'resolved'}
                          >
                            {result.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateValidationStatus(result.id, 'ignored')}
                            disabled={result.status === 'ignored'}
                          >
                            {result.status === 'ignored' ? 'Ignored' : 'Ignore'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  
                  {validationResults.filter(result => result.category === category).length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-muted-foreground">No {category} issues found.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Validation Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Quality Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Critical Validations</h4>
              <ul className="text-sm space-y-1">
                <li>• All required financial line items present</li>
                <li>• Mathematical accuracy of calculations</li>
                <li>• Consistent currency denominations</li>
                <li>• Valid date ranges and periods</li>
                <li>• No duplicate or missing transactions</li>
                <li>• Proper account classifications</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Quality Checks</h4>
              <ul className="text-sm space-y-1">
                <li>• Cross-entity consistency validation</li>
                <li>• Reasonableness testing of amounts</li>
                <li>• Format standardization checks</li>
                <li>• Reference data integrity</li>
                <li>• Completeness across time periods</li>
                <li>• Audit trail maintenance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}