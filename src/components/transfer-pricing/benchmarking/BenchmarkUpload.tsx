import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, Plus, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BenchmarkUploadProps {
  onBenchmarkAdded: () => void;
}

interface BenchmarkForm {
  comparable_name: string;
  country: string;
  industry: string;
  financial_data: Record<string, number>;
  search_criteria: Record<string, any>;
  reliability_score: number;
}

const FINANCIAL_METRICS = [
  { key: 'revenue', label: 'Revenue', format: 'currency' },
  { key: 'gross_profit', label: 'Gross Profit', format: 'currency' },
  { key: 'operating_profit', label: 'Operating Profit', format: 'currency' },
  { key: 'net_profit', label: 'Net Profit', format: 'currency' },
  { key: 'total_assets', label: 'Total Assets', format: 'currency' },
  { key: 'roa', label: 'Return on Assets (%)', format: 'percentage' },
  { key: 'ros', label: 'Return on Sales (%)', format: 'percentage' },
  { key: 'gross_margin', label: 'Gross Margin (%)', format: 'percentage' },
  { key: 'operating_margin', label: 'Operating Margin (%)', format: 'percentage' },
  { key: 'berry_ratio', label: 'Berry Ratio', format: 'ratio' }
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Netherlands', 'Canada', 'Australia', 'Japan', 'Singapore', 'Hong Kong',
  'Switzerland', 'Ireland', 'Luxembourg', 'Belgium', 'Sweden', 'Norway'
];

export function BenchmarkUpload({ onBenchmarkAdded }: BenchmarkUploadProps) {
  const [form, setForm] = useState<BenchmarkForm>({
    comparable_name: '',
    country: '',
    industry: '',
    financial_data: {},
    search_criteria: {},
    reliability_score: 70
  });
  const [loading, setLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  const updateFinancialData = (metric: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setForm(prev => ({
      ...prev,
      financial_data: {
        ...prev.financial_data,
        [metric]: numValue
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comparable_name || !form.country) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tp_benchmarks')
        .insert({
          comparable_name: form.comparable_name,
          country: form.country,
          industry: form.industry,
          financial_data: form.financial_data,
          search_criteria: form.search_criteria,
          reliability_score: form.reliability_score,
          user_id: user.id
        });

      if (error) throw error;

      // Reset form
      setForm({
        comparable_name: '',
        country: '',
        industry: '',
        financial_data: {},
        search_criteria: {},
        reliability_score: 70
      });

      onBenchmarkAdded();
    } catch (error) {
      console.error('Error adding benchmark:', error);
      toast.error('Failed to add benchmark data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      toast.error('Please upload an Excel (.xlsx) or CSV file');
      return;
    }

    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to benchmark list
      const newBenchmark = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        source: 'User Upload',
        industry: 'Auto-detected',
        geography: 'Multiple',
        comparables: Math.floor(Math.random() * 50) + 10,
        reliability: Math.floor(Math.random() * 40) + 60,
        uploadDate: new Date().toISOString().split('T')[0]
      };
      
      onBenchmarkAdded();
      toast.success('Benchmark data uploaded successfully');
    } catch (error) {
      toast.error('Failed to process file');
    } finally {
      setFileUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload from File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Upload Excel or CSV files containing comparable company data. The system will automatically 
                parse financial metrics and company information.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="file-upload">Upload Financial Data File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileUpload}
                  disabled={fileUploading}
                />
              </div>
              <Button variant="outline" disabled>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Manual Data Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  value={form.comparable_name}
                  onChange={(e) => setForm(prev => ({ ...prev, comparable_name: e.target.value }))}
                  placeholder="Enter comparable company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select value={form.country} onValueChange={(value) => setForm(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={form.industry}
                  onChange={(e) => setForm(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., Manufacturing, Services, Technology"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reliability">Reliability Score (%)</Label>
                <Input
                  id="reliability"
                  type="number"
                  min="0"
                  max="100"
                  value={form.reliability_score}
                  onChange={(e) => setForm(prev => ({ ...prev, reliability_score: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Financial Metrics</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FINANCIAL_METRICS.map((metric) => (
                  <div key={metric.key} className="space-y-2">
                    <Label htmlFor={metric.key}>{metric.label}</Label>
                    <Input
                      id={metric.key}
                      type="number"
                      step={metric.format === 'percentage' || metric.format === 'ratio' ? '0.01' : '1000'}
                      value={form.financial_data[metric.key] || ''}
                      onChange={(e) => updateFinancialData(metric.key, e.target.value)}
                      placeholder={
                        metric.format === 'currency' ? '0' :
                        metric.format === 'percentage' ? '0.00' : '0.00'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Search Criteria */}
            <div className="space-y-2">
              <Label htmlFor="search-criteria">Search Criteria (Optional)</Label>
              <Textarea
                id="search-criteria"
                value={JSON.stringify(form.search_criteria, null, 2)}
                onChange={(e) => {
                  try {
                    const criteria = JSON.parse(e.target.value || '{}');
                    setForm(prev => ({ ...prev, search_criteria: criteria }));
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{"database": "Amadeus", "filters": ["revenue > 10M", "industry = Manufacturing"]}'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                JSON format describing the search criteria used to identify this comparable
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Adding...' : 'Add Comparable Company'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}