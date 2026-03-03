import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Target, Lightbulb, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from "recharts";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PredictiveAnalytics = () => {
  const { user } = useAuth();
  const [scenario, setScenario] = useState<"conservative" | "moderate" | "aggressive">("moderate");
  const [revenueGrowth, setRevenueGrowth] = useState("15");
  const [expenseGrowth, setExpenseGrowth] = useState("10");

  // Fetch tax calculations for historical data
  const { data: taxCalcs = [] } = useQuery({
    queryKey: ["tax_calculations_analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch transactions for cash flow
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions_analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch payroll data
  const { data: payrollRuns = [] } = useQuery({
    queryKey: ["payroll_analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("status", "completed")
        .order("period_year")
        .order("period_month");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const scenarioMultipliers = {
    conservative: { revenue: 0.7, expense: 1.1 },
    moderate: { revenue: 1.0, expense: 1.0 },
    aggressive: { revenue: 1.3, expense: 0.9 },
  };

  // Cash flow projection (12 months)
  const cashFlowProjection = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const months = Math.max(1, new Set(transactions.map(t => t.date?.slice(0, 7))).size);
    const avgIncome = totalIncome / months || 500000;
    const avgExpense = totalExpense / months || 300000;
    const mult = scenarioMultipliers[scenario];
    const rg = parseFloat(revenueGrowth) / 100 / 12;
    const eg = parseFloat(expenseGrowth) / 100 / 12;

    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const income = avgIncome * mult.revenue * Math.pow(1 + rg, i + 1);
      const expense = avgExpense * mult.expense * Math.pow(1 + eg, i + 1);
      return {
        month: `${MONTHS_SHORT[m.getMonth()]} ${m.getFullYear()}`,
        income: Math.round(income),
        expense: Math.round(expense),
        netCashFlow: Math.round(income - expense),
      };
    });
  }, [transactions, scenario, revenueGrowth, expenseGrowth]);

  // Tax liability projection
  const taxProjection = useMemo(() => {
    const totalTax = taxCalcs.reduce((s, t) => s + Number(t.tax_amount), 0);
    const avgMonthlyTax = taxCalcs.length > 0 ? totalTax / Math.max(1, new Set(taxCalcs.map(t => t.created_at?.slice(0, 7))).size) : 100000;
    const mult = scenarioMultipliers[scenario];

    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const rg = parseFloat(revenueGrowth) / 100 / 12;
      const projectedRevenue = (cashFlowProjection[i]?.income || 500000);
      const vatLiability = projectedRevenue * 0.075;
      const citLiability = Math.max(0, projectedRevenue * 0.3 * 0.1);
      const payeLiability = payrollRuns.length > 0
        ? Number(payrollRuns[payrollRuns.length - 1]?.total_paye || 0) * Math.pow(1 + rg, i + 1)
        : avgMonthlyTax * 0.3 * mult.revenue;
      return {
        month: `${MONTHS_SHORT[m.getMonth()]} ${m.getFullYear()}`,
        vat: Math.round(vatLiability),
        cit: Math.round(citLiability),
        paye: Math.round(payeLiability),
        total: Math.round(vatLiability + citLiability + payeLiability),
      };
    });
  }, [taxCalcs, payrollRuns, cashFlowProjection, scenario, revenueGrowth]);

  // Summary stats
  const totalProjectedRevenue = cashFlowProjection.reduce((s, m) => s + m.income, 0);
  const totalProjectedExpense = cashFlowProjection.reduce((s, m) => s + m.expense, 0);
  const totalProjectedTax = taxProjection.reduce((s, m) => s + m.total, 0);
  const netProfit = totalProjectedRevenue - totalProjectedExpense - totalProjectedTax;

  const formatCurrency = (n: number) => `₦${Math.abs(n).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

  // AI Insights
  const insights = useMemo(() => {
    const results: { type: "positive" | "warning" | "info"; text: string }[] = [];
    const lastCF = cashFlowProjection[cashFlowProjection.length - 1];
    if (lastCF?.netCashFlow < 0) {
      results.push({ type: "warning", text: `Cash flow turns negative by ${lastCF.month}. Consider reducing expenses or accelerating revenue.` });
    } else {
      results.push({ type: "positive", text: `Positive cash flow maintained throughout the projection period.` });
    }
    if (totalProjectedTax > totalProjectedRevenue * 0.3) {
      results.push({ type: "warning", text: `Tax burden exceeds 30% of projected revenue. Review tax optimization strategies.` });
    }
    results.push({ type: "info", text: `Estimated annual tax liability: ${formatCurrency(totalProjectedTax)}. Set aside ${formatCurrency(totalProjectedTax / 12)}/month.` });
    if (payrollRuns.length > 0) {
      results.push({ type: "info", text: `Payroll costs account for an estimated ${Math.round((payrollRuns[payrollRuns.length - 1]?.total_gross || 0) / (cashFlowProjection[0]?.income || 1) * 100)}% of monthly revenue.` });
    }
    return results;
  }, [cashFlowProjection, taxProjection, totalProjectedTax, totalProjectedRevenue, payrollRuns]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Predictive Analytics</h1>
            <p className="text-muted-foreground">Cash flow forecasting, tax projections, and what-if scenarios</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Scenario</Label>
              <Select value={scenario} onValueChange={(v: any) => setScenario(v)}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Revenue Growth %</Label>
              <Input type="number" value={revenueGrowth} onChange={e => setRevenueGrowth(e.target.value)} className="w-[100px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Expense Growth %</Label>
              <Input type="number" value={expenseGrowth} onChange={e => setExpenseGrowth(e.target.value)} className="w-[100px]" />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalProjectedRevenue)}</p>
              <p className="text-xs text-muted-foreground">Next 12 months</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projected Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalProjectedExpense)}</p>
              <p className="text-xs text-muted-foreground">Next 12 months</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tax Liability</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalProjectedTax)}</p>
              <p className="text-xs text-muted-foreground">VAT + CIT + PAYE</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {netProfit < 0 ? "-" : ""}{formatCurrency(netProfit)}
              </p>
              <p className="text-xs text-muted-foreground">After tax</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cashflow">
          <TabsList>
            <TabsTrigger value="cashflow">Cash Flow Forecast</TabsTrigger>
            <TabsTrigger value="tax">Tax Projections</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="cashflow">
            <Card>
              <CardHeader>
                <CardTitle>12-Month Cash Flow Forecast</CardTitle>
                <CardDescription>
                  Projected income vs expenses ({scenario} scenario, {revenueGrowth}% revenue growth)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlowProjection}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} fontSize={12} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Area type="monotone" dataKey="income" name="Revenue" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" />
                      <Area type="monotone" dataKey="expense" name="Expenses" fill="hsl(0 84% 60% / 0.2)" stroke="hsl(0 84% 60%)" />
                      <Line type="monotone" dataKey="netCashFlow" name="Net Cash Flow" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Tax Liability Projections</CardTitle>
                <CardDescription>Monthly breakdown by tax type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taxProjection}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis tickFormatter={v => `₦${(v / 1000).toFixed(0)}K`} fontSize={12} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="vat" name="VAT (7.5%)" fill="hsl(var(--primary))" stackId="a" />
                      <Bar dataKey="cit" name="CIT" fill="hsl(var(--primary) / 0.6)" stackId="a" />
                      <Bar dataKey="paye" name="PAYE" fill="hsl(var(--primary) / 0.3)" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <CardTitle>AI-Powered Insights</CardTitle>
                  </div>
                  <CardDescription>Based on your financial data and selected scenario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.map((insight, i) => (
                    <div key={i} className={`flex items-start gap-3 rounded-lg border p-4 ${
                      insight.type === "positive" ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950" :
                      insight.type === "warning" ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950" :
                      "border-border bg-muted/50"
                    }`}>
                      <Badge variant={
                        insight.type === "positive" ? "default" :
                        insight.type === "warning" ? "destructive" : "secondary"
                      } className="mt-0.5 shrink-0">
                        {insight.type === "positive" ? "✓" : insight.type === "warning" ? "!" : "i"}
                      </Badge>
                      <p className="text-sm">{insight.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What-If Scenario Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {(["conservative", "moderate", "aggressive"] as const).map(s => {
                      const mult = scenarioMultipliers[s];
                      const baseIncome = cashFlowProjection[0]?.income || 0;
                      const est12 = baseIncome * 12 * mult.revenue;
                      return (
                        <div key={s} className={`rounded-lg border p-4 ${scenario === s ? "border-primary bg-primary/5" : ""}`}>
                          <p className="text-sm font-medium capitalize mb-2">{s}</p>
                          <p className="text-lg font-bold">{formatCurrency(est12)}</p>
                          <p className="text-xs text-muted-foreground">Est. annual revenue</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Revenue: ×{mult.revenue} | Expense: ×{mult.expense}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PredictiveAnalytics;
