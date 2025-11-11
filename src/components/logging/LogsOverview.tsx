import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface LogsOverviewProps {
  stats: any;
  isLoading: boolean;
}

export function LogsOverview({ stats, isLoading }: LogsOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log Levels Distribution</CardTitle>
          <CardDescription>Breakdown by severity</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: 'Errors', value: stats?.errors || 0, color: 'hsl(var(--destructive))' },
    { name: 'Warnings', value: stats?.warnings || 0, color: 'hsl(var(--warning))' },
    { name: 'Info', value: stats?.info || 0, color: 'hsl(var(--primary))' },
    { name: 'Debug', value: stats?.debug || 0, color: 'hsl(var(--muted-foreground))' },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log Levels Distribution</CardTitle>
          <CardDescription>Breakdown by severity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No logs available for this time period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Levels Distribution</CardTitle>
        <CardDescription>Breakdown by severity</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
