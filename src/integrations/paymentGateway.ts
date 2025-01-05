import { supabase } from "./supabase/client";

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
    // Initialize payment with Paystack
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: data.amount * 100, // Paystack expects amount in kobo
        email: data.email,
        currency: data.currency,
        metadata: data.metadata,
      }),
    });

    const paymentData = await response.json();

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
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

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
    return transaction;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};