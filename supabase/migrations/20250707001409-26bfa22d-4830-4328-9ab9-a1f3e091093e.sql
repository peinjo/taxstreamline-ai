-- Phase 7: Knowledge Base & Advanced Features Database Schema

-- Knowledge base articles and guides
CREATE TABLE IF NOT EXISTS tp_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('guide', 'regulation', 'faq', 'tutorial', 'case_study')),
  jurisdiction TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT true,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  metadata JSONB DEFAULT '{}'
);

-- Advanced analytics data
CREATE TABLE IF NOT EXISTS tp_analytics_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES tp_entities(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('trend', 'benchmark', 'risk_score', 'optimization')),
  time_period TEXT NOT NULL,
  metrics JSONB NOT NULL,
  insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit trail for transfer pricing activities
CREATE TABLE IF NOT EXISTS tp_audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES tp_entities(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('preparation', 'review', 'adjustment', 'filing')),
  audit_phase TEXT NOT NULL,
  findings JSONB DEFAULT '{}',
  recommendations TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'on_hold')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Economic substance analysis data
CREATE TABLE IF NOT EXISTS tp_economic_substance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES tp_entities(id) ON DELETE CASCADE,
  substance_test TEXT NOT NULL CHECK (substance_test IN ('ciga', 'directed_managed', 'adequate_substance')),
  test_results JSONB NOT NULL,
  compliance_score INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
  deficiencies TEXT[],
  remediation_plan TEXT,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  next_review_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advanced benchmarking database
CREATE TABLE IF NOT EXISTS tp_advanced_benchmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  database_source TEXT NOT NULL,
  search_strategy JSONB NOT NULL,
  comparable_data JSONB NOT NULL,
  statistical_analysis JSONB DEFAULT '{}',
  rejection_reasons TEXT[],
  final_arm_length_range JSONB,
  confidence_level DECIMAL(3,2) DEFAULT 0.95,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ERP integration configurations
CREATE TABLE IF NOT EXISTS tp_erp_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  erp_system TEXT NOT NULL,
  connection_config JSONB NOT NULL,
  mapping_rules JSONB DEFAULT '{}',
  sync_frequency TEXT DEFAULT 'daily',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE tp_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_economic_substance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_advanced_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_erp_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tp_knowledge_base
CREATE POLICY "Everyone can view published knowledge base" ON tp_knowledge_base
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage knowledge base" ON tp_knowledge_base
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tp_user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for tp_analytics_data
CREATE POLICY "Users can manage their own analytics data" ON tp_analytics_data
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tp_audit_trail
CREATE POLICY "Users can view their own audit trails" ON tp_audit_trail
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM tp_user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can create audit trails" ON tp_audit_trail
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tp_economic_substance
CREATE POLICY "Users can manage their own economic substance data" ON tp_economic_substance
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tp_advanced_benchmarks
CREATE POLICY "Users can manage their own advanced benchmarks" ON tp_advanced_benchmarks
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tp_erp_integrations
CREATE POLICY "Users can manage their own ERP integrations" ON tp_erp_integrations
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_knowledge_base_category ON tp_knowledge_base(category);
CREATE INDEX idx_knowledge_base_jurisdiction ON tp_knowledge_base(jurisdiction);
CREATE INDEX idx_knowledge_base_tags ON tp_knowledge_base USING GIN(tags);
CREATE INDEX idx_analytics_data_type ON tp_analytics_data(data_type);
CREATE INDEX idx_audit_trail_status ON tp_audit_trail(status);
CREATE INDEX idx_economic_substance_entity ON tp_economic_substance(entity_id);

-- Function to update view count for knowledge base articles
CREATE OR REPLACE FUNCTION increment_kb_view_count(article_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE tp_knowledge_base 
  SET view_count = view_count + 1 
  WHERE id = article_id;
END;
$$;

-- Function to calculate risk trends
CREATE OR REPLACE FUNCTION calculate_risk_trends(p_user_id UUID, p_period TEXT DEFAULT '12_months')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trend_data JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', date_trunc('month', created_at),
      'avg_risk_level', AVG(
        CASE 
          WHEN risk_level = 'low' THEN 1
          WHEN risk_level = 'medium' THEN 2
          WHEN risk_level = 'high' THEN 3
          ELSE 2
        END
      ),
      'entity_count', COUNT(*)
    )
    ORDER BY date_trunc('month', created_at)
  ) INTO trend_data
  FROM tp_entities 
  WHERE user_id = p_user_id 
    AND created_at >= (
      CASE 
        WHEN p_period = '6_months' THEN now() - INTERVAL '6 months'
        WHEN p_period = '12_months' THEN now() - INTERVAL '12 months'
        WHEN p_period = '24_months' THEN now() - INTERVAL '24 months'
        ELSE now() - INTERVAL '12 months'
      END
    )
  GROUP BY date_trunc('month', created_at);
  
  RETURN COALESCE(trend_data, '[]'::jsonb);
END;
$$;