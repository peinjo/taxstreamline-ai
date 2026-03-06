import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileText, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

const PublicInvoice = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-invoice", token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");

      // Find the share token
      const { data: shareToken, error: tokenError } = await supabase
        .from("invoice_share_tokens")
        .select("invoice_id")
        .eq("token", token)
        .eq("is_active", true)
        .single();

      if (tokenError || !shareToken) throw new Error("Invalid or expired payment link");

      // Get invoice
      const { data: invoice, error: invError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", shareToken.invoice_id)
        .single();

      if (invError || !invoice) throw new Error("Invoice not found");

      // Get items
      const { data: items } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id);

      return { invoice, items: items || [] };
    },
    enabled: !!token,
  });

  const handlePayWithPaystack = async () => {
    if (!data?.invoice) return;
    try {
      const { data: paymentData, error } = await supabase.functions.invoke("payment-operations", {
        body: {
          action: "initialize",
          email: data.invoice.client_email || "customer@example.com",
          amount: Math.round(Number(data.invoice.total) * 100),
          metadata: {
            invoice_id: data.invoice.id,
            invoice_number: data.invoice.invoice_number,
            type: "invoice_payment",
          },
        },
      });

      if (error) throw error;
      if (paymentData?.data?.authorization_url) {
        window.location.href = paymentData.data.authorization_url;
      }
    } catch (err) {
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground">This payment link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Link Expired</h2>
            <p className="text-muted-foreground">{(error as Error)?.message || "This payment link is no longer valid."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { invoice, items } = data;
  const isPaid = invoice.status === "paid";

  return (
    <>
      <Helmet>
        <title>Invoice {invoice.invoice_number} | TaxEase</title>
      </Helmet>
      <div className="min-h-screen bg-muted/30 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">TaxEase</h1>
            <p className="text-muted-foreground text-sm">Invoice Payment</p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Invoice {invoice.invoice_number}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Issued {format(new Date(invoice.issue_date), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
              <Badge variant={isPaid ? "default" : "destructive"}>
                {isPaid ? "Paid" : invoice.status === "overdue" ? "Overdue" : "Unpaid"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client info */}
              <div>
                <p className="text-sm text-muted-foreground">Bill To</p>
                <p className="font-medium">{invoice.client_name}</p>
                {invoice.client_email && <p className="text-sm text-muted-foreground">{invoice.client_email}</p>}
                {invoice.client_address && <p className="text-sm text-muted-foreground">{invoice.client_address}</p>}
              </div>

              <Separator />

              {/* Items */}
              <div>
                <p className="text-sm font-medium mb-3">Items</p>
                <div className="space-y-2">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <span>{item.description}</span>
                        <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(Number(item.amount))}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(Number(invoice.subtotal))}</span>
                </div>
                {Number(invoice.vat_amount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT ({invoice.vat_rate}%)</span>
                    <span>{formatCurrency(Number(invoice.vat_amount))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(Number(invoice.total))}</span>
                </div>
              </div>

              {/* Due date */}
              <div className="text-sm text-muted-foreground">
                Due by {format(new Date(invoice.due_date), "dd MMM yyyy")}
              </div>

              {invoice.notes && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  {invoice.notes}
                </div>
              )}

              {/* Payment button */}
              {isPaid ? (
                <div className="flex items-center justify-center gap-2 text-primary py-4">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">This invoice has been paid</span>
                </div>
              ) : (
                <Button className="w-full h-12 text-base gap-2" onClick={handlePayWithPaystack}>
                  <CreditCard className="h-5 w-5" />
                  Pay {formatCurrency(Number(invoice.total))}
                </Button>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Powered by TaxEase RegTech Solutions
          </p>
        </div>
      </div>
    </>
  );
};

export default PublicInvoice;
