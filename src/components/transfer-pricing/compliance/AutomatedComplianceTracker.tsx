import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Calendar, Bell, CheckCircle, AlertTriangle, Clock, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TPDeadline, TPComplianceStatus } from '@/types/transfer-pricing';

interface ComplianceMetrics {
  totalDeadlines: number;
  upcomingDeadlines: number;
  overdueDeadlines: number;
  completedDeadlines: number;
  complianceRate: number;
}

interface JurisdictionSummary {
  country_code: string;
  deadlines: TPDeadline[];
  nextDeadline?: TPDeadline;
  status: 'compliant' | 'at_risk' | 'overdue';
}

export function AutomatedComplianceTracker() {
  const [deadlines, setDeadlines] = useState<TPDeadline[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30' | '90' | '365'>('90');

  useEffect(() => {
    fetchComplianceData();
  }, [selectedTimeframe]);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(selectedTimeframe));

      // Fetch deadlines
      const { data: deadlinesData, error } = await supabase
        .from('tp_deadlines')
        .select('*')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      if (error) throw error;

      const typedDeadlines: TPDeadline[] = deadlinesData || [];
      setDeadlines(typedDeadlines);

      // Calculate metrics
      const totalDeadlines = typedDeadlines.length;
      const now = new Date();
      const upcomingDeadlines = typedDeadlines.filter(d => 
        new Date(d.due_date) > now && d.status === 'pending'
      ).length;
      const overdueDeadlines = typedDeadlines.filter(d => 
        new Date(d.due_date) < now && d.status === 'pending'
      ).length;
      const completedDeadlines = typedDeadlines.filter(d => 
        d.status === 'compliant'
      ).length;
      const complianceRate = totalDeadlines > 0 ? (completedDeadlines / totalDeadlines) * 100 : 100;

      setMetrics({
        totalDeadlines,
        upcomingDeadlines,
        overdueDeadlines,
        completedDeadlines,
        complianceRate
      });

      // Group by jurisdiction
      const jurisdictionMap = new Map<string, TPDeadline[]>();
      typedDeadlines.forEach(deadline => {
        const existing = jurisdictionMap.get(deadline.country_code) || [];
        jurisdictionMap.set(deadline.country_code, [...existing, deadline]);
      });

      const jurisdictionSummaries: JurisdictionSummary[] = Array.from(jurisdictionMap.entries()).map(([country_code, deadlines]) => {
        const nextDeadline = deadlines.find(d => new Date(d.due_date) > now && d.status === 'pending');
        const hasOverdue = deadlines.some(d => new Date(d.due_date) < now && d.status === 'pending');
        const hasUpcoming = deadlines.some(d => {
          const daysUntil = Math.ceil((new Date(d.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil <= 30 && d.status === 'pending';
        });

        let status: 'compliant' | 'at_risk' | 'overdue' = 'compliant';
        if (hasOverdue) status = 'overdue';
        else if (hasUpcoming) status = 'at_risk';

        return {
          country_code,
          deadlines,
          nextDeadline,
          status
        };
      });

      setJurisdictions(jurisdictionSummaries);

    } catch (error) {
      console.error('Error fetching compliance data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const createCalendarEvent = async (deadline: TPDeadline) => {
    try {
      const eventDate = new Date(deadline.due_date);
      eventDate.setDate(eventDate.getDate() - 7); // One week before deadline

      const { error } = await supabase
        .from('calendar_events')
        .insert({
          title: `TP Deadline: ${deadline.description || deadline.deadline_type}`,
          company: deadline.country_code,
          date: eventDate.toISOString().split('T')[0],
          description: `Transfer Pricing compliance deadline for ${deadline.country_code}. Type: ${deadline.deadline_type}`,
          category: 'compliance',
          priority: 'high',
          status: 'upcoming'
        });

      if (error) throw error;

      toast.success('Calendar event created for deadline reminder');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast.error('Failed to create calendar event');
    }
  };

  const markDeadlineCompleted = async (deadlineId: string) => {
    try {
      const { error } = await supabase
        .from('tp_deadlines')
        .update({ 
          status: 'compliant' as TPComplianceStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', deadlineId);

      if (error) throw error;

      toast.success('Deadline marked as completed');
      fetchComplianceData();
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast.error('Failed to update deadline status');
    }
  };

  const getStatusColor = (status: TPComplianceStatus) => {
    switch (status) {
      case 'compliant': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getJurisdictionStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'border-green-500 bg-green-50';
      case 'at_risk': return 'border-yellow-500 bg-yellow-50';
      case 'overdue': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getDaysUntilDeadline = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
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
          <h2 className="text-2xl font-bold">Automated Compliance Tracking</h2>
          <p className="text-muted-foreground">
            Monitor transfer pricing compliance deadlines across all jurisdictions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedTimeframe('30')} 
                  className={selectedTimeframe === '30' ? 'bg-primary text-primary-foreground' : ''}>
            30 Days
          </Button>
          <Button variant="outline" onClick={() => setSelectedTimeframe('90')}
                  className={selectedTimeframe === '90' ? 'bg-primary text-primary-foreground' : ''}>
            90 Days
          </Button>
          <Button variant="outline" onClick={() => setSelectedTimeframe('365')}
                  className={selectedTimeframe === '365' ? 'bg-primary text-primary-foreground' : ''}>
            1 Year
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Deadlines</p>
                  <p className="text-2xl font-bold">{metrics.totalDeadlines}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-yellow-600">{metrics.upcomingDeadlines}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.overdueDeadlines}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.completedDeadlines}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold">{metrics.complianceRate.toFixed(1)}%</p>
                <Progress value={metrics.complianceRate} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Critical Alerts */}
      {deadlines.some(d => getDaysUntilDeadline(d.due_date) <= 7 && d.status === 'pending') && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Alert:</strong> You have deadlines within the next 7 days that require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Jurisdiction Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Jurisdiction Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jurisdictions.map(jurisdiction => (
              <div 
                key={jurisdiction.country_code}
                className={`p-4 rounded-lg border-2 ${getJurisdictionStatusColor(jurisdiction.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{jurisdiction.country_code}</h4>
                  <Badge 
                    variant={jurisdiction.status === 'compliant' ? 'default' : 
                             jurisdiction.status === 'at_risk' ? 'secondary' : 'destructive'}
                  >
                    {jurisdiction.status}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-3">
                  {jurisdiction.deadlines.length} deadline(s) tracked
                </div>

                {jurisdiction.nextDeadline && (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Next Deadline:</strong> {jurisdiction.nextDeadline.deadline_type}
                    </div>
                    <div className="text-sm">
                      <strong>Due:</strong> {new Date(jurisdiction.nextDeadline.due_date).toLocaleDateString()}
                      <span className="ml-2 text-muted-foreground">
                        ({getDaysUntilDeadline(jurisdiction.nextDeadline.due_date)} days)
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => createCalendarEvent(jurisdiction.nextDeadline!)}
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Add to Calendar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markDeadlineCompleted(jurisdiction.nextDeadline!.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Deadlines List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deadlines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No deadlines found for the selected timeframe.</p>
              </div>
            ) : (
              deadlines.map(deadline => {
                const daysUntil = getDaysUntilDeadline(deadline.due_date);
                const isUrgent = daysUntil <= 7;
                const isOverdue = daysUntil < 0;

                return (
                  <div 
                    key={deadline.id} 
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      isOverdue ? 'border-red-500 bg-red-50' :
                      isUrgent ? 'border-yellow-500 bg-yellow-50' : 
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{deadline.deadline_type}</h4>
                        <Badge className={getStatusColor(deadline.status)}>
                          {deadline.status}
                        </Badge>
                        {isUrgent && (
                          <Badge variant="destructive">
                            {isOverdue ? 'Overdue' : 'Urgent'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{deadline.country_code}</span>
                        <span>{new Date(deadline.due_date).toLocaleDateString()}</span>
                        <span>{Math.abs(daysUntil)} days {isOverdue ? 'overdue' : 'remaining'}</span>
                      </div>
                      {deadline.description && (
                        <p className="text-sm text-muted-foreground mt-1">{deadline.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => createCalendarEvent(deadline)}
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        Remind
                      </Button>
                      {deadline.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => markDeadlineCompleted(deadline.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}