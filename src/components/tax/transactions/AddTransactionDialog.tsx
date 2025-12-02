import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INCOME_CATEGORIES = [
  "Sales Revenue",
  "Service Income",
  "Interest Income",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Cost of Materials",
  "Rent",
  "Salary & Wages",
  "Utilities",
  "Tax Withheld",
  "Professional Fees",
  "Transportation",
  "Marketing",
  "Office Supplies",
  "Other Expenses",
];

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    type: "income" as "income" | "expense",
    category: "",
    description: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const uploadReceipt = async (): Promise<number | null> => {
    if (!receiptFile || !userId) return null;

    try {
      setIsUploading(true);
      
      // Upload to storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('tax_documents')
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      // Create document metadata record
      const { data: docData, error: docError } = await supabase
        .from('document_metadata')
        .insert([{
          user_id: userId,
          file_name: receiptFile.name,
          file_path: fileName,
          file_type: 'receipt',
          file_size: receiptFile.size,
          tax_year: new Date().getFullYear(),
          description: 'Transaction receipt',
        }])
        .select()
        .single();

      if (docError) throw docError;
      return docData.id;
    } catch (error) {
      console.error('Receipt upload error:', error);
      toast.error('Failed to upload receipt');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!userId) throw new Error("User not authenticated");
      
      // Upload receipt first if present
      const receiptFileId = receiptFile ? await uploadReceipt() : null;
      
      const { error } = await supabase.from("transactions").insert([
        {
          user_id: userId,
          date: data.date,
          amount: parseFloat(data.amount),
          type: data.type,
          category: data.category,
          description: data.description || null,
          receipt_file_id: receiptFileId,
          source: "manual",
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction added");
      onOpenChange(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        type: "income",
        category: "",
        description: "",
      });
      setReceiptFile(null);
    },
    onError: (error) => {
      toast.error("Failed to add transaction: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate(formData);
  };

  const categories = formData.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "income" | "expense") =>
                setFormData({ ...formData, type: value, category: "" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional notes about this transaction"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('receipt')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {receiptFile ? receiptFile.name : "Upload Receipt"}
              </Button>
              {receiptFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setReceiptFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload invoice, receipt, or proof of payment
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || isUploading}>
              {createMutation.isPending || isUploading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}