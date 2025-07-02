import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { EntityDetails, ValidationResult } from '../../types/wizard-types';

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'HKD'
];

const JURISDICTIONS = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 
  'Netherlands', 'Canada', 'Australia', 'Japan', 'Singapore', 'Hong Kong',
  'Switzerland', 'Ireland', 'Luxembourg', 'Belgium', 'Sweden', 'Norway'
];

interface EntityDetailsStepProps {
  data: EntityDetails;
  onChange: (data: Partial<EntityDetails>) => void;
  validation: ValidationResult;
}

export function EntityDetailsStep({ data, onChange, validation }: EntityDetailsStepProps) {
  const handleInputChange = (field: keyof EntityDetails, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This information will be used to generate OECD-compliant transfer pricing documentation. 
          Ensure all details are accurate and complete for regulatory compliance.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Entity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Entity Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={data.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter full legal company name"
                className={validation.errors.some(e => e.includes('Company name')) ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax Identification Number *</Label>
              <Input
                id="taxId"
                value={data.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="e.g., EIN, VAT number, or local tax ID"
                className={validation.errors.some(e => e.includes('Tax ID')) ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Tax Jurisdiction *</Label>
              <Select 
                value={data.jurisdiction} 
                onValueChange={(value) => handleInputChange('jurisdiction', value)}
              >
                <SelectTrigger className={validation.errors.some(e => e.includes('jurisdiction')) ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select primary tax jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  {JURISDICTIONS.map((jurisdiction) => (
                    <SelectItem key={jurisdiction} value={jurisdiction}>
                      {jurisdiction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscalYearEnd">Fiscal Year End *</Label>
              <Input
                id="fiscalYearEnd"
                type="date"
                value={data.fiscalYearEnd}
                onChange={(e) => handleInputChange('fiscalYearEnd', e.target.value)}
                className={validation.errors.some(e => e.includes('fiscalYearEnd')) ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportingCurrency">Reporting Currency</Label>
              <Select 
                value={data.reportingCurrency} 
                onValueChange={(value) => handleInputChange('reportingCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reporting currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Business & Structure Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business & Structure Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessDescription">Business Description *</Label>
              <Textarea
                id="businessDescription"
                value={data.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Describe the primary business activities, industry sector, and main revenue sources..."
                rows={4}
                className={validation.errors.some(e => e.includes('Business description')) ? 'border-red-500' : ''}
              />
              <p className="text-sm text-muted-foreground">
                Minimum 20 characters for OECD compliance
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ultimateParent">Ultimate Parent Entity</Label>
              <Input
                id="ultimateParent"
                value={data.ultimateParent}
                onChange={(e) => handleInputChange('ultimateParent', e.target.value)}
                placeholder="Name of ultimate parent company (if applicable)"
              />
              <p className="text-sm text-muted-foreground">
                Required for Country-by-Country Reporting
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationalStructure">Organizational Structure</Label>
              <Textarea
                id="organizationalStructure"
                value={data.organizationalStructure}
                onChange={(e) => handleInputChange('organizationalStructure', e.target.value)}
                placeholder="Describe the corporate structure, subsidiaries, and related entities..."
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Include ownership percentages and key relationships
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OECD Compliance Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">OECD BEPS Action 13 Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Master File Requirements:</strong> Required for multinational enterprises with 
              consolidated group revenue of €750 million or more in the immediately preceding fiscal year.
              <br />
              <strong>Local File Requirements:</strong> Required when controlled transactions exceed 
              the thresholds set by local legislation (typically €1-50 million depending on jurisdiction).
              <br />
              <strong>Country-by-Country Reporting:</strong> Required for ultimate parent entities of 
              multinational groups with consolidated revenue of €750 million or more.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}