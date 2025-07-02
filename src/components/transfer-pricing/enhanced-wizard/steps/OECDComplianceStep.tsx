import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import type { OECDCompliance, EntityDetails, ValidationResult } from '../../types/wizard-types';

const JURISDICTIONS_WITH_REQUIREMENTS = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 
  'Netherlands', 'Canada', 'Australia', 'Japan', 'Singapore', 'Hong Kong',
  'Switzerland', 'Ireland', 'Luxembourg', 'Belgium', 'Sweden', 'Norway'
];

interface OECDComplianceStepProps {
  data: OECDCompliance;
  entityData: EntityDetails;
  onChange: (data: Partial<OECDCompliance>) => void;
  validation: ValidationResult;
}

export function OECDComplianceStep({ data, entityData, onChange, validation }: OECDComplianceStepProps) {
  
  const addJurisdictionRequirement = () => {
    const newRequirement = {
      jurisdiction: '',
      requirement: '',
      deadline: '',
      status: 'pending' as const,
      documentation: []
    };

    onChange({
      jurisdictionSpecificRequirements: [...data.jurisdictionSpecificRequirements, newRequirement]
    });
  };

  const updateRequirement = (index: number, updates: any) => {
    const updated = data.jurisdictionSpecificRequirements.map((req, i) => 
      i === index ? { ...req, ...updates } : req
    );
    onChange({ jurisdictionSpecificRequirements: updated });
  };

  const removeRequirement = (index: number) => {
    onChange({
      jurisdictionSpecificRequirements: data.jurisdictionSpecificRequirements.filter((_, i) => i !== index)
    });
  };

  const getComplianceScore = (): number => {
    let score = 0;
    let totalChecks = 4; // Base checks

    // Master File
    if (data.masterFileRequired) score += 1;
    
    // Local File  
    if (data.localFileRequired) score += 1;

    // CbCR
    if (data.cbcrRequired) score += 1;

    // Jurisdiction requirements
    const completedRequirements = data.jurisdictionSpecificRequirements.filter(req => 
      req.status === 'completed'
    ).length;
    
    if (data.jurisdictionSpecificRequirements.length > 0) {
      score += (completedRequirements / data.jurisdictionSpecificRequirements.length);
      totalChecks += 1;
    }

    return Math.round((score / totalChecks) * 100);
  };

  const getRecommendations = (): string[] => {
    const recommendations: string[] = [];

    // Based on entity data, provide recommendations
    if (entityData.ultimateParent && !data.cbcrRequired) {
      recommendations.push('Consider Country-by-Country Reporting requirements for multinational groups');
    }

    if (!data.masterFileRequired && !data.localFileRequired) {
      recommendations.push('Review local filing requirements in your operating jurisdictions');
    }

    if (data.jurisdictionSpecificRequirements.length === 0) {
      recommendations.push('Add jurisdiction-specific requirements for complete compliance tracking');
    }

    const overdueRequirements = data.jurisdictionSpecificRequirements.filter(req => 
      req.status === 'pending' && new Date(req.deadline) < new Date()
    );

    if (overdueRequirements.length > 0) {
      recommendations.push(`${overdueRequirements.length} requirement(s) are overdue - take immediate action`);
    }

    return recommendations;
  };

  const complianceScore = getComplianceScore();
  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure OECD BEPS Action 13 compliance requirements based on your entity's characteristics 
          and operating jurisdictions. This will help ensure all documentation meets regulatory standards.
        </AlertDescription>
      </Alert>

      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>OECD Compliance Overview</span>
            <Badge variant={complianceScore >= 80 ? 'default' : complianceScore >= 60 ? 'secondary' : 'destructive'}>
              {complianceScore}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {data.masterFileRequired ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                )}
              </div>
              <div className="font-medium">Master File</div>
              <div className="text-sm text-muted-foreground">
                {data.masterFileRequired ? 'Required' : 'Not Required'}
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {data.localFileRequired ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                )}
              </div>
              <div className="font-medium">Local File</div>
              <div className="text-sm text-muted-foreground">
                {data.localFileRequired ? 'Required' : 'Not Required'}
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {data.cbcrRequired ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                )}
              </div>
              <div className="font-medium">CbCR</div>
              <div className="text-sm text-muted-foreground">
                {data.cbcrRequired ? 'Required' : 'Not Required'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core OECD Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Core OECD BEPS Action 13 Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master File */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="font-medium">Master File</div>
              <div className="text-sm text-muted-foreground">
                Required for multinational enterprises with consolidated group revenue ≥ €750 million
              </div>
            </div>
            <Switch
              checked={data.masterFileRequired}
              onCheckedChange={(checked) => onChange({ masterFileRequired: checked })}
            />
          </div>

          {/* Local File */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="font-medium">Local File</div>
              <div className="text-sm text-muted-foreground">
                Required when controlled transactions exceed local thresholds (typically €1-50 million)
              </div>
            </div>
            <Switch
              checked={data.localFileRequired}
              onCheckedChange={(checked) => onChange({ localFileRequired: checked })}
            />
          </div>

          {/* Country-by-Country Reporting */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="font-medium">Country-by-Country Reporting (CbCR)</div>
              <div className="text-sm text-muted-foreground">
                Required for ultimate parent entities with consolidated revenue ≥ €750 million
              </div>
            </div>
            <Switch
              checked={data.cbcrRequired}
              onCheckedChange={(checked) => onChange({ cbcrRequired: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Jurisdiction-Specific Requirements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Jurisdiction-Specific Requirements</CardTitle>
            <Button onClick={addJurisdictionRequirement}>
              <Plus className="h-4 w-4 mr-2" />
              Add Requirement
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.jurisdictionSpecificRequirements.map((requirement, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {requirement.jurisdiction || `Requirement ${index + 1}`}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      requirement.status === 'completed' ? 'default' :
                      requirement.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {requirement.status.replace('_', ' ')}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jurisdiction *</Label>
                    <Input
                      value={requirement.jurisdiction}
                      onChange={(e) => updateRequirement(index, { jurisdiction: e.target.value })}
                      placeholder="Select jurisdiction"
                      list={`jurisdictions-${index}`}
                    />
                    <datalist id={`jurisdictions-${index}`}>
                      {JURISDICTIONS_WITH_REQUIREMENTS.map((jurisdiction) => (
                        <option key={jurisdiction} value={jurisdiction} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input
                      type="date"
                      value={requirement.deadline}
                      onChange={(e) => updateRequirement(index, { deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Requirement Description *</Label>
                  <Textarea
                    value={requirement.requirement}
                    onChange={(e) => updateRequirement(index, { requirement: e.target.value })}
                    placeholder="Describe the specific transfer pricing requirement for this jurisdiction..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-2">
                    {['pending', 'in_progress', 'completed'].map((status) => (
                      <Button
                        key={status}
                        variant={requirement.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateRequirement(index, { status })}
                      >
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {data.jurisdictionSpecificRequirements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No jurisdiction-specific requirements added yet.</p>
              <p className="text-sm">Add requirements for each jurisdiction where you operate.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Recommendations:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm">{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* OECD Resources */}
      <Card>
        <CardHeader>
          <CardTitle>OECD Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>OECD Transfer Pricing Guidelines:</strong> Comprehensive guidance on the application of transfer pricing rules</p>
            <p><strong>BEPS Action 13:</strong> Guidance on transfer pricing documentation and country-by-country reporting</p>
            <p><strong>Master File Template:</strong> Standard template for master file documentation</p>
            <p><strong>Local File Template:</strong> Standard template for local file documentation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}