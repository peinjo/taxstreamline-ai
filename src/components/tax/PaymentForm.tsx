
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInitiatePayment } from "@/hooks/usePayment";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ReceiptViewer } from "./ReceiptViewer";

export function PaymentForm() {
  const { user } = useAuth();
  const [receiptData, setReceiptData] = useState<{
    reference: string;
    amount: number;
    date: string;
    status: string;
  } | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const { mutate: initiatePayment, isPending } = useInitiatePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const amount = Number(formData.get("amount"));
    const email = formData.get("email") as string;
    const purpose = formData.get("purpose") as string;
    
    if (amount < 100) {
      toast.error("Amount must be at least NGN 100");
      return;
    }
    
    initiatePayment(
      {
        amount,
        currency: "NGN",
        email: user?.email || email,
        metadata: {
          purpose,
        },
      },
      {
        onSuccess: (data) => {
          toast.success("Payment initiated successfully");
          // Open payment URL in new window
          if (data?.authorizationUrl) {
            window.open(data.authorizationUrl, "_blank");
            
            // Create receipt data for viewing
            setReceiptData({
              reference: data.transaction.payment_reference,
              amount: data.transaction.amount,
              date: data.transaction.created_at,
              status: data.transaction.status,
            });
            setReceiptOpen(true);
          }
        },
        onError: (error) => {
          toast.error("Payment failed: " + (error.message || "Unknown error"));
        }
      }
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount (NGN)
            </label>
            <Input
              type="number"
              name="amount"
              min="100"
              step="100"
              required
              defaultValue="1000"
            />
          </div>

          {!user && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                type="email"
                name="email"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium mb-1">
              Payment Purpose
            </label>
            <Input
              type="text"
              name="purpose"
              placeholder="e.g., Tax Filing Fee"
              required
              defaultValue="Tax Filing Fee"
            />
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Processing..." : "Make Payment"}
        </Button>
      </form>
      
      {receiptData && (
        <ReceiptViewer 
          open={receiptOpen} 
          onOpenChange={setReceiptOpen}
          receipt={receiptData}
        />
      )}
    </>
  );
}
