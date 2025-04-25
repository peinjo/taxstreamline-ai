
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AREntry {
  id: string;
  customer: string;
  balance: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90Plus: number;
}

export const AccountsReceivableAnalysis = () => {
  // Mock data for AR aging
  const arData: AREntry[] = [
    {
      id: "ar-001",
      customer: "Great Manufacturing",
      balance: 175000,
      current: 75000,
      days30: 50000,
      days60: 50000,
      days90: 0,
      days90Plus: 0,
    },
    {
      id: "ar-002",
      customer: "ABC Corp",
      balance: 89500,
      current: 50000,
      days30: 39500,
      days60: 0,
      days90: 0,
      days90Plus: 0,
    },
    {
      id: "ar-003",
      customer: "XYZ Industries",
      balance: 45000,
      current: 0,
      days30: 0,
      days60: 20000,
      days90: 25000,
      days90Plus: 0,
    },
    {
      id: "ar-004",
      customer: "123 Enterprises",
      balance: 28000,
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      days90Plus: 28000,
    },
  ];

  // Summary data for charts
  const agingSummary = [
    { name: "Current", value: arData.reduce((sum, entry) => sum + entry.current, 0) },
    { name: "30 Days", value: arData.reduce((sum, entry) => sum + entry.days30, 0) },
    { name: "60 Days", value: arData.reduce((sum, entry) => sum + entry.days60, 0) },
    { name: "90 Days", value: arData.reduce((sum, entry) => sum + entry.days90, 0) },
    { name: "90+ Days", value: arData.reduce((sum, entry) => sum + entry.days90Plus, 0) },
  ];

  const COLORS = ["#4ade80", "#a3e635", "#facc15", "#fb923c", "#f87171"];

  const getAgingCellClass = (value: number) => {
    return value > 0 ? "font-semibold" : "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts Receivable Analysis</CardTitle>
        <CardDescription>
          Age and analyze customer accounts receivable for collectability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="aging">
          <TabsList className="mb-4">
            <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="aging">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total Balance</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">30 Days</TableHead>
                    <TableHead className="text-right">60 Days</TableHead>
                    <TableHead className="text-right">90 Days</TableHead>
                    <TableHead className="text-right">90+ Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.customer}</TableCell>
                      <TableCell className="text-right font-bold">
                        ₦{entry.balance.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right ${getAgingCellClass(entry.current)}`}>
                        {entry.current > 0 ? `₦${entry.current.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className={`text-right ${getAgingCellClass(entry.days30)}`}>
                        {entry.days30 > 0 ? `₦${entry.days30.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className={`text-right ${getAgingCellClass(entry.days60)}`}>
                        {entry.days60 > 0 ? `₦${entry.days60.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className={`text-right ${getAgingCellClass(entry.days90)}`}>
                        {entry.days90 > 0 ? `₦${entry.days90.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className={`text-right ${getAgingCellClass(entry.days90Plus)}`}>
                        {entry.days90Plus > 0 ? `₦${entry.days90Plus.toLocaleString()}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      ₦{arData.reduce((sum, entry) => sum + entry.balance, 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ₦{arData.reduce((sum, entry) => sum + entry.current, 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ₦{arData.reduce((sum, entry) => sum + entry.days30, 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ₦{arData.reduce((sum, entry) => sum + entry.days60, 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ₦{arData.reduce((sum, entry) => sum + entry.days90, 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ₦{arData.reduce((sum, entry) => sum + entry.days90Plus, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="charts">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AR Aging Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={agingSummary}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {agingSummary.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(value) => `₦${(value as number).toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AR Aging by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={agingSummary}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₦${(value as number).toLocaleString()}`} />
                        <Bar dataKey="value" fill="#1e40af" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
