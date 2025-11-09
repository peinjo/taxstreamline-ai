import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Trash2, Eye, BarChart3 } from 'lucide-react';
import { TPBenchmark } from '@/types/transfer-pricing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/logger';

interface BenchmarkSearchProps {
  benchmarks: TPBenchmark[];
  onBenchmarkDeleted: (id: string) => void;
}

interface SearchFilters {
  search: string;
  country: string;
  industry: string;
  minReliability: number;
  maxReliability: number;
}

export function BenchmarkSearch({ benchmarks, onBenchmarkDeleted }: BenchmarkSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    country: '',
    industry: '',
    minReliability: 0,
    maxReliability: 100
  });
  const [selectedBenchmark, setSelectedBenchmark] = useState<TPBenchmark | null>(null);

  const countries = useMemo(() => {
    return Array.from(new Set(benchmarks.map(b => b.country).filter(Boolean))).sort();
  }, [benchmarks]);

  const industries = useMemo(() => {
    return Array.from(new Set(benchmarks.map(b => b.industry).filter(Boolean))).sort();
  }, [benchmarks]);

  const filteredBenchmarks = useMemo(() => {
    return benchmarks.filter(benchmark => {
      const matchesSearch = !filters.search || 
        benchmark.comparable_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (benchmark.industry && benchmark.industry.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesCountry = !filters.country || benchmark.country === filters.country;
      const matchesIndustry = !filters.industry || benchmark.industry === filters.industry;
      
      const reliability = benchmark.reliability_score || 0;
      const matchesReliability = reliability >= filters.minReliability && reliability <= filters.maxReliability;

      return matchesSearch && matchesCountry && matchesIndustry && matchesReliability;
    });
  }, [benchmarks, filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      country: '',
      industry: '',
      minReliability: 0,
      maxReliability: 100
    });
  };

  const deleteBenchmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tp_benchmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onBenchmarkDeleted(id);
    } catch (error) {
      logger.error('Error deleting benchmark', error as Error, { component: 'BenchmarkSearch', benchmarkId: id });
      toast.error('Failed to delete benchmark');
    }
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatFinancialValue = (value: number, type: 'currency' | 'percentage' | 'ratio') => {
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } else if (type === 'percentage') {
      return `${value.toFixed(2)}%`;
    } else {
      return value.toFixed(2);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Comparables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Company name or industry"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={filters.country || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value === 'all' ? '' : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={filters.industry || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value === 'all' ? '' : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-reliability">Min Reliability</Label>
              <Input
                id="min-reliability"
                type="number"
                min="0"
                max="100"
                value={filters.minReliability}
                onChange={(e) => setFilters(prev => ({ ...prev, minReliability: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {filteredBenchmarks.length} of {benchmarks.length} comparables</span>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filteredBenchmarks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No comparables found matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or upload new data.</p>
            </CardContent>
          </Card>
        ) : (
          filteredBenchmarks.map((benchmark) => (
            <Card key={benchmark.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{benchmark.comparable_name}</h3>
                      <Badge className={getReliabilityColor(benchmark.reliability_score || 0)}>
                        {benchmark.reliability_score || 0}% reliability
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        🌍 {benchmark.country}
                      </span>
                      {benchmark.industry && (
                        <span className="flex items-center gap-1">
                          🏭 {benchmark.industry}
                        </span>
                      )}
                      <span>
                        📅 {new Date(benchmark.created_at || '').toLocaleDateString()}
                      </span>
                    </div>

                    {/* Key Financial Metrics */}
                    {benchmark.financial_data && Object.keys(benchmark.financial_data).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {benchmark.financial_data.revenue && (
                          <div>
                            <span className="text-muted-foreground">Revenue: </span>
                            <span className="font-medium">
                              {formatFinancialValue(Number(benchmark.financial_data.revenue), 'currency')}
                            </span>
                          </div>
                        )}
                        {benchmark.financial_data.roa && (
                          <div>
                            <span className="text-muted-foreground">ROA: </span>
                            <span className="font-medium">
                              {formatFinancialValue(Number(benchmark.financial_data.roa), 'percentage')}
                            </span>
                          </div>
                        )}
                        {benchmark.financial_data.ros && (
                          <div>
                            <span className="text-muted-foreground">ROS: </span>
                            <span className="font-medium">
                              {formatFinancialValue(Number(benchmark.financial_data.ros), 'percentage')}
                            </span>
                          </div>
                        )}
                        {benchmark.financial_data.operating_margin && (
                          <div>
                            <span className="text-muted-foreground">Op. Margin: </span>
                            <span className="font-medium">
                              {formatFinancialValue(Number(benchmark.financial_data.operating_margin), 'percentage')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedBenchmark(benchmark)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Comparable Company Details</DialogTitle>
                        </DialogHeader>
                        {selectedBenchmark && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Company Name</Label>
                                <p className="font-medium">{selectedBenchmark.comparable_name}</p>
                              </div>
                              <div>
                                <Label>Country</Label>
                                <p>{selectedBenchmark.country}</p>
                              </div>
                              {selectedBenchmark.industry && (
                                <div>
                                  <Label>Industry</Label>
                                  <p>{selectedBenchmark.industry}</p>
                                </div>
                              )}
                              <div>
                                <Label>Reliability Score</Label>
                                <p>{selectedBenchmark.reliability_score || 0}%</p>
                              </div>
                            </div>
                            
                            {selectedBenchmark.financial_data && (
                              <div>
                                <Label>Financial Data</Label>
                                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                  {Object.entries(selectedBenchmark.financial_data).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                                      <span className="font-medium">
                                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBenchmark(benchmark.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}