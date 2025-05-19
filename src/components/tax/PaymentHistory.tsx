
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ReceiptViewer } from "./ReceiptViewer";
import type { PaymentTransaction } from "@/types/payment";
import { format } from "date-fns";

export function PaymentHistory() {
  const { user } = useAuth();
  const [selectedReceipt, setSelectedReceipt] = useState<{
    reference: string;
    amount: number;
    date: string;
    status: string;
  } | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payment-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as PaymentTransaction[];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      successful: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={
        statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800"
      }>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const handleViewReceipt = (payment: PaymentTransaction) => {
    setSelectedReceipt({
      reference: payment.payment_reference,
      amount: payment.amount,
      date: payment.created_at,
      status: payment.status,
    });
    setReceiptOpen(true);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[32px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.length ? (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">
                    {payment.payment_reference.substring(0, 12)}...
                  </TableCell>
                  <TableCell className="font-medium">
                    {payment.currency} {payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(payment.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewReceipt(payment)}
                      title="View Receipt"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No payment history found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedReceipt && (
        <ReceiptViewer 
          open={receiptOpen} 
          onOpenChange={setReceiptOpen} 
          receipt={selectedReceipt}
        />
      )}
    </>
  );
}
