
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";

interface TaxReport {
  tax_type: string;
  amount: number;
  tax_year: number;
  status: string;
  id: number;
}

interface Props {
  data: TaxReport[];
}

export const TaxCharts = ({ data }: Props) => {
  const [chartType, setChartType] = useState<"year" | "type">("year");
  
  // Process data for line chart (year-over-year trends)
  const lineChartData = React.useMemo(() => {
    return data.reduce((acc: any[], curr) => {
      const existingEntry = acc.find((entry) => entry.year === curr.tax_year);
      if (existingEntry) {
        existingEntry.amount += Number(curr.amount || 0);
      } else {
        acc.push({ year: curr.tax_year, amount: Number(curr.amount || 0) });
      }
      return acc.sort((a, b) => a.year - b.year);
    }, []);
  }, [data]);

  // Process data for pie chart (tax type breakdown)
  const pieChartData = React.useMemo(() => {
    return data.reduce((acc: any[], curr) => {
      const existingEntry = acc.find((entry) => entry.name === curr.tax_type);
      if (existingEntry) {
        existingEntry.value += Number(curr.amount || 0);
      } else if (curr.tax_type) {
        acc.push({ 
          name: curr.tax_type.charAt(0).toUpperCase() + curr.tax_type.slice(1), 
          value: Number(curr.amount || 0) 
        });
      }
      return acc;
    }, []);
  }, [data]);

  // Process data for status breakdown chart
  const statusChartData = React.useMemo(() => {
    return data.reduce((acc: any[], curr) => {
      const existingEntry = acc.find((entry) => entry.name === curr.status);
      if (existingEntry) {
        existingEntry.value += Number(curr.amount || 0);
      } else if (curr.status) {
        acc.push({ 
          name: curr.status.charAt(0).toUpperCase() + curr.status.slice(1), 
          value: Number(curr.amount || 0) 
        });
      }
      return acc;
    }, []);
  }, [data]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const YearTrendChart = () => (
    <Card className="p-4 h-full">
      <CardHeader>
        <CardTitle>Year-over-Year Tax Trends</CardTitle>
        <CardDescription>Total tax amount reported by year</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `₦${value.toLocaleString()}`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar 
              dataKey="amount" 
              name="Total Tax Amount" 
              fill="#1e40af"
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const TaxTypeChart = () => (
    <Card className="p-4 h-full">
      <CardHeader>
        <CardTitle>Tax Type Breakdown</CardTitle>
        <CardDescription>Distribution of taxes by type</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              animationDuration={1000}
            >
              {pieChartData.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <>
      <YearTrendChart />
      <TaxTypeChart />
    </>
  );
};
