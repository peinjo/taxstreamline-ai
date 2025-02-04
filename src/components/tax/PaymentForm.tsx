import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useInitiatePayment } from "@/hooks/usePayment";
import { toast } from "sonner";
import { sendTaxNotification } from "@/utils/notifications";

export function PaymentForm() {
  const { user } = useAuth();
  const { mutateAsync: initiatePayment, isPending } = useInitiatePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const paymentData = {
        amount: Number(formData.get("amount")),
        currency: "NGN",
        email: user?.email,
        metadata: {
          purpose: formData.get("purpose"),
        },
      };

      const result = await initiatePayment(paymentData);
      
      if (result?.transaction) {
        // Send email notification
        await sendTaxNotification({
          type: 'payment_receipt',
          userEmail: user?.email || '',
          userName: user?.user_metadata?.full_name || 'Valued Customer',
          data: {
            amount: paymentData.amount,
            reference: result.transaction.payment_reference,
            date: new Date().toLocaleDateString(),
            description: paymentData.metadata.purpose
          }
        });

        toast.success("Payment initiated successfully");
      }
    } catch (error) {
      toast.error("Failed to initiate payment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="number"
          name="amount"
          placeholder="Amount"
          required
          min="100"
          step="100"
        />
      </div>
      <div>
        <Input
          type="text"
          name="purpose"
          placeholder="Payment Purpose"
          required
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Processing..." : "Make Payment"}
      </Button>
    </form>
  );
}