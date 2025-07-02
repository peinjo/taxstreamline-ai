import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileSpreadsheet, DollarSign, TrendingUp, BarChart3, Info } from 'lucide-react';
import { FinancialDataUpload } from './FinancialDataUpload';
import { CurrencyConverter } from './CurrencyConverter';
import { DataValidation } from './DataValidation';
import { AutoMapping } from './AutoMapping';

interface FinancialDataIntegrationProps {
  entityId?: string;
}

interface FinancialDataSummary {
  totalEntities: number;
  totalTransactions: number;
  currencies: string[];
  lastUpdated: string;
  dataQuality: number;
  missingData: string[];
}

export function FinancialDataIntegration({ entityId }: FinancialDataIntegrationProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [financialSummary] = useState<FinancialDataSummary>({
    totalEntities: 5,
    totalTransactions: 12,
    currencies: ['USD', 'EUR', 'GBP'],
    lastUpdated: '2024-01-15',
    dataQuality: 85,
    missingData: ['Q4 2023 financials for Entity B', 'Intangible asset valuations']
  });

  const exportFinancialData = () => {
    // TODO: Implement export functionality
    console.log('Exporting financial data...');
  };

  const downloadTemplate = () => {
    // TODO: Implement template download
    console.log('Downloading template...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Data Integration</h2>
          <p className="text-muted-foreground">
            Upload, validate, and integrate financial statement data for transfer pricing analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={exportFinancialData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entities</p>
                <p className="text-2xl font-bold">{financialSummary.totalEntities}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{financialSummary.totalTransactions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currencies</p>
                <p className="text-2xl font-bold">{financialSummary.currencies.length}</p>
                <div className="flex gap-1 mt-1">
                  {financialSummary.currencies.map(currency => (
                    <Badge key={currency} variant="outline" className="text-xs">
                      {currency}
                    </Badge>
                  ))}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Quality</p>
                <p className="text-2xl font-bold text-green-600">{financialSummary.dataQuality}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                ✓
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Alerts */}
      {financialSummary.missingData.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Missing Data:</strong> {financialSummary.missingData.length} item(s) need attention for complete analysis.
            <ul className="mt-2 list-disc list-inside text-sm">
              {financialSummary.missingData.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="mapping">Auto-Mapping</TabsTrigger>
          <TabsTrigger value="currency">Currency Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <FinancialDataUpload entityId={entityId} />
        </TabsContent>

        <TabsContent value="validation">
          <DataValidation />
        </TabsContent>

        <TabsContent value="mapping">
          <AutoMapping />
        </TabsContent>

        <TabsContent value="currency">
          <CurrencyConverter />
        </TabsContent>
      </Tabs>

      {/* Integration Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Data Integration Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Required Financial Data</h4>
              <ul className="text-sm space-y-1">
                <li>• Income statements (P&L)</li>
                <li>• Balance sheets</li>
                <li>• Cash flow statements</li>
                <li>• Trial balances</li>
                <li>• Management accounts</li>
                <li>• Segment reporting</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Best Practices</h4>
              <ul className="text-sm space-y-1">
                <li>• Use consistent accounting standards</li>
                <li>• Maintain original currency data</li>
                <li>• Include comparable periods</li>
                <li>• Document adjustments made</li>
                <li>• Validate data completeness</li>
                <li>• Regular data updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}