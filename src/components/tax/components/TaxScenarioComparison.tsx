
import React from "react";
import { TaxScenario } from "@/hooks/useTaxCalculation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TaxScenarioComparisonProps {
  scenarios: TaxScenario[];
  onClose: () => void;
}

export const TaxScenarioComparison = ({ scenarios, onClose }: TaxScenarioComparisonProps) => {
  // Format the data for the comparison chart
  const comparisonData = scenarios.map(scenario => ({
    name: scenario.name,
    tax: scenario.result.taxAmount,
    income: Object.values(scenario.inputs)[0] || 0, // Assume first input is income
    effectiveRate: scenario.result.effectiveRate
  }));

  // Format data for the rate comparison
  const rateComparisonData = scenarios.map(scenario => ({
    name: scenario.name,
    rate: scenario.result.effectiveRate
  }));

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Scenario Comparison</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="tax" name="Tax Amount" fill="#10B981" />
                <Bar dataKey="income" name="Income" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rateComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                <Legend />
                <Bar dataKey="rate" name="Effective Tax Rate" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Scenario</th>
                <th className="py-2 text-right">Income</th>
                <th className="py-2 text-right">Tax</th>
                <th className="py-2 text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr key={scenario.id} className="border-b">
                  <td className="py-2">{scenario.name}</td>
                  <td className="py-2 text-right">₦{Object.values(scenario.inputs)[0]?.toLocaleString() || 0}</td>
                  <td className="py-2 text-right">₦{scenario.result.taxAmount.toLocaleString()}</td>
                  <td className="py-2 text-right">{scenario.result.effectiveRate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
