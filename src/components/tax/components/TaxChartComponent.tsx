
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface TaxVisualizationProps {
  taxAmount: number;
  income: number;
  details?: Record<string, any>;
  taxType: string;
}

export const TaxChartComponent = ({ taxAmount, income, details, taxType }: TaxVisualizationProps) => {
  const [chartType, setChartType] = React.useState<"bar" | "pie">("bar");
  
  // Format data for charts
  const pieData = [
    { name: "Tax Amount", value: taxAmount, color: "#10B981" },
    { name: "Net Amount", value: income - taxAmount, color: "#3B82F6" },
  ];

  const barData = [
    { name: "Income", amount: income, color: "#3B82F6" },
    { name: "Tax", amount: taxAmount, color: "#10B981" },
    { name: "Net", amount: income - taxAmount, color: "#6366F1" },
  ];

  // Calculate tax rate as percentage
  const taxRate = ((taxAmount / income) * 100).toFixed(2);

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{taxType} Visualization</CardTitle>
        <Select value={chartType} onValueChange={(value) => setChartType(value as "bar" | "pie")}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Chart Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "pie" ? (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                <Legend />
              </PieChart>
            ) : (
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div className="rounded-md bg-green-50 p-2">
            <p className="text-sm text-gray-500">Effective Tax Rate</p>
            <p className="text-xl font-bold text-green-600">{taxRate}%</p>
          </div>
          <div className="rounded-md bg-blue-50 p-2">
            <p className="text-sm text-gray-500">Net After Tax</p>
            <p className="text-xl font-bold text-blue-600">₦{(income - taxAmount).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
