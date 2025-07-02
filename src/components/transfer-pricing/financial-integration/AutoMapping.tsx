import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Check, X, RefreshCw, FileText, Zap, Settings } from 'lucide-react';

interface MappingRule {
  id: string;
  sourceField: string;
  targetField: string;
  confidence: number;
  status: 'suggested' | 'approved' | 'rejected';
  transformationType: 'direct' | 'formula' | 'lookup' | 'custom';
  transformation?: string;
}

interface FieldMapping {
  source: string;
  target: string;
  dataType: string;
  sampleValue: string;
  mappingRule?: MappingRule;
}

const TRANSFER_PRICING_FIELDS = [
  { key: 'revenue', label: 'Revenue/Sales', category: 'Income Statement', required: true },
  { key: 'cost_of_goods_sold', label: 'Cost of Goods Sold', category: 'Income Statement', required: true },
  { key: 'gross_profit', label: 'Gross Profit', category: 'Income Statement', required: true },
  { key: 'operating_expenses', label: 'Operating Expenses', category: 'Income Statement', required: true },
  { key: 'operating_profit', label: 'Operating Profit/EBIT', category: 'Income Statement', required: true },
  { key: 'net_profit', label: 'Net Profit', category: 'Income Statement', required: true },
  { key: 'total_assets', label: 'Total Assets', category: 'Balance Sheet', required: true },
  { key: 'total_liabilities', label: 'Total Liabilities', category: 'Balance Sheet', required: false },
  { key: 'equity', label: 'Shareholders Equity', category: 'Balance Sheet', required: false },
  { key: 'intangible_assets', label: 'Intangible Assets', category: 'Balance Sheet', required: false },
  { key: 'related_party_revenue', label: 'Related Party Revenue', category: 'TP Specific', required: true },
  { key: 'related_party_expenses', label: 'Related Party Expenses', category: 'TP Specific', required: true },
  { key: 'intercompany_royalties', label: 'Intercompany Royalties', category: 'TP Specific', required: false },
  { key: 'management_fees', label: 'Management Fees', category: 'TP Specific', required: false }
];

const MOCK_SOURCE_FIELDS = [
  { field: 'Total Revenue', dataType: 'number', sampleValue: '5,250,000' },
  { field: 'Sales Revenue', dataType: 'number', sampleValue: '4,890,000' },
  { field: 'Cost of Sales', dataType: 'number', sampleValue: '3,150,000' },
  { field: 'Gross Margin', dataType: 'number', sampleValue: '2,100,000' },
  { field: 'Operating Costs', dataType: 'number', sampleValue: '1,560,000' },
  { field: 'EBITDA', dataType: 'number', sampleValue: '890,000' },
  { field: 'Net Income', dataType: 'number', sampleValue: '540,000' },
  { field: 'Balance Sheet Total', dataType: 'number', sampleValue: '12,500,000' },
  { field: 'Total Debt', dataType: 'number', sampleValue: '3,200,000' },
  { field: 'Related Sales', dataType: 'number', sampleValue: '2,100,000' },
  { field: 'Interco Expenses', dataType: 'number', sampleValue: '450,000' }
];

