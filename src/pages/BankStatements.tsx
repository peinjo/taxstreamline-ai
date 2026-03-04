import React, { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  History,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import Papa from "papaparse";

// Category mapping rules for auto-categorization
const CATEGORY_RULES: Record<string, string[]> = {
  "Office Supplies": ["stationery", "office", "supplies", "printing", "paper"],
  "Travel & Transport": ["uber", "bolt", "taxi", "flight", "hotel", "travel", "airline", "transport"],
  "Utilities": ["electricity", "water", "phcn", "nepa", "dstv", "gotv", "internet", "mtn", "airtel", "glo"],
  "Professional Fees": ["legal", "audit", "consulting", "advisory", "lawyer", "accountant"],
  "Rent": ["rent", "lease", "property"],
  "Salaries & Wages": ["salary", "payroll", "wage", "bonus", "allowance"],
  "Bank Charges": ["charge", "commission", "fee", "vat on commission", "sms alert"],
  "Insurance": ["insurance", "premium", "policy"],
  "Marketing": ["advertising", "marketing", "promotion", "campaign", "google ads", "facebook"],
  "Equipment": ["equipment", "machine", "computer", "laptop", "phone", "furniture"],
  "Food & Entertainment": ["restaurant", "food", "catering", "entertainment", "lunch", "dinner"],
  "Tax Payment": ["firs", "tax", "withholding", "paye", "vat payment"],
};

function categorizeTransaction(description: string): string {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Uncategorized";
}

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  selected: boolean;
}

