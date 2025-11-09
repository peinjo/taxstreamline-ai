import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, TrendingUp, Database, FileSpreadsheet, Info } from 'lucide-react';
import { BenchmarkUpload } from './BenchmarkUpload';
import { BenchmarkSearch } from './BenchmarkSearch';
import { StatisticalAnalysis } from './StatisticalAnalysis';
import { TPBenchmark } from '@/types/transfer-pricing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/logger';

export function BenchmarkingDashboard() {
  const [benchmarks, setBenchmarks] = useState<TPBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const fetchBenchmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('tp_benchmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData: TPBenchmark[] = (data || []).map(item => ({
        ...item,
        financial_data: item.financial_data as Record<string, any>,
        search_criteria: item.search_criteria as Record<string, any>
      }));

      setBenchmarks(typedData);
    } catch (error) {
      logger.error('Error fetching benchmarks', error as Error, { component: 'BenchmarkingDashboard' });
      toast.error('Failed to load benchmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleBenchmarkAdded = () => {
    fetchBenchmarks();
    toast.success('Benchmark data added successfully');
  };

  const handleBenchmarkDeleted = (id: string) => {
    setBenchmarks(prev => prev.filter(b => b.id !== id));
    toast.success('Benchmark deleted');
  };

  const exportToExcel = () => {
    const exportData = benchmarks.map(b => ({
      Name: b.comparable_name,
      Country: b.country,
      Industry: b.industry || 'N/A',
      'Reliability Score': b.reliability_score || 0,
      'Created Date': new Date(b.created_at || '').toLocaleDateString()
    }));
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(exportData[0]).join(",") + "\n"
      + exportData.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "benchmark_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Benchmark data exported to CSV');
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReliabilityBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
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
          <h2 className="text-2xl font-bold">Benchmarking Analysis</h2>
          <p className="text-muted-foreground">
            Search, analyze, and manage comparable company data for transfer pricing studies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Comparables</p>
                <p className="text-2xl font-bold">{benchmarks.length}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Reliability</p>
                <p className="text-2xl font-bold text-green-600">
                  {benchmarks.filter(b => (b.reliability_score || 0) >= 80).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Countries</p>
                <p className="text-2xl font-bold">
                  {new Set(benchmarks.map(b => b.country)).size}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                🌍
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industries</p>
                <p className="text-2xl font-bold">
                  {new Set(benchmarks.map(b => b.industry).filter(Boolean)).size}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                🏭
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OECD Guidelines Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>OECD Guidelines:</strong> Benchmarking studies should use the most reliable comparable data available. 
          Reliability depends on the degree of comparability between the controlled and uncontrolled transactions, 
          the completeness and accuracy of the data, and the assumptions required to be made.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search & Filter</TabsTrigger>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
          <TabsTrigger value="analysis">Statistical Analysis</TabsTrigger>
          <TabsTrigger value="results">Results & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <BenchmarkSearch 
            benchmarks={benchmarks}
            onBenchmarkDeleted={handleBenchmarkDeleted}
          />
        </TabsContent>

        <TabsContent value="upload">
          <BenchmarkUpload onBenchmarkAdded={handleBenchmarkAdded} />
        </TabsContent>

        <TabsContent value="analysis">
          <StatisticalAnalysis benchmarks={benchmarks} />
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Benchmarking Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benchmarks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No benchmark data available yet.</p>
                    <p className="text-sm">Upload or search for comparable companies to begin analysis.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {benchmarks.map((benchmark) => (
                      <div key={benchmark.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{benchmark.comparable_name}</h4>
                            <Badge variant={getReliabilityBadge(benchmark.reliability_score || 0)}>
                              {benchmark.reliability_score || 0}% reliability
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{benchmark.country}</span>
                            {benchmark.industry && <span>{benchmark.industry}</span>}
                            <span>{new Date(benchmark.created_at || '').toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}