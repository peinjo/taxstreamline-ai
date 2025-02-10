
-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'consultant', 'client');
CREATE TYPE document_type AS ENUM ('master', 'local', 'supporting');
CREATE TYPE document_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected');
CREATE TYPE pricing_method AS ENUM ('CUP', 'TNMM', 'CPM', 'PSM', 'OTHER');

-- Create transfer pricing tables
CREATE TABLE tp_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type document_type NOT NULL,
  status document_status DEFAULT 'draft',
  company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  content JSONB,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES tp_documents(id),
  transaction_type TEXT NOT NULL,
  description TEXT,
  amount DECIMAL,
  currency TEXT,
  pricing_method pricing_method,
  supporting_docs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tp_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES tp_transactions(id),
  dataset_source TEXT,
  comparables JSONB,
  analysis_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE tp_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_benchmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their company's documents"
ON tp_documents FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM user_companies
  WHERE company_id = tp_documents.company_id
));

CREATE POLICY "Admins can approve documents"
ON tp_documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
