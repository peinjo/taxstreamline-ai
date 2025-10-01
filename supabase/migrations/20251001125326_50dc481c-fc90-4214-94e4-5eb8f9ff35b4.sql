-- Add RLS policies for tp_client_access
CREATE POLICY "Users can view their client access grants"
ON tp_client_access
FOR SELECT
USING (auth.uid() = granted_by OR auth.uid() = client_user_id);

CREATE POLICY "Users can grant client access to their documents"
ON tp_client_access
FOR INSERT
WITH CHECK (
  auth.uid() = granted_by 
  AND EXISTS (
    SELECT 1 FROM transfer_pricing_documents 
    WHERE id = document_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can revoke client access they granted"
ON tp_client_access
FOR DELETE
USING (auth.uid() = granted_by);

-- Add RLS policies for tp_document_shares
CREATE POLICY "Users can view their document shares"
ON tp_document_shares
FOR SELECT
USING (
  auth.uid() = created_by 
  OR EXISTS (
    SELECT 1 FROM transfer_pricing_documents 
    WHERE id = document_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Document owners can create shares"
ON tp_document_shares
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM transfer_pricing_documents 
    WHERE id = document_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Document owners can delete shares"
ON tp_document_shares
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM transfer_pricing_documents 
    WHERE id = document_id AND created_by = auth.uid()
  )
);

-- Add RLS policies for tp_document_teams
CREATE POLICY "Users can view their document team assignments"
ON tp_document_teams
FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() = assigned_by
  OR EXISTS (
    SELECT 1 FROM transfer_pricing_documents 
    WHERE id = document_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Document owners can assign team members"
ON tp_document_teams
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM transfer_pricing_documents 
    WHERE id = document_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Document owners can update team assignments"
ON tp_document_teams
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM transfer_pricing_documents 
    WHERE id = document_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Document owners can remove team members"
ON tp_document_teams
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM transfer_pricing_documents 
    WHERE id = document_id AND created_by = auth.uid()
  )
);