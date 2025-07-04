import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, FileText, Globe, Calendar, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardMetrics {
  totalEntities: number;
  totalTransactions: number;
  totalDocuments: number;
  complianceScore: number;
  riskScore: number;
  upcomingDeadlines: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'document' | 'entity' | 'transaction' | 'compliance';
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

interface ComplianceByJurisdiction {
  jurisdiction: string;
  entities: number;
  compliant: number;
  atRisk: number;
  overdue: number;
  complianceRate: number;
}

interface RiskByCategory {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  entities: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function TPOverviewDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [complianceData, setComplianceData] = useState<ComplianceByJurisdiction[]>([]);
  const [riskData, setRiskData] = useState<RiskByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30' | '90' | '365'>('90');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all relevant data in parallel
      const [entitiesRes, transactionsRes, documentsRes, deadlinesRes, risksRes] = await Promise.all([
        supabase.from('tp_entities').select('*'),
        supabase.from('tp_transactions').select('*'),
        supabase.from('transfer_pricing_documents').select('*'),
        supabase.from('tp_deadlines').select('*').gte('due_date', new Date().toISOString()),
        supabase.from('tp_risk_assessments').select('*')
      ]);

      const entities = entitiesRes.data || [];
      const transactions = transactionsRes.data || [];
      const documents = documentsRes.data || [];
      const deadlines = deadlinesRes.data || [];
      const risks = risksRes.data || [];

      // Calculate metrics
      const totalEntities = entities.length;
      const totalTransactions = transactions.length;
      const totalDocuments = documents.length;
      
      // Calculate compliance score (simplified)
      const completedDocuments = documents.filter(d => d.status === 'published').length;
      const complianceScore = totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0;

      // Calculate average risk score
      const avgRiskScore = risks.length > 0 ? 
        risks.reduce((sum, r) => sum + getRiskScore(r.risk_level), 0) / risks.length : 0;

      // Get upcoming deadlines (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const upcomingDeadlines = deadlines.filter(d => 
        new Date(d.due_date) <= thirtyDaysFromNow
      ).length;

      // Generate recent activity
      const recentActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'document',
          description: 'Master File documentation updated',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'compliance',
          description: 'Upcoming deadline: UK CbC filing',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'warning'
        },
        {
          id: '3',
          type: 'entity',
          description: 'New entity added: German subsidiary',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        }
      ];

      setMetrics({
        totalEntities,
        totalTransactions,
        totalDocuments,
        complianceScore,
        riskScore: avgRiskScore,
        upcomingDeadlines,
        recentActivity
      });

      // Process compliance by jurisdiction
      const jurisdictionMap = new Map<string, { entities: number; compliant: number; atRisk: number; overdue: number }>();
      
      entities.forEach(entity => {
        const jurisdiction = entity.country_code;
        const existing = jurisdictionMap.get(jurisdiction) || { entities: 0, compliant: 0, atRisk: 0, overdue: 0 };
        existing.entities++;
        
        // Simplified compliance calculation based on document status
        const entityDocs = documents.filter(d => d.entity_id === entity.id);
        if (entityDocs.some(d => d.status === 'published')) existing.compliant++;
        else if (entityDocs.some(d => d.status === 'draft')) existing.atRisk++;
        else existing.overdue++;
        
        jurisdictionMap.set(jurisdiction, existing);
      });

      const complianceByJurisdiction: ComplianceByJurisdiction[] = Array.from(jurisdictionMap.entries()).map(([jurisdiction, data]) => ({
        jurisdiction,
        ...data,
        complianceRate: data.entities > 0 ? (data.compliant / data.entities) * 100 : 0
      }));

      setComplianceData(complianceByJurisdiction);

      // Process risk by category
      const riskCategories = ['Documentation', 'Economic', 'Compliance', 'Operational', 'Regulatory'];
      const riskByCategory: RiskByCategory[] = riskCategories.map(category => ({
        category,
        score: Math.floor(Math.random() * 100), // Simplified - would calculate from actual risk data
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
        entities: Math.floor(Math.random() * totalEntities)
      }));

      setRiskData(riskByCategory);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskScore = (riskLevel: string): number => {
    switch (riskLevel) {
      case 'low': return 25;
      case 'medium': return 50;
      case 'high': return 75;
      case 'critical': return 100;
      default: return 50;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const exportDashboard = () => {
    // Generate dashboard summary report
    const reportData = {
      generated: new Date().toISOString(),
      timeRange,
      metrics,
      complianceData,
      riskData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TP_Dashboard_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Dashboard report exported');
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
          <h2 className="text-2xl font-bold">Transfer Pricing Overview</h2>
          <p className="text-muted-foreground">
            Comprehensive dashboard for transfer pricing management and compliance
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportDashboard}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entities</p>
                  <p className="text-2xl font-bold">{metrics.totalEntities}</p>
                </div>
                <Globe className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{metrics.totalTransactions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold">{metrics.totalDocuments}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">{metrics.complianceScore.toFixed(1)}%</p>
                <Progress value={metrics.complianceScore} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                <p className={`text-2xl font-bold ${metrics.riskScore > 70 ? 'text-red-600' : metrics.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {metrics.riskScore.toFixed(0)}
                </p>
                <Progress value={metrics.riskScore} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</p>
                  <p className="text-2xl font-bold text-yellow-600">{metrics.upcomingDeadlines}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance by Jurisdiction */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance by Jurisdiction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complianceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="jurisdiction" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="compliant" stackId="a" fill="#22c55e" name="Compliant" />
                      <Bar dataKey="atRisk" stackId="a" fill="#f59e0b" name="At Risk" />
                      <Bar dataKey="overdue" stackId="a" fill="#ef4444" name="Overdue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        dataKey="score"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ category, score }) => `${category}: ${score}`}
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status by Jurisdiction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.map(jurisdiction => (
                    <div key={jurisdiction.jurisdiction} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{jurisdiction.jurisdiction}</h4>
                        <Badge variant={jurisdiction.complianceRate >= 80 ? 'default' : 
                                      jurisdiction.complianceRate >= 60 ? 'secondary' : 'destructive'}>
                          {jurisdiction.complianceRate.toFixed(1)}% Compliant
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Entities</p>
                          <p className="font-medium">{jurisdiction.entities}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Compliant</p>
                          <p className="font-medium text-green-600">{jurisdiction.compliant}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">At Risk</p>
                          <p className="font-medium text-yellow-600">{jurisdiction.atRisk}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Overdue</p>
                          <p className="font-medium text-red-600">{jurisdiction.overdue}</p>
                        </div>
                      </div>
                      <Progress value={jurisdiction.complianceRate} className="mt-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskData.map(risk => (
                    <div key={risk.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{risk.category}</h4>
                        <p className="text-sm text-muted-foreground">{risk.entities} entities assessed</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{risk.score}/100</p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              {risk.trend === 'up' ? '↗️' : risk.trend === 'down' ? '↘️' : '➡️'} 
                              {risk.trend}
                            </span>
                          </div>
                        </div>
                        <div className="w-24">
                          <Progress value={risk.score} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(activity.status)}
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}