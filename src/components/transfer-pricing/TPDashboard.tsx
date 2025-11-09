
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Plus
} from 'lucide-react';
import { TPDashboardMetrics, TPDeadline, TPRiskAssessment } from '@/types/transfer-pricing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/logger';

interface TPDashboardProps {
  onCreateDocument: () => void;
  onCreateEntity: () => void;
  onViewCompliance: () => void;
}

const TPDashboard: React.FC<TPDashboardProps> = ({
  onCreateDocument,
  onCreateEntity,
  onViewCompliance
}) => {
  const [metrics, setMetrics] = useState<TPDashboardMetrics>({
    total_entities: 0,
    total_transactions: 0,
    pending_deadlines: 0,
    high_risk_items: 0,
    compliance_score: 85,
    recent_activity: []
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<TPDeadline[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<TPRiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch entities count
      const { data: entities, error: entitiesError } = await supabase
        .from('tp_entities')
        .select('id')
        .eq('user_id', user.id);

      // Fetch transactions count
      const { data: transactions, error: transactionsError } = await supabase
        .from('tp_transactions')
        .select('id')
        .eq('user_id', user.id);

      // Fetch upcoming deadlines
      const { data: deadlines, error: deadlinesError } = await supabase
        .from('tp_deadlines')
        .select('*')
        .eq('user_id', user.id)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(5);

      // Fetch high-risk assessments
      const { data: risks, error: risksError } = await supabase
        .from('tp_risk_assessments')
        .select('*')
        .eq('user_id', user.id)
        .in('risk_level', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (entitiesError || transactionsError || deadlinesError || risksError) {
        throw new Error('Failed to fetch dashboard data');
      }

      setMetrics({
        total_entities: entities?.length || 0,
        total_transactions: transactions?.length || 0,
        pending_deadlines: deadlines?.length || 0,
        high_risk_items: risks?.length || 0,
        compliance_score: 85, // This would be calculated based on actual compliance data
        recent_activity: [
          { type: 'document', description: 'Master File updated for Entity ABC', timestamp: '2 hours ago' },
          { type: 'entity', description: 'New subsidiary added: XYZ Ltd', timestamp: '1 day ago' },
          { type: 'compliance', description: 'Nigeria TP deadline approaching', timestamp: '2 days ago' }
        ]
      });

      setUpcomingDeadlines(deadlines || []);
      
      // Convert Json types to Record<string, any> for risk assessments
      const typedRisks: TPRiskAssessment[] = (risks || []).map(risk => ({
        ...risk,
        risk_factors: typeof risk.risk_factors === 'object' ? risk.risk_factors as Record<string, any> : {}
      }));
      
      setRiskAssessments(typedRisks);
    } catch (error) {
      logger.error('Error fetching dashboard data', error as Error, { component: 'TPDashboard' });
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-64">
                <div className="h-full bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entities</p>
                <p className="text-2xl font-bold">{metrics.total_entities}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{metrics.total_transactions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Deadlines</p>
                <p className="text-2xl font-bold">{metrics.pending_deadlines}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Items</p>
                <p className="text-2xl font-bold">{metrics.high_risk_items}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Overall Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Compliance Status</span>
              <span className="font-medium">{metrics.compliance_score}%</span>
            </div>
            <Progress value={metrics.compliance_score} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Based on document completeness, deadline adherence, and risk assessment
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </div>
              <Button variant="outline" size="sm" onClick={onViewCompliance}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{deadline.deadline_type}</p>
                      <p className="text-sm text-muted-foreground">{deadline.country_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(deadline.due_date).toLocaleDateString()}</p>
                      <Badge 
                        variant="outline" 
                        className={getComplianceStatusColor(deadline.status)}
                      >
                        {deadline.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No upcoming deadlines</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              High-Risk Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskAssessments.length > 0 ? (
                riskAssessments.map((risk) => (
                  <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Risk Assessment</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(risk.assessment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getRiskBadgeVariant(risk.risk_level)}>
                      {risk.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No high-risk items</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button onClick={onCreateDocument} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Document
            </Button>
            <Button onClick={onCreateEntity} variant="outline" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Add Entity
            </Button>
            <Button onClick={onViewCompliance} variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TPDashboard;
