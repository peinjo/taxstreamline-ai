import React from "react";
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
} from "recharts";
import { Card } from "@/components/ui/card";

interface TaxReport {
  tax_type: string;
  amount: number;
  tax_year: number;
}

interface Props {
  data: TaxReport[];
}

export const TaxCharts = ({ data }: Props) => {
  // Process data for line chart (year-over-year trends)
  const lineChartData = data.reduce((acc: any[], curr) => {
    const existingEntry = acc.find((entry) => entry.year === curr.tax_year);
    if (existingEntry) {
      existingEntry.amount += curr.amount;
    } else {
      acc.push({ year: curr.tax_year, amount: curr.amount });
    }
    return acc;
  }, []);

  // Process data for pie chart (tax type breakdown)
  const pieChartData = data.reduce((acc: any[], curr) => {
    const existingEntry = acc.find((entry) => entry.name === curr.tax_type);
    if (existingEntry) {
      existingEntry.value += curr.amount;
    } else {
      acc.push({ name: curr.tax_type, value: curr.amount });
    }
    return acc;
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <>
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Year-over-Year Tax Trends</h3>
        <LineChart width={500} height={300} data={lineChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Tax Type Breakdown</h3>
        <PieChart width={500} height={300}>
          <Pie
            data={pieChartData}
            cx={250}
            cy={150}
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieChartData.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Card>
    </>
  );
};