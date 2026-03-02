import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Plus,
  Loader2,
  Send,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  sent: { label: "Sent", variant: "secondary" },
  viewed: { label: "Viewed", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const Invoices = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [vatRate, setVatRate] = useState(7.5);
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, amount: 0 },
  ]);
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === "quantity" || field === "unit_price") {
      updated[index].amount = Number(updated[index].quantity) * Number(updated[index].unit_price);
    }
    setItems(updated);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, unit_price: 0, amount: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  const createInvoice = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate invoice number
      const { data: numData } = await supabase.rpc("generate_invoice_number", { p_user_id: user.id });
      const invoiceNumber = numData || `INV-${Date.now()}`;

      const { data: invoice, error } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          invoice_number: invoiceNumber,
          client_name: clientName,
          client_email: clientEmail || null,
          client_address: clientAddress || null,
          due_date: dueDate,
          subtotal,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          total,
          notes: notes || null,
          status: "draft",
        })
        .select()
        .single();
      if (error) throw error;

      // Insert items
      const invoiceItems = items
        .filter((it) => it.description.trim())
        .map((it) => ({
          invoice_id: invoice.id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          amount: it.amount,
        }));

      if (invoiceItems.length > 0) {
        const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems);
        if (itemsError) throw itemsError;
      }

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created!");
      resetForm();
      setIsCreateOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted");
    },
  });

  const markAsSent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").update({ status: "sent" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice marked as sent");
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice marked as paid");
    },
  });

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setClientAddress("");
    setDueDate("");
    setNotes("");
    setVatRate(7.5);
    setItems([{ description: "", quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

  const totalRevenue = invoices?.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0) || 0;
  const totalOutstanding = invoices?.filter((i) => ["sent", "viewed", "overdue"].includes(i.status)).reduce((s, i) => s + Number(i.total), 0) || 0;

  return (
    <>
      <Helmet>
        <title>Invoices | TaxEase</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Create, send, and track invoices for your clients.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client Name *</Label>
                    <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" />
                  </div>
                  <div>
                    <Label>Client Email</Label>
                    <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" type="email" />
                  </div>
                </div>
                <div>
                  <Label>Client Address</Label>
                  <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date *</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>VAT Rate (%)</Label>
                    <Input type="number" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} min={0} max={100} step={0.5} />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <Label className="mb-2 block">Line Items</Label>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Input placeholder="Description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} min={1} />
                        </div>
                        <div className="col-span-3">
                          <Input type="number" placeholder="Unit Price" value={item.unit_price || ""} onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))} min={0} />
                        </div>
                        <div className="col-span-1 text-right text-sm font-medium pt-2">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="col-span-1">
                          {items.length > 1 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" onClick={addItem}>
                    + Add Item
                  </Button>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT ({vatRate}%)</span>
                    <span>{formatCurrency(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, bank details, etc." />
                </div>

                <Button
                  className="w-full"
                  onClick={() => createInvoice.mutate()}
                  disabled={!clientName || !dueDate || createInvoice.isPending}
                >
                  {createInvoice.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">{invoices?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total Invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Revenue (Paid)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalOutstanding)}</div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">
                {invoices?.filter((i) => i.status === "overdue").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoice List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !invoices?.length ? (
              <div className="text-center py-12 space-y-3">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">No invoices yet. Create your first invoice!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => {
                      const status = statusConfig[inv.status] || statusConfig.draft;
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                          <TableCell className="font-medium">{inv.client_name}</TableCell>
                          <TableCell>{formatCurrency(Number(inv.total))}</TableCell>
                          <TableCell>{format(new Date(inv.issue_date), "dd MMM yyyy")}</TableCell>
                          <TableCell>{format(new Date(inv.due_date), "dd MMM yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              {inv.status === "draft" && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsSent.mutate(inv.id)} title="Mark as Sent">
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                              {["sent", "viewed", "overdue"].includes(inv.status) && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsPaid.mutate(inv.id)} title="Mark as Paid">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteInvoice.mutate(inv.id)} title="Delete">
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Invoices;
