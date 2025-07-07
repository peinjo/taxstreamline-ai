import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Activity, BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsData {
  id: string;
  data_type: string;
  time_period: string;
  metrics: Record<string, any>;
  insights: Record<string, any>;
  created_at: string;
}

interface TrendData {
  month: string;
  avg_risk_level: number;
  entity_count: number;
}

export function AdvancedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('12_months');
  const [selectedMetric, setSelectedMetric] = useState('risk_score');

  useEffect(() => {
    fetchAnalyticsData();
    fetchTrendData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tp_analytics_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setAnalyticsData((data || []).map(item => ({
        ...item,
        metrics: item.metrics as Record<string, any>,
        insights: item.insights as Record<string, any>
      })));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('calculate_risk_trends', {
        p_user_id: user.id,
        p_period: selectedPeriod
      });

      if (error) throw error;

      setTrendData(Array.isArray(data) ? data as TrendData[] : []);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      toast.error('Failed to load trend data');
    }
  };

  const generateOptimizationInsights = () => {
    const insights = [
      {
        type: 'warning',
        title: 'High Risk Entities Detected',
        description: '3 entities show elevated transfer pricing risk scores above 75%',
        recommendation: 'Consider enhanced documentation and benchmarking studies',
        priority: 'high'
      },
      {
        type: 'info',
        title: 'Benchmarking Opportunity',
        description: 'Updated comparable data available for manufacturing transactions',
        recommendation: 'Refresh benchmarking analysis to strengthen positions',
        priority: 'medium'
      },
      {
        type: 'success',
        title: 'Compliance Improvement',
        description: 'Overall risk profile improved by 15% over last quarter',
        recommendation: 'Maintain current documentation standards',
        priority: 'low'
      }
    ];

    return insights;
  };

  const mockBenchmarkData = [
    { method: 'CUP', percentage: 25, count: 12 },
    { method: 'TNMM', percentage: 45, count: 22 },
    { method: 'RPM', percentage: 20, count: 10 },
    { method: 'PSM', percentage: 10, count: 5 }
  ];

  const mockRiskDistribution = [
    { name: 'Low Risk', value: 35, color: '#22c55e' },
    { name: 'Medium Risk', value: 45, color: '#eab308' },
    { name: 'High Risk', value: 20, color: '#ef4444' }
  ];

  const mockPerformanceData = [
    { quarter: 'Q1 2024', entities: 15, compliant: 12, risk_score: 2.1 },
    { quarter: 'Q2 2024', entities: 18, compliant: 16, risk_score: 1.9 },
    { quarter: 'Q3 2024', entities: 22, compliant: 20, risk_score: 1.7 },
    { quarter: 'Q4 2024', entities: 25, compliant: 24, risk_score: 1.5 }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Activity className="h-5 w-5 text-blue-500" />;
      case 'success': return <Target className="h-5 w-5 text-green-500" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Advanced Analytics
          </h2>
          <p className="text-muted-foreground">
            Deep insights and predictive analytics for your transfer pricing data
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6_months">Last 6 Months</SelectItem>
              <SelectItem value="12_months">Last 12 Months</SelectItem>
              <SelectItem value="24_months">Last 24 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold">1.5</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -12% from last month
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold">96%</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +4% from last month
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Entities</p>
                <p className="text-2xl font-bold">25</p>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3 this quarter
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documentation</p>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Needs attention
                </p>
              </div>
              <PieChartIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Risk Trends</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarking</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="risk_score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Entity Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="entities" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={mockRiskDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockRiskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Pricing Methods Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockBenchmarkData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockBenchmarkData.map((method) => (
              <Card key={method.method}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{method.method}</h3>
                    <p className="text-2xl font-bold text-primary">{method.percentage}%</p>
                    <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {generateOptimizationInsights().map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{insight.description}</p>
                      <p className="text-sm font-medium">Recommendation: {insight.recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="compliant" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="entities" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}