export default function BankStatements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [parsedRows, setParsedRows] = useState<ParsedTransaction[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [bankFormat, setBankFormat] = useState("auto");

  // Fetch import history
  const { data: importHistory } = useQuery({
    queryKey: ["import-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("import_history")
        .select("*")
        .eq("user_id", user!.id)
        .eq("import_type", "bank_statement")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch recent transactions count
  const { data: txCount } = useQuery({
    queryKey: ["transactions-count", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["csv", "xlsx", "xls"].includes(ext || "")) {
        toast.error("Please upload a CSV or Excel file");
        return;
      }

      setFileName(file.name);
      setParsing(true);

      if (ext === "csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = parseStatementRows(results.data as Record<string, string>[]);
            setParsedRows(rows);
            setShowPreview(true);
            setParsing(false);
          },
          error: () => {
            toast.error("Failed to parse CSV file");
            setParsing(false);
          },
        });
      } else {
        // Excel files
        import("xlsx").then((XLSX) => {
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const wb = XLSX.read(evt.target?.result, { type: "binary" });
              const ws = wb.Sheets[wb.SheetNames[0]];
              const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
              const rows = parseStatementRows(jsonData);
              setParsedRows(rows);
              setShowPreview(true);
              setParsing(false);
            } catch {
              toast.error("Failed to parse Excel file");
              setParsing(false);
            }
          };
          reader.readAsBinaryString(file);
        });
      }
    },
    [bankFormat]
  );

  function parseStatementRows(data: Record<string, string>[]): ParsedTransaction[] {
    return data
      .map((row) => {
        // Try to detect columns flexibly
        const dateVal =
          row["Date"] || row["date"] || row["Transaction Date"] || row["VALUE DATE"] || row["Post Date"] || "";
        const descVal =
          row["Description"] || row["description"] || row["Narration"] || row["NARRATION"] || row["Details"] || row["Remarks"] || "";
        const debitVal =
          row["Debit"] || row["debit"] || row["DEBIT"] || row["Withdrawal"] || "";
        const creditVal =
          row["Credit"] || row["credit"] || row["CREDIT"] || row["Deposit"] || "";
        const amountVal =
          row["Amount"] || row["amount"] || row["AMOUNT"] || "";

        let amount = 0;
        let type: "income" | "expense" = "expense";

        if (debitVal && creditVal) {
          const debit = parseFloat(String(debitVal).replace(/[^0-9.-]/g, "")) || 0;
          const credit = parseFloat(String(creditVal).replace(/[^0-9.-]/g, "")) || 0;
          if (credit > 0) {
            amount = credit;
            type = "income";
          } else {
            amount = debit;
            type = "expense";
          }
        } else if (amountVal) {
          amount = parseFloat(String(amountVal).replace(/[^0-9.-]/g, "")) || 0;
          type = amount < 0 ? "expense" : "income";
          amount = Math.abs(amount);
        }

        if (!dateVal || amount === 0) return null;

        // Parse date
        let parsedDate: string;
        try {
          const d = new Date(dateVal);
          parsedDate = isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
        } catch {
          parsedDate = new Date().toISOString().split("T")[0];
        }

        return {
          date: parsedDate,
          description: descVal || "Bank Transaction",
          amount,
          type,
          category: categorizeTransaction(descVal),
          selected: true,
        };
      })
      .filter(Boolean) as ParsedTransaction[];
  }

  const toggleRow = (index: number) => {
    setParsedRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r))
    );
  };

  const updateCategory = (index: number, category: string) => {
    setParsedRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, category } : r))
    );
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      const selected = parsedRows.filter((r) => r.selected);
      if (selected.length === 0) throw new Error("No transactions selected");

      const transactions = selected.map((r) => ({
        user_id: user!.id,
        date: r.date,
        description: r.description,
        amount: r.amount,
        type: r.type,
        category: r.category,
        source: "bank_statement",
      }));

      const { error: txError } = await supabase.from("transactions").insert(transactions);
      if (txError) throw txError;

      // Log import history
      const { error: histError } = await supabase.from("import_history").insert({
        user_id: user!.id,
        import_type: "bank_statement",
        file_name: fileName,
        total_records: parsedRows.length,
        successful_records: selected.length,
        failed_records: parsedRows.length - selected.length,
        status: "completed",
        completed_at: new Date().toISOString(),
      });
      if (histError) console.error("History log error:", histError);

      return selected.length;
    },
    onSuccess: (count) => {
      toast.success(`Successfully imported ${count} transactions`);
      setShowPreview(false);
      setParsedRows([]);
      setFileName("");
      queryClient.invalidateQueries({ queryKey: ["import-history"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-count"] });
    },
    onError: (error: Error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });

  const selectedCount = parsedRows.filter((r) => r.selected).length;
  const totalIncome = parsedRows.filter((r) => r.selected && r.type === "income").reduce((s, r) => s + r.amount, 0);
  const totalExpense = parsedRows.filter((r) => r.selected && r.type === "expense").reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <Helmet>
        <title>Bank Statement Import - TaxEase</title>
        <meta name="description" content="Import bank statements and auto-categorize transactions for tax compliance" />
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bank Statement Import</h1>
            <p className="text-muted-foreground mt-1">Upload bank statements and auto-categorize transactions</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold text-foreground">{txCount ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2.5">
                    <History className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Imports Completed</p>
                    <p className="text-2xl font-bold text-foreground">{importHistory?.length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2.5">
                    <ArrowUpDown className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categories Supported</p>
                    <p className="text-2xl font-bold text-foreground">{Object.keys(CATEGORY_RULES).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Upload Bank Statement
              </CardTitle>
              <CardDescription>
                Supports CSV and Excel files from any Nigerian bank. Columns are auto-detected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Bank Format (optional)</Label>
                  <Select value={bankFormat} onValueChange={setBankFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="gtbank">GTBank</SelectItem>
                      <SelectItem value="zenith">Zenith Bank</SelectItem>
                      <SelectItem value="firstbank">First Bank</SelectItem>
                      <SelectItem value="uba">UBA</SelectItem>
                      <SelectItem value="access">Access Bank</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Statement File</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      disabled={parsing}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              {parsing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Parsing statement...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import History */}
          {importHistory && importHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Import History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importHistory.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="text-sm">
                          {format(new Date(h.created_at!), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{h.file_name}</TableCell>
                        <TableCell>
                          <span className="text-green-600">{h.successful_records}</span>
                          {h.failed_records > 0 && (
                            <span className="text-destructive"> / {h.failed_records} failed</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={h.status === "completed" ? "default" : "secondary"}>
                            {h.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Review Transactions — {fileName}</DialogTitle>
              <DialogDescription>
                {parsedRows.length} transactions found. {selectedCount} selected for import.
              </DialogDescription>
            </DialogHeader>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 my-2">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground">Selected</p>
                <p className="text-lg font-bold text-foreground">{selectedCount}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-muted-foreground">Income</p>
                </div>
                <p className="text-lg font-bold text-green-600">₦{totalIncome.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  <p className="text-xs text-muted-foreground">Expenses</p>
                </div>
                <p className="text-lg font-bold text-destructive">₦{totalExpense.toLocaleString()}</p>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="flex-1 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">✓</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.map((row, i) => (
                    <TableRow key={i} className={!row.selected ? "opacity-40" : ""}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRow(i)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{row.date}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{row.description}</TableCell>
                      <TableCell>
                        <Badge variant={row.type === "income" ? "default" : "secondary"}>
                          {row.type === "income" ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {row.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">₦{row.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Select value={row.category} onValueChange={(v) => updateCategory(i, v)}>
                          <SelectTrigger className="h-8 text-xs w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Object.keys(CATEGORY_RULES), "Uncategorized"].map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {parsedRows.some((r) => r.category === "Uncategorized" && r.selected) && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 mt-2">
                <AlertTriangle className="h-4 w-4" />
                Some transactions are uncategorized. You can assign categories before importing.
              </div>
            )}

            <DialogFooter className="mt-3">
              <Button variant="outline" onClick={() => setShowPreview(false)}>Cancel</Button>
              <Button
                onClick={() => importMutation.mutate()}
                disabled={importMutation.isPending || selectedCount === 0}
              >
                {importMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Importing...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Import {selectedCount} Transactions</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
}
