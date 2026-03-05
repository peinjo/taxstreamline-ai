import React, { useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Camera,
  Upload,
  Receipt,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  processing: { label: "Processing", variant: "secondary", icon: Loader2 },
  completed: { label: "Completed", variant: "default", icon: CheckCircle2 },
  failed: { label: "Failed", variant: "destructive", icon: XCircle },
};

const Receipts = () => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: receipts, isLoading } = useQuery({
    queryKey: ["ocr-receipts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ocr_receipts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const processReceipt = useMutation({
    mutationFn: async ({ receiptId, fileUrl }: { receiptId: string; fileUrl: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ocr-receipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ receiptId, fileUrl }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "OCR processing failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ocr-receipts"] });
      toast.success("Receipt processed successfully!");
    },
    onError: (err: Error) => {
      queryClient.invalidateQueries({ queryKey: ["ocr-receipts"] });
      toast.error(err.message);
    },
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload an image (JPG, PNG, WebP) or PDF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("tax_documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // Get signed URL for OCR processing
      const { data: signedUrlData } = await supabase.storage
        .from("tax_documents")
        .createSignedUrl(filePath, 3600);

      // Create receipt record
      const { data: receipt, error: insertError } = await supabase
        .from("ocr_receipts")
        .insert({
          user_id: user.id,
          file_path: filePath,
          file_name: file.name,
          status: "pending",
        })
        .select()
        .single();
      if (insertError) throw insertError;

      toast.success("Receipt uploaded! Processing with AI...");

      // Trigger OCR processing
      if (signedUrlData?.signedUrl) {
        processReceipt.mutate({
          receiptId: receipt.id,
          fileUrl: signedUrlData.signedUrl,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [processReceipt]);

  const deleteReceipt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ocr_receipts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ocr-receipts"] });
      toast.success("Receipt deleted");
    },
  });

  const formatCurrency = (amount: number | null, currency = "NGN") => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Receipt Capture | TaxEase</title>
      </Helmet>
      <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Snap, Upload, Comply</h1>
            <p className="text-muted-foreground">
              Upload receipts and let AI extract amounts, VAT, and vendor details automatically.
            </p>
          </div>
          <div>
            <Label htmlFor="receipt-upload" className="cursor-pointer">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Upload Receipt"}
              </div>
            </Label>
            <Input
              id="receipt-upload"
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">{receipts?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total Receipts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">
                {receipts?.filter((r) => r.status === "completed").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Processed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">
                {formatCurrency(
                  receipts
                    ?.filter((r) => r.status === "completed")
                    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0) || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">
                {formatCurrency(
                  receipts
                    ?.filter((r) => r.status === "completed")
                    .reduce((sum, r) => sum + (Number(r.vat_amount) || 0), 0) || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">Total VAT</p>
            </CardContent>
          </Card>
        </div>

        {/* Receipts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !receipts?.length ? (
              <div className="text-center py-12 space-y-3">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">No receipts yet. Upload your first receipt to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>VAT</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map((receipt) => {
                      const status = statusConfig[receipt.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium text-sm max-w-[150px] truncate">
                            {receipt.file_name}
                          </TableCell>
                          <TableCell>{receipt.vendor_name || "—"}</TableCell>
                          <TableCell>{formatCurrency(Number(receipt.amount))}</TableCell>
                          <TableCell>{formatCurrency(Number(receipt.vat_amount))}</TableCell>
                          <TableCell>
                            {receipt.receipt_date
                              ? format(new Date(receipt.receipt_date), "dd MMM yyyy")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {receipt.category ? (
                              <Badge variant="outline" className="capitalize">
                                {receipt.category.replace("_", " ")}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className="gap-1">
                              <StatusIcon className={`h-3 w-3 ${receipt.status === "processing" ? "animate-spin" : ""}`} />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteReceipt.mutate(receipt.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
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

export default Receipts;
