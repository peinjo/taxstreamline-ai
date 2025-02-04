import { supabase } from "./supabase/client";
import { PaymentInitiationData, PaymentResponse, PaymentTransaction } from "@/types/payment";

export const initiatePayment = async (data: PaymentInitiationData): Promise<PaymentResponse> => {
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
    return { 
      transaction: transaction as PaymentTransaction,
      authorizationUrl: paymentData.data.authorization_url 
    };
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
    return transaction as PaymentTransaction;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};