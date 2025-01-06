import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInitiatePayment } from "@/hooks/usePayment";

export function PaymentForm() {
  const { mutate: initiatePayment, isPending } = useInitiatePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    initiatePayment({
      amount: Number(formData.get("amount")),
      currency: "NGN",
      email: formData.get("email") as string,
      metadata: {
        purpose: formData.get("purpose"),
      },
    });
  };

  return (
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
          />
        </div>

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

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium mb-1">
            Payment Purpose
          </label>
          <Input
            type="text"
            name="purpose"
            placeholder="e.g., Tax Filing Fee"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Processing..." : "Make Payment"}
      </Button>
    </form>
  );
}