import { supabase } from "./supabase/client";
import { toast } from "sonner";
import { emailSchema, validateInput } from "@/lib/validation/schemas";
import { z } from "zod";

interface PaymentInitiationData {
  amount: number;
  currency: string;
  email: string;
  metadata?: Record<string, any>;
}

const paymentInitiationSchema = z.object({
  amount: z.number().min(0.01, "Amount must be at least 0.01").max(10000000, "Amount too large"),
  currency: z.string().length(3, "Currency must be 3 characters").toUpperCase(),
  email: emailSchema,
  metadata: z.record(z.string(), z.any()).optional()
});

interface PaymentTransaction {
  id: number;
  amount: number;
  currency: string;
  payment_reference: string;
  status: string;
  provider: string;
}

export const initiatePayment = async (data: PaymentInitiationData) => {
  try {
    // Validate input data
    const validation = validateInput(paymentInitiationSchema, data);
    if (!validation.success) {
      throw new Error(validation.error);
    }
    const validatedData = validation.data;

    // Call secure edge function to initialize payment
    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      "payment-operations",
      {
        body: { action: "initialize", ...validatedData },
      }
    );

    if (fnError) throw fnError;

    return fnData as { transaction: any; authorizationUrl: string };
  } catch (error) {
    // Avoid leaking details in console; errors handled by caller/UI
    throw error;
  }
};

export const verifyPayment = async (reference: string): Promise<PaymentTransaction> => {
  try {
    // Validate reference
    if (!reference || typeof reference !== "string" || reference.length > 100) {
      throw new Error("Invalid payment reference");
    }

    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      "payment-operations",
      {
        body: { action: "verify", reference },
      }
    );

    if (fnError) throw fnError;

    const transaction = (fnData as any).transaction as PaymentTransaction;

    // Show toast based on payment status
    if (transaction.status === "success" || transaction.status === "successful") {
      toast.success("Payment successful! Thank you for your payment.");
    } else if (transaction.status === "failed") {
      toast.error("Payment failed. Please try again or contact support.");
    } else if (transaction.status === "pending") {
      toast.info("Payment is still being processed");
    }

    return transaction;
  } catch (error) {
    throw error;
  }
};
