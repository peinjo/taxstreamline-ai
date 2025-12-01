-- Phase 1: Database Schema Updates for TaxEase V1

-- 1. Extend user_profiles table for Business Profile
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tin TEXT; -- Tax Identification Number
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS state_of_operation TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS accounting_basis TEXT DEFAULT 'cash'; -- cash or accrual
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS revenue_band TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS vat_registered BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT true;

-- 2. Create transactions table for Income & Expense Tracking
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  receipt_file_id BIGINT REFERENCES document_metadata(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'manual', -- 'manual', 'csv_import', 'whatsapp'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Users can manage their own transactions"
ON transactions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Create filing_packs table
CREATE TABLE IF NOT EXISTS filing_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  pdf_url TEXT,
  status TEXT DEFAULT 'generated', -- generated, submitted, completed
  summary_data JSONB,
  generated_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  proof_uploaded_at TIMESTAMPTZ,
  proof_file_id BIGINT REFERENCES document_metadata(id) ON DELETE SET NULL
);

-- Enable RLS on filing_packs
ALTER TABLE filing_packs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for filing_packs
CREATE POLICY "Users can manage their own filing packs"
ON filing_packs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Add versioning and tags to document_metadata
ALTER TABLE document_metadata ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE document_metadata ADD COLUMN IF NOT EXISTS parent_document_id BIGINT REFERENCES document_metadata(id) ON DELETE SET NULL;
ALTER TABLE document_metadata ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for transaction queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(user_id, type);

-- Create index for filing pack queries
CREATE INDEX IF NOT EXISTS idx_filing_packs_user_status ON filing_packs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_filing_packs_tax_type ON filing_packs(user_id, tax_type);

-- Create updated_at trigger for transactions
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_transactions_updated_at();