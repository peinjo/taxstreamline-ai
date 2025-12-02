import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

interface Transaction {
  type: "income" | "expense";
  amount: number;
  category: string;
}

interface TransactionSummaryProps {
  transactions: Transaction[];
  periodLabel?: string;
}

export function TransactionSummary({ transactions, periodLabel = "This Period" }: TransactionSummaryProps) {
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netAmount / totalIncome) * 100) : 0;

  const topIncomeCategories = Object.entries(
    transactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const topExpenseCategories = Object.entries(
    transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1])
    .slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            ₦{totalIncome.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
          {topIncomeCategories.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Top Categories:</p>
              {topIncomeCategories.map(([cat, amt]) => (
                <p key={cat} className="text-xs">
                  {cat}: ₦{amt.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            ₦{totalExpenses.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
          {topExpenseCategories.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Top Categories:</p>
              {topExpenseCategories.map(([cat, amt]) => (
                <p key={cat} className="text-xs">
                  {cat}: ₦{amt.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit/Loss</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-success' : 'text-destructive'}`}>
            ₦{netAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {netAmount >= 0 ? 'Profit' : 'Loss'} for {periodLabel.toLowerCase()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          <PieChart className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {profitMargin.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {transactions.length} transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
