export interface PaymentTransaction {
  id: number;
  user_id?: string | null;
  amount: number;
  currency: string;
  payment_reference: string;
  provider: string;
  status: string;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentResponse {
  transaction: PaymentTransaction;
  authorizationUrl: string;
}

export interface PaymentInitiationData {
  amount: number;
  currency: string;
  email?: string;
  metadata?: Record<string, any>;
}