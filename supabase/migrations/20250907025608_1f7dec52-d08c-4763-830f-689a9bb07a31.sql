-- Complete RLS policies for remaining tables without policies
-- Fix INFO issues from linter for tables with RLS enabled but no policies

-- Add RLS policies for tp_approval_workflows
CREATE POLICY "Users can view workflows for accessible documents" 
ON public.tp_approval_workflows 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tp_document_teams dt 
    WHERE dt.document_id = tp_approval_workflows.document_id 
    AND dt.user_id = auth.uid()
  )
);

CREATE POLICY "Document owners can create workflows" 
ON public.tp_approval_workflows 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM transfer_pricing_documents tpd 
    WHERE tpd.id = document_id 
    AND tpd.created_by = auth.uid()
  )
);

CREATE POLICY "Workflow creators can update their workflows" 
ON public.tp_approval_workflows 
FOR UPDATE 
USING (created_by = auth.uid());

-- Add RLS policies for tp_client_portal
CREATE POLICY "Users can view their client portal data" 
ON public.tp_client_portal 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their client portal data" 
ON public.tp_client_portal 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their client portal data" 
ON public.tp_client_portal 
FOR UPDATE 
USING (user_id = auth.uid());

-- Add RLS policies for tp_compliance_tracker
CREATE POLICY "Users can view their compliance tracking data" 
ON public.tp_compliance_tracker 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their compliance tracking data" 
ON public.tp_compliance_tracker 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their compliance tracking data" 
ON public.tp_compliance_tracker 
FOR UPDATE 
USING (user_id = auth.uid());

-- Add RLS policies for tp_currency_rates
CREATE POLICY "All users can view currency rates" 
ON public.tp_currency_rates 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create currency rates" 
ON public.tp_currency_rates 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update currency rates" 
ON public.tp_currency_rates 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Add RLS policies for tp_file_metadata
CREATE POLICY "Users can view their file metadata" 
ON public.tp_file_metadata 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their file metadata" 
ON public.tp_file_metadata 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their file metadata" 
ON public.tp_file_metadata 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their file metadata" 
ON public.tp_file_metadata 
FOR DELETE 
USING (user_id = auth.uid());

-- Add RLS policies for tp_risk_assessments
CREATE POLICY "Users can view their risk assessments" 
ON public.tp_risk_assessments 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their risk assessments" 
ON public.tp_risk_assessments 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their risk assessments" 
ON public.tp_risk_assessments 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their risk assessments" 
ON public.tp_risk_assessments 
FOR DELETE 
USING (user_id = auth.uid());