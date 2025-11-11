import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PerformanceMetricsProps {
  logs: any[];
  isLoading: boolean;
}

export function PerformanceMetrics({ logs, isLoading }: PerformanceMetricsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Average duration by component</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px]" />
        </CardContent>
      </Card>
    );
  }

  // Filter logs with duration data and group by component
  const logsWithDuration = logs.filter(log => log.duration && log.component);
  
  const componentDurations: Record<string, { total: number; count: number }> = {};
  
  logsWithDuration.forEach(log => {
    if (!componentDurations[log.component]) {
      componentDurations[log.component] = { total: 0, count: 0 };
    }
    componentDurations[log.component].total += parseFloat(log.duration);
    componentDurations[log.component].count += 1;
  });

  const data = Object.entries(componentDurations)
    .map(([component, { total, count }]) => ({
      component,
      avgDuration: Math.round(total / count * 100) / 100,
      count
    }))
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 15);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Average duration by component</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No performance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="font-medium">{payload[0].payload.component}</p>
          <p className="text-sm text-muted-foreground">
            Avg: {payload[0].value}ms ({payload[0].payload.count} operations)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Top 15 slowest components by average duration</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: 'ms', position: 'insideRight' }} />
            <YAxis dataKey="component" type="category" width={150} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgDuration" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
