-- Create import history table for tracking bulk operations
CREATE TABLE IF NOT EXISTS import_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  file_name text NOT NULL,
  import_type text NOT NULL, -- 'tax_reports', 'compliance_items', 'calendar_events', etc.
  total_records integer NOT NULL DEFAULT 0,
  successful_records integer NOT NULL DEFAULT 0,
  failed_records integer NOT NULL DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  can_rollback boolean DEFAULT true,
  rolled_back_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own import history"
  ON import_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import records"
  ON import_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import records"
  ON import_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_import_history_user_id ON import_history(user_id);
CREATE INDEX idx_import_history_status ON import_history(status);
CREATE INDEX idx_import_history_created_at ON import_history(created_at DESC);