export function AutoMapping() {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [isGeneratingMappings, setIsGeneratingMappings] = useState(false);
  const [mappingProgress, setMappingProgress] = useState(0);

  const generateAutoMappings = async () => {
    setIsGeneratingMappings(true);
    setMappingProgress(0);

    // Simulate auto-mapping process
    const generatedMappings: FieldMapping[] = [];

    for (let i = 0; i < MOCK_SOURCE_FIELDS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const sourceField = MOCK_SOURCE_FIELDS[i];
      const suggestedTarget = suggestTargetField(sourceField.field);
      
      if (suggestedTarget) {
        const confidence = calculateConfidence(sourceField.field, suggestedTarget.key);
        
        generatedMappings.push({
          source: sourceField.field,
          target: suggestedTarget.key,
          dataType: sourceField.dataType,
          sampleValue: sourceField.sampleValue,
          mappingRule: {
            id: `rule_${i}`,
            sourceField: sourceField.field,
            targetField: suggestedTarget.key,
            confidence,
            status: confidence > 80 ? 'approved' : 'suggested',
            transformationType: 'direct'
          }
        });
      }
      
      setMappingProgress(((i + 1) / MOCK_SOURCE_FIELDS.length) * 100);
    }

    setMappings(generatedMappings);
    setIsGeneratingMappings(false);
  };

  const suggestTargetField = (sourceField: string): typeof TRANSFER_PRICING_FIELDS[0] | null => {
    const normalizedSource = sourceField.toLowerCase();
    
    // Simple matching logic
    if (normalizedSource.includes('revenue') || normalizedSource.includes('sales')) {
      if (normalizedSource.includes('related')) {
        return TRANSFER_PRICING_FIELDS.find(f => f.key === 'related_party_revenue') || null;
      }
      return TRANSFER_PRICING_FIELDS.find(f => f.key === 'revenue') || null;
    }
    
    if (normalizedSource.includes('cost') && normalizedSource.includes('sales')) {
      return TRANSFER_PRICING_FIELDS.find(f => f.key === 'cost_of_goods_sold') || null;
    }
    
    if (normalizedSource.includes('gross') && normalizedSource.includes('margin')) {
      return TRANSFER_PRICING_FIELDS.find(f => f.key === 'gross_profit') || null;
    }
    
    if (normalizedSource.includes('operating') && normalizedSource.includes('cost')) {
      return TRANSFER_PRICING_FIELDS.find(f => f.key === 'operating_expenses') || null;
    }
    
    if (normalizedSource.includes('ebitda') || (normalizedSource.includes('operating') && normalizedSource.includes('profit'))) {
      return TRANSFER_PRICING_FIELDS.find(f => f.key === 'operating_profit') || null;
    }
    
    if (normalizedSource.includes('net') && normalizedSource.includes('income')) {
      return TRANSFER_PRICING_FIELDS.find(f => f.key === 'net_profit') || null;
    }
    
    if (normalizedSource.includes('balance') && normalizedSource.includes('total')) {
      return TRANSFER_PRICING_FIELDS.find(f => f.key === 'total_assets') || null;
    }
    
    if (normalizedSource.includes('debt') || (normalizedSource.includes('total') && normalizedSource.includes('liab'))) {
      return TRANSFER_PRICING_FIELDS.find(f => f.key === 'total_liabilities') || null;
    }
    
    if (normalizedSource.includes('interco') && normalizedSource.includes('expense')) {
      return TRANSFER_PRICING_FIELDS.find(f => f.key === 'related_party_expenses') || null;
    }
    
    return null;
  };

  const calculateConfidence = (sourceField: string, targetKey: string): number => {
    // Simple confidence calculation based on string similarity
    const normalizedSource = sourceField.toLowerCase();
    const targetField = TRANSFER_PRICING_FIELDS.find(f => f.key === targetKey);
    
    if (!targetField) return 0;
    
    const normalizedTarget = targetField.label.toLowerCase();
    
    // Basic keyword matching
    const sourceWords = normalizedSource.split(/\s+/);
    const targetWords = normalizedTarget.split(/\s+/);
    
    const matchingWords = sourceWords.filter(word => 
      targetWords.some(targetWord => 
        targetWord.includes(word) || word.includes(targetWord)
      )
    );
    
    const confidence = (matchingWords.length / Math.max(sourceWords.length, targetWords.length)) * 100;
    
    // Add bonus for exact matches
    if (normalizedSource.includes(normalizedTarget) || normalizedTarget.includes(normalizedSource)) {
      return Math.min(95, confidence + 20);
    }
    
    return Math.min(90, confidence);
  };

  const updateMappingStatus = (index: number, status: MappingRule['status']) => {
    setMappings(prev => prev.map((mapping, i) => 
      i === index && mapping.mappingRule 
        ? { ...mapping, mappingRule: { ...mapping.mappingRule, status } }
        : mapping
    ));
  };

  const updateMappingTarget = (index: number, newTarget: string) => {
    setMappings(prev => prev.map((mapping, i) => 
      i === index 
        ? { ...mapping, target: newTarget }
        : mapping
    ));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: MappingRule['status']) => {
    switch (status) {
      case 'approved':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
    }
  };

  const approvedMappings = mappings.filter(m => m.mappingRule?.status === 'approved').length;
  const totalMappings = mappings.length;

  return (
    <div className="space-y-6">
      {/* Auto-Mapping Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Intelligent Field Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Auto-mapping uses AI to intelligently match your financial data fields to standard 
                transfer pricing report sections. Review and approve suggestions before proceeding.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Automatically detect and map fields from uploaded financial statements
                </p>
              </div>
              <Button onClick={generateAutoMappings} disabled={isGeneratingMappings}>
                {isGeneratingMappings ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {isGeneratingMappings ? 'Generating...' : 'Generate Mappings'}
              </Button>
            </div>

            {isGeneratingMappings && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Analyzing field patterns...</span>
                  <span>{Math.round(mappingProgress)}%</span>
                </div>
                <Progress value={mappingProgress} />
              </div>
            )}

            {totalMappings > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span>Progress: {approvedMappings}/{totalMappings} mappings approved</span>
                <Progress value={(approvedMappings / totalMappings) * 100} className="flex-1" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Mappings */}
      {mappings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Field Mapping Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mappings.map((mapping, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <span className="font-medium">{mapping.source}</span>
                        <p className="text-muted-foreground">Sample: {mapping.sampleValue}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {mapping.mappingRule && (
                        <>
                          <Badge variant="outline">
                            {Math.round(mapping.mappingRule.confidence)}% confidence
                          </Badge>
                          {getStatusIcon(mapping.mappingRule.status)}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    
                    <div className="flex-1">
                      <Select 
                        value={mapping.target} 
                        onValueChange={(value) => updateMappingTarget(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target field" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRANSFER_PRICING_FIELDS.map((field) => (
                            <SelectItem key={field.key} value={field.key}>
                              <div className="flex items-center justify-between w-full">
                                <span>{field.label}</span>
                                <Badge variant="outline" className="ml-2">
                                  {field.category}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Target: {TRANSFER_PRICING_FIELDS.find(f => f.key === mapping.target)?.label || 'Not selected'}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMappingStatus(index, 'approved')}
                        disabled={mapping.mappingRule?.status === 'approved'}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateMappingStatus(index, 'rejected')}
                        disabled={mapping.mappingRule?.status === 'rejected'}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {approvedMappings} of {totalMappings} mappings approved
              </div>
              <Button disabled={approvedMappings === 0}>
                Apply Mappings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Target Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transfer Pricing Field Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Income Statement', 'Balance Sheet', 'TP Specific'].map(category => (
              <div key={category}>
                <h4 className="font-medium mb-2">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {TRANSFER_PRICING_FIELDS
                    .filter(field => field.category === category)
                    .map((field) => (
                      <div key={field.key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{field.label}</span>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mapping Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Mapping Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Accuracy Guidelines</h4>
              <ul className="text-sm space-y-1">
                <li>• Verify field definitions match exactly</li>
                <li>• Check for consistent accounting treatments</li>
                <li>• Validate sample values for reasonableness</li>
                <li>• Ensure currency consistency</li>
                <li>• Review consolidation adjustments</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Required Mappings</h4>
              <ul className="text-sm space-y-1">
                <li>• Revenue (total and related party)</li>
                <li>• Operating profit/EBIT</li>
                <li>• Total assets</li>
                <li>• Related party transactions</li>
                <li>• Cost of goods sold</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}