import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Info, TrendingUp } from 'lucide-react';
import type { EconomicAnalysis, ValidationResult } from '../../types/wizard-types';

const PRICING_METHODS = [
  { 
    value: 'CUP', 
    label: 'Comparable Uncontrolled Price (CUP)',
    description: 'Compares the price charged for property or services in a controlled transaction to the price charged for property or services in a comparable uncontrolled transaction.'
  },
  { 
    value: 'TNMM', 
    label: 'Transactional Net Margin Method (TNMM)',
    description: 'Examines the net profit margin relative to an appropriate base that a taxpayer realizes from a controlled transaction.'
  },
  { 
    value: 'CPM', 
    label: 'Cost Plus Method (CPM)',
    description: 'Uses the costs incurred by the supplier of property or services in a controlled transaction and adds an appropriate profit markup.'
  },
  { 
    value: 'PSM', 
    label: 'Profit Split Method (PSM)',
    description: 'Seeks to eliminate the effect on profits of special conditions made or imposed between associated enterprises by determining the division of profits that independent enterprises would have expected to achieve.'
  },
  { 
    value: 'OTHER', 
    label: 'Other Method',
    description: 'Alternative methods when traditional methods cannot be reliably applied.'
  }
];

const PROFIT_LEVEL_INDICATORS = [
  'Return on Assets (ROA)',
  'Return on Sales (ROS)',
  'Markup on Total Costs',
  'Gross Margin',
  'Operating Margin',
  'Berry Ratio',
  'Other'
];

interface EconomicAnalysisStepProps {
  data: EconomicAnalysis;
  onChange: (data: Partial<EconomicAnalysis>) => void;
  validation: ValidationResult;
}

