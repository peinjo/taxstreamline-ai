
import { supabase } from "./supabase/client";
import { toast } from "sonner";

interface PaymentInitiationData {
  amount: number;
  currency: string;
  email: string;
  metadata?: Record<string, any>;
}

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
    // Get current user to associate with payment
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    
    // Initialize payment with Paystack
    const paystackKey = process.env.PAYSTACK_SECRET_KEY || import.meta.env.VITE_PAYSTACK_SECRET_KEY;
    
    if (!paystackKey) {
      console.error("Paystack API key is not set");
      throw new Error("Payment service is not properly configured");
    }
    
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: data.amount * 100, // Paystack expects amount in kobo
        email: data.email,
        currency: data.currency,
        metadata: data.metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to initialize payment");
    }

    const paymentData = await response.json();

    if (!paymentData.status) {
      throw new Error("Payment gateway returned an invalid response");
    }

    // Store transaction in Supabase
    const { data: transaction, error } = await supabase
      .from("payment_transactions")
      .insert({
        amount: data.amount,
        currency: data.currency,
        payment_reference: paymentData.data.reference,
        provider: "paystack",
        status: "pending",
        metadata: data.metadata,
        user_id: user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return { transaction, authorizationUrl: paymentData.data.authorization_url };
  } catch (error) {
    console.error("Error initiating payment:", error);
    throw error;
  }
};

export const verifyPayment = async (reference: string): Promise<PaymentTransaction> => {
  try {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY || import.meta.env.VITE_PAYSTACK_SECRET_KEY;
    
    if (!paystackKey) {
      throw new Error("Payment service is not properly configured");
    }
    
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to verify payment");
    }

    const verificationData = await response.json();

    // Update transaction status in Supabase
    const { data: transaction, error } = await supabase
      .from("payment_transactions")
      .update({
        status: verificationData.data.status,
        metadata: {
          ...verificationData.data,
        },
      })
      .eq("payment_reference", reference)
      .select()
      .single();

    if (error) throw error;
    
    // Show toast based on payment status
    if (transaction.status === "success" || transaction.status === "successful") {
      toast.success("Payment successful! Thank you for your payment.");
    } else if (transaction.status === "failed") {
      toast.error("Payment failed. Please try again or contact support.");
    }
    
    return transaction;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};
