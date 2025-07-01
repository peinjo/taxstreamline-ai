
-- Phase 1: Database Schema Enhancement for Transfer Pricing

-- Create enum types for Transfer Pricing
CREATE TYPE tp_entity_type AS ENUM ('parent', 'subsidiary', 'branch', 'partnership', 'other');
CREATE TYPE tp_transaction_type AS ENUM ('tangible_goods', 'intangible_property', 'services', 'financial_transactions', 'other');
CREATE TYPE tp_pricing_method AS ENUM ('CUP', 'TNMM', 'RPM', 'PSM', 'OTHER');
CREATE TYPE tp_risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE tp_compliance_status AS ENUM ('compliant', 'pending', 'overdue', 'not_applicable');

-- Enhanced TP Entities table
CREATE TABLE tp_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  entity_type tp_entity_type NOT NULL,
  country_code TEXT NOT NULL,
  tax_id TEXT,
  business_description TEXT,
  functional_analysis JSONB DEFAULT '{}',
  financial_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TP Controlled Transactions table
CREATE TABLE tp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  entity_id UUID REFERENCES tp_entities(id),
  transaction_type tp_transaction_type NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  pricing_method tp_pricing_method,
  arm_length_range JSONB DEFAULT '{}',
  documentation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TP Benchmarking data table
CREATE TABLE tp_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  transaction_id UUID REFERENCES tp_transactions(id),
  comparable_name TEXT NOT NULL,
  country TEXT NOT NULL,
  industry TEXT,
  financial_data JSONB NOT NULL,
  search_criteria JSONB DEFAULT '{}',
  reliability_score INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TP Compliance Deadlines table
CREATE TABLE tp_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  country_code TEXT NOT NULL,
  deadline_type TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status tp_compliance_status DEFAULT 'pending',
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TP Risk Assessments table
CREATE TABLE tp_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  entity_id UUID REFERENCES tp_entities(id),
  transaction_id UUID REFERENCES tp_transactions(id),
  risk_level tp_risk_level NOT NULL,
  risk_factors JSONB DEFAULT '{}',
  recommendations TEXT,
  assessment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TP Document Templates table
CREATE TABLE tp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'master_file', 'local_file', 'agreement'
  jurisdiction TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update existing transfer_pricing_documents table with additional fields
ALTER TABLE transfer_pricing_documents 
ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES tp_entities(id),
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES tp_templates(id),
ADD COLUMN IF NOT EXISTS jurisdiction TEXT,
ADD COLUMN IF NOT EXISTS compliance_status tp_compliance_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS risk_level tp_risk_level DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ;

-- Enable RLS on new tables
ALTER TABLE tp_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tp_entities
CREATE POLICY "Users can manage their own entities" ON tp_entities
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tp_transactions
CREATE POLICY "Users can manage their own transactions" ON tp_transactions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tp_benchmarks
CREATE POLICY "Users can manage their own benchmarks" ON tp_benchmarks
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tp_deadlines
CREATE POLICY "Users can manage their own deadlines" ON tp_deadlines
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tp_risk_assessments
CREATE POLICY "Users can manage their own risk assessments" ON tp_risk_assessments
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tp_templates (public read, admin write)
CREATE POLICY "Everyone can read templates" ON tp_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage templates" ON tp_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert some basic templates for common jurisdictions
INSERT INTO tp_templates (name, template_type, jurisdiction, content) VALUES
('OECD Master File Template', 'master_file', 'OECD', '{"sections": ["organizational_structure", "business_description", "intangibles", "intercompany_financial_activities", "financial_and_tax_position"]}'),
('OECD Local File Template', 'local_file', 'OECD', '{"sections": ["controlled_entity", "controlled_transactions", "financial_information"]}'),
('US Master File Template', 'master_file', 'US', '{"sections": ["organizational_structure", "business_description", "intangibles", "intercompany_financial_activities", "financial_and_tax_position"], "us_specific": true}'),
('Nigeria Local File Template', 'local_file', 'NG', '{"sections": ["entity_information", "controlled_transactions", "transfer_pricing_methods"], "nigeria_specific": true}');

-- Create indexes for better performance
CREATE INDEX idx_tp_entities_user_id ON tp_entities(user_id);
CREATE INDEX idx_tp_transactions_entity_id ON tp_transactions(entity_id);
CREATE INDEX idx_tp_transactions_user_id ON tp_transactions(user_id);
CREATE INDEX idx_tp_benchmarks_transaction_id ON tp_benchmarks(transaction_id);
CREATE INDEX idx_tp_deadlines_due_date ON tp_deadlines(due_date);
CREATE INDEX idx_tp_deadlines_user_id ON tp_deadlines(user_id);
