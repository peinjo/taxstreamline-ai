import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TaxReport {
  tax_type: string;
  amount: number;
  status: string;
  // ... add other fields as needed
}

export const AnalyticsCharts = ({ data }: { data: TaxReport[] }) => {
  // Transform the data for the chart
  const chartData = data.reduce((acc: any[], report) => {
    const existingEntry = acc.find((entry) => entry.name === report.tax_type);
    if (existingEntry) {
      existingEntry.value += report.amount;
    } else {
      acc.push({ name: report.tax_type, value: report.amount });
    }
    return acc;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Distribution</CardTitle>
        <CardDescription>Overview of tax amounts by type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};