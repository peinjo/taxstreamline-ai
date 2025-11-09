import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Upload, FileX, Globe, Building, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/logger';

interface CbCREntity {
  id: string;
  name: string;
  jurisdiction: string;
  tax_id: string;
  revenue: number;
  profit_before_tax: number;
  income_tax_paid: number;
  income_tax_accrued: number;
  stated_capital: number;
  accumulated_earnings: number;
  employees: number;
  tangible_assets: number;
  main_business_activities: string[];
  reportingYear: number;
  currency: string;
}

interface CbCRSummary {
  totalEntities: number;
  totalRevenue: number;
  totalTaxPaid: number;
  jurisdictionCount: number;
  completionRate: number;
  reportingYear: number;
}

export function CountryByCountryReporting() {
  const [entities, setEntities] = useState<CbCREntity[]>([]);
  const [summary, setSummary] = useState<CbCRSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 1);
  const [activeTab, setActiveTab] = useState('collection');

  useEffect(() => {
    fetchCbCRData();
  }, [selectedYear]);

  const fetchCbCRData = async () => {
    try {
      setLoading(true);
      
      // Fetch entities with financial data for CbCR
      const { data: entitiesData, error } = await supabase
        .from('tp_entities')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform data for CbCR format
      const cbcrEntities: CbCREntity[] = (entitiesData || []).map(entity => {
        const financialData = entity.financial_data as any || {};
        return {
          id: entity.id,
          name: entity.name,
          jurisdiction: entity.country_code,
          tax_id: entity.tax_id || '',
          revenue: financialData.revenue || 0,
          profit_before_tax: financialData.profit_before_tax || 0,
          income_tax_paid: financialData.income_tax_paid || 0,
          income_tax_accrued: financialData.income_tax_accrued || 0,
          stated_capital: financialData.stated_capital || 0,
          accumulated_earnings: financialData.accumulated_earnings || 0,
          employees: financialData.employees || 0,
          tangible_assets: financialData.tangible_assets || 0,
          main_business_activities: financialData.main_business_activities || [],
          reportingYear: selectedYear,
          currency: 'USD'
        };
      });

      setEntities(cbcrEntities);

      // Calculate summary
      const totalEntities = cbcrEntities.length;
      const totalRevenue = cbcrEntities.reduce((sum, e) => sum + e.revenue, 0);
      const totalTaxPaid = cbcrEntities.reduce((sum, e) => sum + e.income_tax_paid, 0);
      const jurisdictionCount = new Set(cbcrEntities.map(e => e.jurisdiction)).size;
      
      // Calculate completion rate based on required fields
      const requiredFields = ['revenue', 'profit_before_tax', 'income_tax_paid', 'employees'];
      const completedEntities = cbcrEntities.filter(entity => 
        requiredFields.every(field => {
          const value = entity[field as keyof CbCREntity];
          return typeof value === 'number' && value > 0;
        })
      ).length;
      const completionRate = totalEntities > 0 ? (completedEntities / totalEntities) * 100 : 0;

      setSummary({
        totalEntities,
        totalRevenue,
        totalTaxPaid,
        jurisdictionCount,
        completionRate,
        reportingYear: selectedYear
      });

    } catch (error) {
      logger.error('Error fetching CbCR data', error as Error, { component: 'CountryByCountryReporting', year: selectedYear });
      toast.error('Failed to load Country-by-Country data');
    } finally {
      setLoading(false);
    }
  };

  const exportXML = async () => {
    try {
      const xmlContent = generateOECDXML(entities, summary);
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CbCR_${selectedYear}_${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CbC Report exported in OECD XML format');
    } catch (error) {
      logger.error('Error exporting XML', error as Error, { component: 'CountryByCountryReporting', year: selectedYear });
      toast.error('Failed to export XML file');
    }
  };

  const exportExcel = async () => {
    try {
      // Create CSV content for Excel compatibility
      const headers = [
        'Entity Name', 'Jurisdiction', 'Tax ID', 'Revenue', 'Profit Before Tax',
        'Income Tax Paid', 'Income Tax Accrued', 'Stated Capital', 'Accumulated Earnings',
        'Number of Employees', 'Tangible Assets', 'Main Business Activities'
      ];
      
      const csvContent = [
        headers.join(','),
        ...entities.map(entity => [
          `"${entity.name}"`,
          entity.jurisdiction,
          entity.tax_id,
          entity.revenue,
          entity.profit_before_tax,
          entity.income_tax_paid,
          entity.income_tax_accrued,
          entity.stated_capital,
          entity.accumulated_earnings,
          entity.employees,
          entity.tangible_assets,
          `"${entity.main_business_activities.join('; ')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CbCR_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CbC Report exported to Excel format');
    } catch (error) {
      logger.error('Error exporting Excel', error as Error, { component: 'CountryByCountryReporting', year: selectedYear });
      toast.error('Failed to export Excel file');
    }
  };

  const generateOECDXML = (entities: CbCREntity[], summary: CbCRSummary | null): string => {
    const reportingYear = selectedYear;
    const reportingEntity = 'Your Organization Name'; // This should come from user settings

    return `<?xml version="1.0" encoding="UTF-8"?>
<CBC_OECD version="2.0" xsi:schemaLocation="urn:oecd:ties:cbc:v2 CbcXML_v2.0.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:oecd:ties:cbc:v2">
  <MessageSpec>
    <SendingEntityIN>YOUR_TIN</SendingEntityIN>
    <TransmittingCountry>YOUR_COUNTRY</TransmittingCountry>
    <ReceivingCountry>MULTIPLE</ReceivingCountry>
    <MessageType>CBC</MessageType>
    <Warning>Please update with your specific details</Warning>
    <MessageRefId>CBC_${reportingYear}_${Date.now()}</MessageRefId>
    <ReportingPeriod>${reportingYear}-12-31</ReportingPeriod>
    <Timestamp>${new Date().toISOString()}</Timestamp>
  </MessageSpec>
  <CbcBody>
    <ReportingEntity>
      <Entity>
        <ResCountryCode>YOUR_COUNTRY</ResCountryCode>
        <TIN>${reportingEntity}</TIN>
        <Name>${reportingEntity}</Name>
      </Entity>
      <ReportingPeriod>${reportingYear}-12-31</ReportingPeriod>
    </ReportingEntity>
    ${entities.map(entity => `
    <CbcReports>
      <ResCountryCode>${entity.jurisdiction}</ResCountryCode>
      <Summary>
        <Revenues>${entity.revenue}</Revenues>
        <ProfitLoss>${entity.profit_before_tax}</ProfitLoss>
        <TaxPaid>${entity.income_tax_paid}</TaxPaid>
        <TaxAccrued>${entity.income_tax_accrued}</TaxAccrued>
        <Capital>${entity.stated_capital}</Capital>
        <Earnings>${entity.accumulated_earnings}</Earnings>
        <NbEmployees>${entity.employees}</NbEmployees>
        <Assets>${entity.tangible_assets}</Assets>
      </Summary>
    </CbcReports>`).join('')}
  </CbcBody>
</CBC_OECD>`;
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
          <h2 className="text-2xl font-bold">Country-by-Country Reporting</h2>
          <p className="text-muted-foreground">
            OECD BEPS Action 13 compliant Country-by-Country Report generation
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 - i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={exportXML}>
            <FileX className="h-4 w-4 mr-2" />
            Export OECD XML
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Entities</p>
                  <p className="text-2xl font-bold">{summary.totalEntities}</p>
                </div>
                <Building className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  💰
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tax Paid</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalTaxPaid)}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  🏛️
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jurisdictions</p>
                  <p className="text-2xl font-bold">{summary.jurisdictionCount}</p>
                </div>
                <Globe className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Completion</p>
                <p className={`text-2xl font-bold ${getCompletionColor(summary.completionRate)}`}>
                  {summary.completionRate.toFixed(1)}%
                </p>
                <Progress value={summary.completionRate} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Quality Alert */}
      {summary && summary.completionRate < 90 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Data Quality Warning:</strong> {(100 - summary.completionRate).toFixed(1)}% of entities have incomplete data. 
            Please review and complete missing information before generating the final CbC Report.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collection">Data Collection</TabsTrigger>
          <TabsTrigger value="validation">Validation & Review</TabsTrigger>
          <TabsTrigger value="export">Export & Filing</TabsTrigger>
        </TabsList>

        <TabsContent value="collection">
          <Card>
            <CardHeader>
              <CardTitle>Entity Data Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    The following table shows all entities and their required CbC data. 
                    Complete data collection is required for accurate OECD reporting.
                  </AlertDescription>
                </Alert>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity Name</TableHead>
                        <TableHead>Jurisdiction</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Profit Before Tax</TableHead>
                        <TableHead>Tax Paid</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entities.map(entity => {
                        const requiredFields = [entity.revenue, entity.profit_before_tax, entity.income_tax_paid, entity.employees];
                        const isComplete = requiredFields.every(field => field > 0);
                        
                        return (
                          <TableRow key={entity.id}>
                            <TableCell className="font-medium">{entity.name}</TableCell>
                            <TableCell>{entity.jurisdiction}</TableCell>
                            <TableCell>{formatCurrency(entity.revenue)}</TableCell>
                            <TableCell>{formatCurrency(entity.profit_before_tax)}</TableCell>
                            <TableCell>{formatCurrency(entity.income_tax_paid)}</TableCell>
                            <TableCell>{entity.employees.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={isComplete ? 'default' : 'destructive'}>
                                {isComplete ? 'Complete' : 'Incomplete'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>OECD Compliance Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Required Elements Status</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Entity identification data', status: entities.length > 0 },
                        { name: 'Revenue data', status: entities.some(e => e.revenue > 0) },
                        { name: 'Profit/Loss data', status: entities.some(e => e.profit_before_tax !== 0) },
                        { name: 'Tax information', status: entities.some(e => e.income_tax_paid > 0) },
                        { name: 'Employee count', status: entities.some(e => e.employees > 0) },
                        { name: 'Tangible assets', status: entities.some(e => e.tangible_assets > 0) }
                      ].map(item => (
                        <div key={item.name} className="flex items-center justify-between">
                          <span className="text-sm">{item.name}</span>
                          {item.status ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Jurisdiction Coverage</h4>
                    <div className="space-y-2">
                      {Array.from(new Set(entities.map(e => e.jurisdiction))).map(jurisdiction => {
                        const entitiesInJurisdiction = entities.filter(e => e.jurisdiction === jurisdiction);
                        const totalRevenue = entitiesInJurisdiction.reduce((sum, e) => sum + e.revenue, 0);
                        
                        return (
                          <div key={jurisdiction} className="flex items-center justify-between">
                            <span className="text-sm">{jurisdiction}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">{entitiesInJurisdiction.length} entities</div>
                              <div className="text-xs text-muted-foreground">{formatCurrency(totalRevenue)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <FileX className="h-6 w-6 text-primary" />
                      <div>
                        <h4 className="font-medium">OECD XML Format</h4>
                        <p className="text-sm text-muted-foreground">Official OECD CbC XML schema for tax authority filing</p>
                      </div>
                    </div>
                    <Button onClick={exportXML} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export OECD XML
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Download className="h-6 w-6 text-primary" />
                      <div>
                        <h4 className="font-medium">Excel Format</h4>
                        <p className="text-sm text-muted-foreground">Spreadsheet format for analysis and review</p>
                      </div>
                    </div>
                    <Button onClick={exportExcel} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Filing Requirements:</strong> The OECD XML format is required for official submissions to tax authorities. 
                    Ensure all data is validated before export. The Excel format is provided for internal review and analysis purposes.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}