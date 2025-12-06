import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Filter } from "lucide-react";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { TransactionTable } from "./TransactionTable";
import { CSVImport } from "./CSVImport";
import { TransactionSummary } from "./TransactionSummary";
import { EmptyTransactions } from "@/components/empty-states";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description?: string;
  receipt_file_id?: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export function TransactionList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete transaction: " + error.message);
    },
  });

  const handleExport = () => {
    if (!transactions?.length) {
      toast.error("No transactions to export");
      return;
    }

    const csv = [
      ["Date", "Type", "Category", "Amount", "Description", "Source"],
      ...transactions.map((t) => [
        t.date,
        t.type,
        t.category,
        t.amount.toString(),
        t.description || "",
        t.source,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transactions exported");
  };

  const totals = transactions?.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  ) || { income: 0, expense: 0 };

  // Show empty state if no transactions
  if (!isLoading && (!transactions || transactions.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Income & Expenses</h2>
            <p className="text-muted-foreground">
              Track your transactions for accurate tax calculations
            </p>
          </div>
        </div>

        <EmptyTransactions
          onAddTransaction={() => setIsAddDialogOpen(true)}
          onImportCSV={() => setIsImportDialogOpen(true)}
          title="No transactions recorded"
          description="Track your income and expenses to generate accurate tax calculations and filing packs."
        />

        <AddTransactionDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />

        <CSVImport
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Income & Expenses</h2>
          <p className="text-muted-foreground">
            Track your transactions for accurate tax calculations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <TransactionSummary 
        transactions={transactions || []}
        periodLabel="All Time"
      />

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={typeFilter} onValueChange={(value: "all" | "income" | "expense") => setTypeFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
            <SelectItem value="expense">Expenses Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TransactionTable
        transactions={transactions || []}
        isLoading={isLoading}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <CSVImport
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
}