export function EconomicAnalysisStep({ data, onChange, validation }: EconomicAnalysisStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showBenchmarkForm, setShowBenchmarkForm] = useState(false);

  const addPricingMethod = () => {
    if (!selectedMethod) return;

    const newMethod = {
      method: selectedMethod as any,
      rationale: '',
      testedParty: '',
      profitLevelIndicator: '',
      armLengthRange: {
        min: 0,
        max: 0,
        median: 0,
        interquartileRange: [0, 0] as [number, number]
      }
    };

    onChange({
      pricingMethods: {
        ...data.pricingMethods,
        [selectedMethod]: newMethod
      }
    });
    setSelectedMethod('');
  };

  const updatePricingMethod = (methodKey: string, updates: any) => {
    onChange({
      pricingMethods: {
        ...data.pricingMethods,
        [methodKey]: { ...data.pricingMethods[methodKey], ...updates }
      }
    });
  };

  const removePricingMethod = (methodKey: string) => {
    const { [methodKey]: removed, ...remaining } = data.pricingMethods;
    onChange({ pricingMethods: remaining });
  };

  const addBenchmark = () => {
    const newBenchmark = {
      id: `benchmark_${Date.now()}`,
      source: '',
      comparableName: '',
      industry: '',
      geography: '',
      financialData: {},
      reliability: 'medium' as const
    };

    onChange({
      benchmarkingData: [...data.benchmarkingData, newBenchmark]
    });
    setShowBenchmarkForm(false);
  };

  const updateBenchmark = (id: string, updates: any) => {
    const updated = data.benchmarkingData.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
    onChange({ benchmarkingData: updated });
  };

  const removeBenchmark = (id: string) => {
    onChange({
      benchmarkingData: data.benchmarkingData.filter(b => b.id !== id)
    });
  };

  const getMethodLabel = (methodKey: string) => {
    return PRICING_METHODS.find(m => m.value === methodKey)?.label || methodKey;
  };

  const availableMethods = PRICING_METHODS.filter(m => 
    !Object.keys(data.pricingMethods).includes(m.value)
  );

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The economic analysis demonstrates that the pricing of controlled transactions is consistent 
          with the arm's length principle as required by OECD Transfer Pricing Guidelines.
        </AlertDescription>
      </Alert>

      {/* Pricing Methods Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transfer Pricing Methods</CardTitle>
            <Badge variant="outline">
              {Object.keys(data.pricingMethods).length} Method{Object.keys(data.pricingMethods).length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Method */}
          {availableMethods.length > 0 && (
            <div className="flex gap-2">
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a pricing method to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addPricingMethod} disabled={!selectedMethod}>
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </div>
          )}

          {/* Existing Methods */}
          {Object.entries(data.pricingMethods).map(([methodKey, method]) => (
            <Card key={methodKey}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{getMethodLabel(methodKey)}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePricingMethod(methodKey)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Method Rationale *</Label>
                  <Textarea
                    value={method.rationale}
                    onChange={(e) => updatePricingMethod(methodKey, { rationale: e.target.value })}
                    placeholder="Explain why this method is the most appropriate for the transaction..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tested Party</Label>
                    <Input
                      value={method.testedParty}
                      onChange={(e) => updatePricingMethod(methodKey, { testedParty: e.target.value })}
                      placeholder="Entity being tested"
                    />
                  </div>

                  {(methodKey === 'TNMM' || methodKey === 'CPM') && (
                    <div className="space-y-2">
                      <Label>Profit Level Indicator</Label>
                      <Select
                        value={method.profitLevelIndicator || ''}
                        onValueChange={(value) => updatePricingMethod(methodKey, { profitLevelIndicator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select indicator" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFIT_LEVEL_INDICATORS.map((indicator) => (
                            <SelectItem key={indicator} value={indicator}>
                              {indicator}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Arm's Length Range */}
                <div className="space-y-2">
                  <Label>Arm's Length Range</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Minimum</Label>
                      <Input
                        type="number"
                        value={method.armLengthRange.min}
                        onChange={(e) => updatePricingMethod(methodKey, {
                          armLengthRange: { ...method.armLengthRange, min: Number(e.target.value) }
                        })}
                        placeholder="Min"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Maximum</Label>
                      <Input
                        type="number"
                        value={method.armLengthRange.max}
                        onChange={(e) => updatePricingMethod(methodKey, {
                          armLengthRange: { ...method.armLengthRange, max: Number(e.target.value) }
                        })}
                        placeholder="Max"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Median</Label>
                      <Input
                        type="number"
                        value={method.armLengthRange.median}
                        onChange={(e) => updatePricingMethod(methodKey, {
                          armLengthRange: { ...method.armLengthRange, median: Number(e.target.value) }
                        })}
                        placeholder="Median"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">IQR</Label>
                      <Input
                        placeholder="25th-75th"
                        value={`${method.armLengthRange.interquartileRange[0]}-${method.armLengthRange.interquartileRange[1]}`}
                        onChange={(e) => {
                          const [q1, q3] = e.target.value.split('-').map(v => Number(v) || 0);
                          updatePricingMethod(methodKey, {
                            armLengthRange: { ...method.armLengthRange, interquartileRange: [q1, q3] }
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {Object.keys(data.pricingMethods).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No pricing methods selected yet.</p>
              <p className="text-sm">Add at least one method to proceed with the economic analysis.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benchmarking Data Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Benchmarking Data</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {data.benchmarkingData.length} Comparable{data.benchmarkingData.length !== 1 ? 's' : ''}
              </Badge>
              <Button onClick={() => setShowBenchmarkForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Comparable
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.benchmarkingData.map((benchmark) => (
            <Card key={benchmark.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{benchmark.comparableName || 'New Comparable'}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      benchmark.reliability === 'high' ? 'default' :
                      benchmark.reliability === 'medium' ? 'secondary' : 'outline'
                    }>
                      {benchmark.reliability} reliability
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBenchmark(benchmark.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input
                      value={benchmark.comparableName}
                      onChange={(e) => updateBenchmark(benchmark.id, { comparableName: e.target.value })}
                      placeholder="Comparable company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Source *</Label>
                    <Input
                      value={benchmark.source}
                      onChange={(e) => updateBenchmark(benchmark.id, { source: e.target.value })}
                      placeholder="e.g., Amadeus, Orbis, public filings"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      value={benchmark.industry}
                      onChange={(e) => updateBenchmark(benchmark.id, { industry: e.target.value })}
                      placeholder="Industry classification"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Geography</Label>
                    <Input
                      value={benchmark.geography}
                      onChange={(e) => updateBenchmark(benchmark.id, { geography: e.target.value })}
                      placeholder="Geographic market"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reliability</Label>
                    <Select
                      value={benchmark.reliability}
                      onValueChange={(value: any) => updateBenchmark(benchmark.id, { reliability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {benchmark.rejectionReason && (
                  <div className="space-y-2">
                    <Label>Rejection Reason</Label>
                    <Textarea
                      value={benchmark.rejectionReason}
                      onChange={(e) => updateBenchmark(benchmark.id, { rejectionReason: e.target.value })}
                      placeholder="Reason for rejecting this comparable..."
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {showBenchmarkForm && (
            <Card>
              <CardContent className="p-6 text-center">
                <Button onClick={addBenchmark}>
                  Add New Comparable
                </Button>
              </CardContent>
            </Card>
          )}

          {data.benchmarkingData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No benchmarking data added yet.</p>
              <p className="text-sm">Add comparable companies to support your transfer pricing analysis.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OECD Guidelines Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>OECD Guidelines:</strong> The selection and application of transfer pricing methods should 
          follow the hierarchy outlined in the OECD Transfer Pricing Guidelines. Traditional transaction methods 
          (CUP, Cost Plus, Resale Price) are generally preferred when they can be reliably applied.
        </AlertDescription>
      </Alert>
    </div>
  );
}
