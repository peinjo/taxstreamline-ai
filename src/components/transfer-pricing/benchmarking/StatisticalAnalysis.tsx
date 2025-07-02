import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calculator, AlertTriangle, Info } from 'lucide-react';
import { TPBenchmark } from '@/types/transfer-pricing';

interface StatisticalAnalysisProps {
  benchmarks: TPBenchmark[];
}

interface StatisticalResults {
  metric: string;
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  standardDeviation: number;
  armLengthRange: {
    min: number;
    max: number;
    median: number;
  };
}

const FINANCIAL_METRICS = [
  { key: 'roa', label: 'Return on Assets (%)', format: 'percentage' },
  { key: 'ros', label: 'Return on Sales (%)', format: 'percentage' },
  { key: 'gross_margin', label: 'Gross Margin (%)', format: 'percentage' },
  { key: 'operating_margin', label: 'Operating Margin (%)', format: 'percentage' },
  { key: 'berry_ratio', label: 'Berry Ratio', format: 'ratio' }
];

export function StatisticalAnalysis({ benchmarks }: StatisticalAnalysisProps) {
  const [selectedMetric, setSelectedMetric] = useState('roa');

  const calculateStatistics = (values: number[]): StatisticalResults | null => {
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const median = n % 2 === 0 
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
      : sorted[Math.floor(n / 2)];
    
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);

    // OECD-compliant arm's length range (interquartile range)
    const armLengthRange = {
      min: q1,
      max: q3,
      median: median
    };

    return {
      metric: selectedMetric,
      count: n,
      mean,
      median,
      min: sorted[0],
      max: sorted[n - 1],
      q1,
      q3,
      iqr: q3 - q1,
      standardDeviation,
      armLengthRange
    };
  };

  const statistics = useMemo(() => {
    const values = benchmarks
      .map(b => b.financial_data?.[selectedMetric])
      .filter((val): val is number => typeof val === 'number' && !isNaN(val));
    
    return calculateStatistics(values);
  }, [benchmarks, selectedMetric]);

  const chartData = useMemo(() => {
    if (!statistics) return [];

    const values = benchmarks
      .map(b => b.financial_data?.[selectedMetric])
      .filter((val): val is number => typeof val === 'number' && !isNaN(val));

    // Create histogram bins
    const bins = 10;
    const binSize = (statistics.max - statistics.min) / bins;
    const histogram = Array.from({ length: bins }, (_, i) => ({
      range: `${(statistics.min + i * binSize).toFixed(1)}-${(statistics.min + (i + 1) * binSize).toFixed(1)}`,
      count: 0,
      midpoint: statistics.min + (i + 0.5) * binSize
    }));

    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - statistics.min) / binSize), bins - 1);
      histogram[binIndex].count++;
    });

    return histogram;
  }, [benchmarks, selectedMetric, statistics]);

  const getMetricFormat = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'ratio':
        return value.toFixed(2);
      default:
        return value.toFixed(2);
    }
  };

  const selectedMetricInfo = FINANCIAL_METRICS.find(m => m.key === selectedMetric);

  if (benchmarks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">No benchmark data available for analysis.</p>
          <p className="text-sm text-muted-foreground">Upload comparable company data to perform statistical analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FINANCIAL_METRICS.map((metric) => (
                      <SelectItem key={metric.key} value={metric.key}>
                        {metric.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline">
                {statistics?.count || 0} comparables
              </Badge>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Statistical analysis follows OECD Transfer Pricing Guidelines. The interquartile range (Q1-Q3) 
                is typically used as the arm's length range for transfer pricing purposes.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {statistics ? (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Sample Size</p>
                  <p className="text-2xl font-bold">{statistics.count}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Median</p>
                  <p className="text-2xl font-bold">
                    {getMetricFormat(statistics.median, selectedMetricInfo?.format || '')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Interquartile Range</p>
                  <p className="text-2xl font-bold">
                    {getMetricFormat(statistics.iqr, selectedMetricInfo?.format || '')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Standard Deviation</p>
                  <p className="text-2xl font-bold">
                    {getMetricFormat(statistics.standardDeviation, selectedMetricInfo?.format || '')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Descriptive Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Count:</span>
                      <span className="font-medium">{statistics.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mean:</span>
                      <span className="font-medium">
                        {getMetricFormat(statistics.mean, selectedMetricInfo?.format || '')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Median:</span>
                      <span className="font-medium">
                        {getMetricFormat(statistics.median, selectedMetricInfo?.format || '')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum:</span>
                      <span className="font-medium">
                        {getMetricFormat(statistics.min, selectedMetricInfo?.format || '')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maximum:</span>
                      <span className="font-medium">
                        {getMetricFormat(statistics.max, selectedMetricInfo?.format || '')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Arm's Length Range (OECD Guidelines)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Q1 (25th percentile):</span>
                      <span className="font-medium">
                        {getMetricFormat(statistics.q1, selectedMetricInfo?.format || '')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q3 (75th percentile):</span>
                      <span className="font-medium">
                        {getMetricFormat(statistics.q3, selectedMetricInfo?.format || '')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>IQR (Q3 - Q1):</span>
                      <span className="font-medium">
                        {getMetricFormat(statistics.iqr, selectedMetricInfo?.format || '')}
                      </span>
                    </div>
                    <div className="p-3 bg-muted rounded-lg mt-3">
                      <p className="text-sm font-medium">Recommended Arm's Length Range:</p>
                      <p className="text-lg font-bold text-primary">
                        {getMetricFormat(statistics.armLengthRange.min, selectedMetricInfo?.format || '')} - {getMetricFormat(statistics.armLengthRange.max, selectedMetricInfo?.format || '')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="range" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Statistical Validity Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Statistical Validity Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.count < 6 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Sample Size Warning:</strong> With only {statistics.count} comparables, 
                      the statistical analysis may not be reliable. OECD guidelines recommend a minimum 
                      of 6 comparables for robust analysis.
                    </AlertDescription>
                  </Alert>
                )}

                {statistics.standardDeviation / Math.abs(statistics.mean) > 0.5 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>High Variability:</strong> The coefficient of variation is high ({((statistics.standardDeviation / Math.abs(statistics.mean)) * 100).toFixed(1)}%), 
                      indicating significant variability in the data. Consider additional comparability adjustments.
                    </AlertDescription>
                  </Alert>
                )}

                {statistics.count >= 6 && statistics.standardDeviation / Math.abs(statistics.mean) <= 0.5 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Statistical Quality:</strong> The benchmarking study meets OECD statistical reliability standards 
                      with {statistics.count} comparables and acceptable variability.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No data available for the selected metric.</p>
            <p className="text-sm text-muted-foreground">
              Ensure your comparable companies have financial data for {selectedMetricInfo?.label}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}