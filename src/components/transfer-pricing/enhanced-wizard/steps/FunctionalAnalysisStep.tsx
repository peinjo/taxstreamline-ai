import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Info } from 'lucide-react';
import type { FunctionalAnalysis, ValidationResult } from '../../types/wizard-types';

const FUNCTION_SIGNIFICANCE = [
  { value: 'high', label: 'High - Key operational functions' },
  { value: 'medium', label: 'Medium - Supporting functions' },
  { value: 'low', label: 'Low - Routine functions' }
];

const ASSET_TYPES = [
  { value: 'tangible', label: 'Tangible Assets' },
  { value: 'intangible', label: 'Intangible Assets' },
  { value: 'financial', label: 'Financial Assets' }
];

const RISK_TYPES = [
  { value: 'market', label: 'Market Risk' },
  { value: 'credit', label: 'Credit Risk' },
  { value: 'operational', label: 'Operational Risk' },
  { value: 'regulatory', label: 'Regulatory Risk' },
  { value: 'other', label: 'Other Risk' }
];

const LIKELIHOOD_IMPACT = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

interface FunctionalAnalysisStepProps {
  data: FunctionalAnalysis;
  onChange: (data: Partial<FunctionalAnalysis>) => void;
  validation: ValidationResult;
}

export function FunctionalAnalysisStep({ data, onChange, validation }: FunctionalAnalysisStepProps) {
  const [activeTab, setActiveTab] = useState<'functions' | 'assets' | 'risks'>('functions');

  const addFunction = () => {
    const newFunction = {
      id: `func_${Date.now()}`,
      description: '',
      significance: 'medium' as const,
      relatedTransactions: []
    };
    onChange({ functions: [...data.functions, newFunction] });
  };

  const updateFunction = (id: string, updates: any) => {
    const updated = data.functions.map(f => f.id === id ? { ...f, ...updates } : f);
    onChange({ functions: updated });
  };

  const removeFunction = (id: string) => {
    onChange({ functions: data.functions.filter(f => f.id !== id) });
  };

  const addAsset = () => {
    const newAsset = {
      id: `asset_${Date.now()}`,
      type: 'tangible' as const,
      description: '',
      value: 0,
      currency: 'USD',
      significance: 'medium' as const
    };
    onChange({ assets: [...data.assets, newAsset] });
  };

  const updateAsset = (id: string, updates: any) => {
    const updated = data.assets.map(a => a.id === id ? { ...a, ...updates } : a);
    onChange({ assets: updated });
  };

  const removeAsset = (id: string) => {
    onChange({ assets: data.assets.filter(a => a.id !== id) });
  };

  const addRisk = () => {
    const newRisk = {
      id: `risk_${Date.now()}`,
      type: 'market' as const,
      description: '',
      likelihood: 'medium' as const,
      impact: 'medium' as const,
      mitigation: ''
    };
    onChange({ risks: [...data.risks, newRisk] });
  };

  const updateRisk = (id: string, updates: any) => {
    const updated = data.risks.map(r => r.id === id ? { ...r, ...updates } : r);
    onChange({ risks: updated });
  };

  const removeRisk = (id: string) => {
    onChange({ risks: data.risks.filter(r => r.id !== id) });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The functional analysis is a key component of OECD transfer pricing documentation. 
          It identifies and analyzes the economically significant functions performed, assets used, 
          and risks assumed by each party to the controlled transactions.
        </AlertDescription>
      </Alert>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'functions', label: 'Functions', count: data.functions.length },
          { id: 'assets', label: 'Assets', count: data.assets.length },
          { id: 'risks', label: 'Risks', count: data.risks.length }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
            <Badge variant="secondary" className="ml-2">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Functions Tab */}
      {activeTab === 'functions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Functions Performed</h3>
            <Button onClick={addFunction}>
              <Plus className="h-4 w-4 mr-2" />
              Add Function
            </Button>
          </div>

          {data.functions.map((func, index) => (
            <Card key={func.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Function {index + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      func.significance === 'high' ? 'default' : 
                      func.significance === 'medium' ? 'secondary' : 'outline'
                    }>
                      {func.significance} significance
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFunction(func.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Function Description *</Label>
                  <Textarea
                    value={func.description}
                    onChange={(e) => updateFunction(func.id, { description: e.target.value })}
                    placeholder="Describe the function in detail, including decision-making authority and value creation..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Significance Level *</Label>
                  <Select
                    value={func.significance}
                    onValueChange={(value) => updateFunction(func.id, { significance: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNCTION_SIGNIFICANCE.map((sig) => (
                        <SelectItem key={sig.value} value={sig.value}>
                          {sig.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}

          {data.functions.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No functions added yet. Click "Add Function" to start documenting the functional analysis.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Assets Used</h3>
            <Button onClick={addAsset}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>

          {data.assets.map((asset, index) => (
            <Card key={asset.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Asset {index + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {asset.currency} {asset.value.toLocaleString()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAsset(asset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Asset Type *</Label>
                    <Select
                      value={asset.type}
                      onValueChange={(value: any) => updateAsset(asset.id, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Significance *</Label>
                    <Select
                      value={asset.significance}
                      onValueChange={(value: any) => updateAsset(asset.id, { significance: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FUNCTION_SIGNIFICANCE.map((sig) => (
                          <SelectItem key={sig.value} value={sig.value}>
                            {sig.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={asset.value}
                      onChange={(e) => updateAsset(asset.id, { value: Number(e.target.value) })}
                      placeholder="Asset value"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      value={asset.currency}
                      onChange={(e) => updateAsset(asset.id, { currency: e.target.value })}
                      placeholder="Currency"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Asset Description *</Label>
                  <Textarea
                    value={asset.description}
                    onChange={(e) => updateAsset(asset.id, { description: e.target.value })}
                    placeholder="Describe the asset and its role in value creation..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {data.assets.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No assets added yet. Click "Add Asset" to document key assets used in the controlled transactions.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Risks Tab */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Risks Assumed</h3>
            <Button onClick={addRisk}>
              <Plus className="h-4 w-4 mr-2" />
              Add Risk
            </Button>
          </div>

          {data.risks.map((risk, index) => (
            <Card key={risk.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Risk {index + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      risk.likelihood === 'high' || risk.impact === 'high' ? 'destructive' :
                      risk.likelihood === 'medium' || risk.impact === 'medium' ? 'default' : 'secondary'
                    }>
                      {risk.likelihood} likelihood, {risk.impact} impact
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRisk(risk.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Risk Type *</Label>
                    <Select
                      value={risk.type}
                      onValueChange={(value: any) => updateRisk(risk.id, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RISK_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Likelihood *</Label>
                    <Select
                      value={risk.likelihood}
                      onValueChange={(value: any) => updateRisk(risk.id, { likelihood: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIKELIHOOD_IMPACT.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Impact *</Label>
                    <Select
                      value={risk.impact}
                      onValueChange={(value: any) => updateRisk(risk.id, { impact: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIKELIHOOD_IMPACT.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Risk Description *</Label>
                  <Textarea
                    value={risk.description}
                    onChange={(e) => updateRisk(risk.id, { description: e.target.value })}
                    placeholder="Describe the risk and how it affects the controlled transactions..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Risk Mitigation</Label>
                  <Textarea
                    value={risk.mitigation}
                    onChange={(e) => updateRisk(risk.id, { mitigation: e.target.value })}
                    placeholder="Describe measures taken to mitigate this risk..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {data.risks.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No risks added yet. Click "Add Risk" to document key risks assumed in the controlled transactions.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}