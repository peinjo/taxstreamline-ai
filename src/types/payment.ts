export interface PaymentTransaction {
  id: number;
  user_id?: string;
  amount: number;
  currency: string;
  payment_reference: string;
  provider: string;
  status: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}