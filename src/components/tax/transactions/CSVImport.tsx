import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface CSVImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedRow {
  date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string;
}

export function CSVImport({ open, onOpenChange }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);
    };
    fetchUser();
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      complete: (results) => {
        const parsed = results.data
          .filter((row: any) => row.date && row.amount)
          .map((row: any) => ({
            date: row.date || row.Date,
            type: ((row.type || row.Type)?.toLowerCase() === "expense" ? "expense" : "income") as "income" | "expense",
            category: row.category || row.Category || "Other",
            amount: parseFloat(row.amount || row.Amount),
            description: row.description || row.Description || "",
          }))
          .slice(0, 5); // Preview first 5 rows

        setPreview(parsed as ParsedRow[]);
        toast.success(`Preview: ${results.data.length} rows found`);
      },
      error: (error) => {
        toast.error("Failed to parse CSV: " + error.message);
      },
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    setImporting(true);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const transactions = results.data
          .filter((row: any) => row.date && row.amount)
          .map((row: any) => ({
            user_id: userId,
            date: row.date || row.Date,
            type: (row.type || row.Type)?.toLowerCase() === "expense" ? "expense" : "income",
            category: row.category || row.Category || "Other",
            amount: parseFloat(row.amount || row.Amount),
            description: row.description || row.Description || null,
            source: "csv_import",
          }));

        const { error } = await supabase.from("transactions").insert(transactions);

        if (error) {
          toast.error("Import failed: " + error.message);
        } else {
          toast.success(`Successfully imported ${transactions.length} transactions`);
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
          onOpenChange(false);
          setFile(null);
          setPreview([]);
        }
        setImporting(false);
      },
      error: (error) => {
        toast.error("Import failed: " + error.message);
        setImporting(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Transactions from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CSV File Format</Label>
            <p className="text-sm text-muted-foreground">
              Your CSV should have columns: date, type (income/expense), category, amount, description (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (first 5 rows)</Label>
              <div className="border rounded-lg p-2 max-h-48 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{row.date}</td>
                        <td className="p-2 capitalize">{row.type}</td>
                        <td className="p-2">{row.category}</td>
                        <td className="p-2 text-right">₦{row.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!file || importing}>
              {importing ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}