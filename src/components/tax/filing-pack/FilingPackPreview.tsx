import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Building2, 
  Calculator, 
  Receipt, 
  ClipboardList,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string;
}

interface UserInfo {
  fullName: string;
  email: string;
  businessName?: string;
  tin?: string;
  state?: string;
}

interface FilingPackPreviewProps {
  user: UserInfo;
  periodStart: string;
  periodEnd: string;
  transactions: Transaction[];
  totals: {
    income: number;
    expense: number;
  };
  vatOutput: number;
  vatInput: number;
  netVat: number;
}

export function FilingPackPreview({
  user,
  periodStart,
  periodEnd,
  transactions,
  totals,
  vatOutput,
  vatInput,
  netVat,
}: FilingPackPreviewProps) {
  const incomeTransactions = transactions.filter(t => t.type === "income");
  const expenseTransactions = transactions.filter(t => t.type === "expense");

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Filing Pack Preview
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Preview Mode
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cover" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="cover" className="text-xs py-2">
              <Building2 className="h-3 w-3 mr-1" />
              Cover
            </TabsTrigger>
            <TabsTrigger value="summary" className="text-xs py-2">
              <Calculator className="h-3 w-3 mr-1" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs py-2">
              <Receipt className="h-3 w-3 mr-1" />
              Details
            </TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs py-2">
              <ClipboardList className="h-3 w-3 mr-1" />
              Checklist
            </TabsTrigger>
          </TabsList>

          {/* Cover Page Preview */}
          <TabsContent value="cover" className="mt-4">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4 border">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-primary">VAT Filing Pack</h3>
                <p className="text-sm text-muted-foreground">
                  Prepared by TaxEase
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Business Name:</span>
                  <span className="font-medium">{user.businessName || "Not specified"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TIN:</span>
                  <span className="font-mono">{user.tin || "Not specified"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prepared For:</span>
                  <span className="font-medium">{user.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">State:</span>
                  <span>{user.state || "Nigeria"}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax Period:</span>
                  <span className="font-medium">
                    {format(new Date(periodStart), "MMM d, yyyy")} - {format(new Date(periodEnd), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Generated:</span>
                  <span>{format(new Date(), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded p-3 mt-4">
                <div className="flex gap-2 text-xs text-amber-800 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p>
                    <strong>Important:</strong> TaxEase prepares and guides. You file yourself on the FIRS portal.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tax Summary Preview */}
          <TabsContent value="summary" className="mt-4">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4 border">
              <h4 className="font-semibold text-center">VAT Calculation Summary</h4>
              
              <div className="space-y-3">
                <div className="p-3 bg-background rounded border">
                  <div className="text-xs text-muted-foreground mb-1">Total Sales (Taxable Supplies)</div>
                  <div className="text-lg font-bold">₦{totals.income.toLocaleString()}</div>
                </div>
                
                <div className="p-3 bg-background rounded border">
                  <div className="text-xs text-muted-foreground mb-1">Total Purchases (Input Supplies)</div>
                  <div className="text-lg font-bold">₦{totals.expense.toLocaleString()}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h5 className="font-medium text-sm">Calculation Breakdown</h5>
                
                <div className="bg-background rounded border p-3 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Output VAT</span>
                    <span>₦{totals.income.toLocaleString()} × 7.5%</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span></span>
                    <span>= ₦{vatOutput.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Input VAT</span>
                    <span>₦{totals.expense.toLocaleString()} × 7.5%</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span></span>
                    <span>= ₦{vatInput.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net VAT</span>
                    <span>₦{vatOutput.toLocaleString(undefined, { maximumFractionDigits: 2 })} - ₦{vatInput.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className={`flex justify-between font-bold text-base ${netVat >= 0 ? "text-destructive" : "text-green-600"}`}>
                    <span>{netVat >= 0 ? "Amount Payable" : "Refund Due"}</span>
                    <span>= ₦{Math.abs(netVat).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-2">
                  <strong>Assumption:</strong> VAT rate of 7.5% as per Nigerian Finance Act
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Transaction Details Preview */}
          <TabsContent value="transactions" className="mt-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-4 border max-h-64 overflow-y-auto">
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Income Transactions ({incomeTransactions.length})
                </h5>
                {incomeTransactions.length > 0 ? (
                  <div className="space-y-1">
                    {incomeTransactions.slice(0, 5).map((t, i) => (
                      <div key={i} className="flex justify-between text-xs bg-background p-2 rounded">
                        <div>
                          <span className="text-muted-foreground">{format(new Date(t.date), "MMM d")}</span>
                          <span className="mx-2">·</span>
                          <span>{t.category}</span>
                        </div>
                        <span className="font-mono text-green-600">+₦{t.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {incomeTransactions.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center py-1">
                        +{incomeTransactions.length - 5} more transactions
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No income transactions</p>
                )}
              </div>

              <Separator />

              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Expense Transactions ({expenseTransactions.length})
                </h5>
                {expenseTransactions.length > 0 ? (
                  <div className="space-y-1">
                    {expenseTransactions.slice(0, 5).map((t, i) => (
                      <div key={i} className="flex justify-between text-xs bg-background p-2 rounded">
                        <div>
                          <span className="text-muted-foreground">{format(new Date(t.date), "MMM d")}</span>
                          <span className="mx-2">·</span>
                          <span>{t.category}</span>
                        </div>
                        <span className="font-mono text-red-600">-₦{t.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {expenseTransactions.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center py-1">
                        +{expenseTransactions.length - 5} more transactions
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No expense transactions</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Checklist Preview */}
          <TabsContent value="checklist" className="mt-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 border">
              <h5 className="font-medium text-sm">Filing Checklist (Included in PDF)</h5>
              
              <div className="space-y-2">
                {[
                  "Log in to TaxPro-Max portal",
                  "Navigate to VAT returns section",
                  "Enter your filing period dates",
                  "Input Output VAT amount",
                  "Input Input VAT amount",
                  "Review and submit return",
                  "Generate payment reference (RRR)",
                  "Make payment via Remita",
                  "Save payment receipt",
                  "Upload proof to TaxEase",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                The full PDF includes detailed step-by-step instructions for each item.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
