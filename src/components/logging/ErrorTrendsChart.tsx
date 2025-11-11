import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfDay, eachDayOfInterval, subDays, eachHourOfInterval } from "date-fns";

interface ErrorTrendsChartProps {
  data: any[];
  isLoading: boolean;
  timeRange: number;
}

export function ErrorTrendsChart({ data, isLoading, timeRange }: ErrorTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error & Warning Trends</CardTitle>
          <CardDescription>Over time analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px]" />
        </CardContent>
      </Card>
    );
  }

  // Aggregate data by time intervals
  const now = new Date();
  const startDate = subDays(now, timeRange);
  
  let intervals: Date[];
  let formatString: string;
  
  if (timeRange <= 1) {
    // Hourly for last 24 hours
    intervals = eachHourOfInterval({ start: startDate, end: now });
    formatString = "HH:mm";
  } else {
    // Daily for longer periods
    intervals = eachDayOfInterval({ start: startOfDay(startDate), end: startOfDay(now) });
    formatString = "MMM dd";
  }

  const chartData = intervals.map(interval => {
    const intervalStart = interval.getTime();
    const intervalEnd = timeRange <= 1 
      ? intervalStart + 3600000 // 1 hour
      : intervalStart + 86400000; // 1 day

    const logsInInterval = data.filter(log => {
      const logTime = new Date(log.created_at).getTime();
      return logTime >= intervalStart && logTime < intervalEnd;
    });

    return {
      time: format(interval, formatString),
      errors: logsInInterval.filter(log => log.level === 'ERROR').length,
      warnings: logsInInterval.filter(log => log.level === 'WARN').length,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error & Warning Trends</CardTitle>
        <CardDescription>
          {timeRange <= 1 ? 'Hourly' : 'Daily'} breakdown of errors and warnings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="errors" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name="Errors"
            />
            <Line 
              type="monotone" 
              dataKey="warnings" 
              stroke="hsl(var(--warning))" 
              strokeWidth={2}
              name="Warnings"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
