import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import { generateVATFilingPack, saveFilingPackToStorage, FilingPackData } from "@/services/filingPackPDFService";

interface Transaction {
  date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string;
}

export function FilingPackGenerator() {
  const queryClient = useQueryClient();
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [generating, setGenerating] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      return { ...user, profile };
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions-for-pack", periodStart, periodEnd],
    queryFn: async () => {
      if (!periodStart || !periodEnd) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", periodStart)
        .lte("date", periodEnd)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!periodStart && !!periodEnd,
  });

  const createFilingPackMutation = useMutation({
    mutationFn: async () => {
      if (!user || !transactions) throw new Error("Missing data");

      // Calculate VAT
      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const vatOutput = totalIncome * 0.075; // 7.5%
      const vatInput = totalExpenses * 0.075;
      const netVatPayable = vatOutput - vatInput;

      const packData: FilingPackData = {
        user: {
          fullName: user.profile?.full_name || user.email || "User",
          email: user.email || "",
          businessName: user.profile?.business_name,
          tin: user.profile?.tin,
          state: user.profile?.state_of_operation || "Nigeria",
        },
        taxType: "vat",
        period: {
          start: periodStart,
          end: periodEnd,
        },
        summary: {
          totalIncome,
          totalExpenses,
          vatOutput,
          vatInput,
          netVatPayable,
          taxAmount: netVatPayable,
        },
        transactions: transactions.map(t => ({
          date: t.date,
          type: t.type,
          category: t.category,
          amount: t.amount,
          description: t.description,
        })),
      };

      // Generate PDF
      const pdfBlob = await generateVATFilingPack(packData);

      // Save to storage
      const pdfUrl = await saveFilingPackToStorage(
        user.id,
        pdfBlob,
        "vat",
        periodStart,
        periodEnd
      );

      // Save filing pack record
      const { error } = await supabase.from("filing_packs").insert([{
        user_id: user.id,
        tax_type: "vat",
        period_start: periodStart,
        period_end: periodEnd,
        pdf_url: pdfUrl,
        status: "generated",
        summary_data: packData.summary,
      }]);

      if (error) throw error;

      return pdfUrl;
    },
    onSuccess: (pdfUrl) => {
      queryClient.invalidateQueries({ queryKey: ["filing-packs"] });
      toast.success("Filing pack generated successfully");
      
      // Download PDF
      window.open(pdfUrl, "_blank");
    },
    onError: (error) => {
      toast.error("Failed to generate filing pack: " + error.message);
    },
  });

  const handleGenerate = async () => {
    if (!periodStart || !periodEnd) {
      toast.error("Please select start and end dates");
      return;
    }

    if (new Date(periodEnd) < new Date(periodStart)) {
      toast.error("End date must be after start date");
      return;
    }

    if (!transactions || transactions.length === 0) {
      toast.error("No transactions found in this period");
      return;
    }

    setGenerating(true);
    try {
      await createFilingPackMutation.mutateAsync();
    } finally {
      setGenerating(false);
    }
  };

  const totals = transactions?.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  ) || { income: 0, expense: 0 };

  const vatOutput = totals.income * 0.075;
  const vatInput = totals.expense * 0.075;
  const netVat = vatOutput - vatInput;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">VAT Filing Pack Generator</h2>
        <p className="text-muted-foreground">
          Generate a comprehensive filing pack with calculations, guides, and step-by-step instructions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Tax Period</CardTitle>
          <CardDescription>
            Choose the start and end dates for your VAT filing period (usually monthly)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Period Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Period End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          {periodStart && periodEnd && transactions && transactions.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Period Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm text-muted-foreground">Total Sales</div>
                  <div className="text-xl font-bold">₦{totals.income.toLocaleString()}</div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm text-muted-foreground">Total Purchases</div>
                  <div className="text-xl font-bold">₦{totals.expense.toLocaleString()}</div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm text-muted-foreground">Transactions</div>
                  <div className="text-xl font-bold">{transactions.length}</div>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold">VAT Calculation Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Output VAT (7.5%)</span>
                    <span className="font-mono">₦{vatOutput.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Input VAT (7.5%)</span>
                    <span className="font-mono">₦{vatInput.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t">
                    <span>Net VAT Payable</span>
                    <span className={`font-mono ${netVat >= 0 ? "text-red-600" : "text-green-600"}`}>
                      ₦{netVat.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>Generating Filing Pack...</>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate VAT Filing Pack (PDF)
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                This will generate a comprehensive PDF with calculations, income/expense statements,
                step-by-step filing instructions, and a checklist
              </p>
            </div>
          )}

          {periodStart && periodEnd && transactions?.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm">
              No transactions found in this period. Please add transactions first.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What's Included in the Filing Pack?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
            <div>
              <strong>Cover Page</strong> - Your business information and tax period
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
            <div>
              <strong>Important Notice</strong> - Clear statement that TaxEase prepares and guides; you file yourself
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
            <div>
              <strong>VAT Calculation Summary</strong> - Complete breakdown with formulas and assumptions
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
            <div>
              <strong>Income & Expense Statements</strong> - Detailed transaction listings
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
            <div>
              <strong>Step-by-Step Filing Guide</strong> - Exact instructions for FIRS portal submission
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
            <div>
              <strong>Payment Instructions</strong> - How to pay using Remita and your RRR
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
            <div>
              <strong>Filing Checklist</strong> - Track completion of all required steps
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}