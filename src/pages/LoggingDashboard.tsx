import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogsOverview } from "@/components/logging/LogsOverview";
import { ErrorTrendsChart } from "@/components/logging/ErrorTrendsChart";
import { PerformanceMetrics } from "@/components/logging/PerformanceMetrics";
import { RecentLogs } from "@/components/logging/RecentLogs";
import { ComponentBreakdown } from "@/components/logging/ComponentBreakdown";
import { Activity, AlertTriangle, BarChart3, Clock } from "lucide-react";
import { subDays } from "date-fns";

interface LogStatistics {
  total_logs: number;
  errors: number;
  warnings: number;
  info: number;
  debug: number;
  avg_duration: number;
  by_component: Record<string, number>;
}

export default function LoggingDashboard() {
  const [timeRange, setTimeRange] = useState<string>("7");

  const startDate = subDays(new Date(), parseInt(timeRange));

  // Fetch log statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['log-statistics', timeRange],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.rpc('get_log_statistics', {
        p_user_id: user?.id || null,
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString()
      });
      if (error) throw error;
      return data as unknown as LogStatistics;
    }
  });

  // Fetch recent logs
  const { data: recentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['recent-logs', timeRange],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from('application_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch error trends
  const { data: errorTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['error-trends', timeRange],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from('application_logs')
        .select('level, created_at')
        .gte('created_at', startDate.toISOString())
        .in('level', ['ERROR', 'WARN'])
        .order('created_at', { ascending: true });

      if (user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const errorRate = stats ? 
    ((stats.errors || 0) / (stats.total_logs || 1) * 100).toFixed(1) : "0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Logging Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor application logs, errors, and performance metrics
            </p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : (stats?.total_logs || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Last {timeRange} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {statsLoading ? "..." : (stats?.errors || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {errorRate}% error rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {statsLoading ? "..." : (stats?.warnings || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : `${stats?.avg_duration || 0}ms`}
              </div>
              <p className="text-xs text-muted-foreground">
                Operation time
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Error Trends</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <LogsOverview stats={stats} isLoading={statsLoading} />
              <ComponentBreakdown stats={stats} isLoading={statsLoading} />
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <ErrorTrendsChart 
              data={errorTrends || []} 
              isLoading={trendsLoading} 
              timeRange={parseInt(timeRange)}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceMetrics 
              logs={recentLogs || []} 
              isLoading={logsLoading} 
            />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <RecentLogs 
              logs={recentLogs || []} 
              isLoading={logsLoading} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
