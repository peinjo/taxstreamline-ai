-- Add comprehensive RLS policies for transfer_pricing_documents table
-- This table was created with RLS enabled but lacks INSERT/DELETE policies

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Owners can view own documents" ON transfer_pricing_documents;
DROP POLICY IF EXISTS "Users can create documents" ON transfer_pricing_documents;
DROP POLICY IF EXISTS "Owners can update own documents" ON transfer_pricing_documents;
DROP POLICY IF EXISTS "Owners can delete own documents" ON transfer_pricing_documents;
DROP POLICY IF EXISTS "Team members can view documents" ON transfer_pricing_documents;

-- Owner can view their documents
CREATE POLICY "Owners can view own documents"
ON transfer_pricing_documents FOR SELECT
USING (created_by = auth.uid());

-- Owner can create documents
CREATE POLICY "Users can create documents"
ON transfer_pricing_documents FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Owner can update their documents
CREATE POLICY "Owners can update own documents"
ON transfer_pricing_documents FOR UPDATE
USING (created_by = auth.uid());

-- Owner can delete their documents
CREATE POLICY "Owners can delete own documents"
ON transfer_pricing_documents FOR DELETE
USING (created_by = auth.uid());

-- Team members can view documents they have access to via tp_document_teams
CREATE POLICY "Team members can view documents"
ON transfer_pricing_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tp_document_teams
    WHERE tp_document_teams.document_id = transfer_pricing_documents.id
    AND tp_document_teams.user_id = auth.uid()
  )
);