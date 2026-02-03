-- Fix hardcoded anon keys in database trigger functions
-- Replace with secure app_secrets table approach

-- Step 1: Create secure app_secrets table for storing sensitive configuration
CREATE TABLE IF NOT EXISTS public.app_secrets (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and deny all access - only accessible via SECURITY DEFINER functions
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct access to secrets" ON public.app_secrets USING (false);

-- Step 2: Create helper function to get edge function URL from config
CREATE OR REPLACE FUNCTION public.get_edge_function_url(function_name TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('app.supabase_functions_url', true),
    (SELECT value FROM app_secrets WHERE key = 'supabase_functions_url')
  ) || '/' || function_name;
$$;

-- Step 3: Create helper function to get service key for internal calls
CREATE OR REPLACE FUNCTION public.get_internal_service_key()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('app.service_role_key', true),
    (SELECT value FROM app_secrets WHERE key = 'service_role_key')
  );
$$;

-- Step 4: Update notify_compliance_overdue function to use secure methods
CREATE OR REPLACE FUNCTION public.notify_compliance_overdue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  notifications_enabled BOOLEAN;
  service_key TEXT;
  functions_url TEXT;
BEGIN
  -- Only trigger for status changes to 'overdue'
  IF NEW.status = 'overdue' AND (OLD.status IS NULL OR OLD.status != 'overdue') THEN
    -- Get user email and preferences
    SELECT up.email, up.display_name, up.compliance_alerts_enabled
    INTO user_email, user_name, notifications_enabled
    FROM user_profiles up
    WHERE up.user_id = NEW.user_id;

    -- Send notification if enabled
    IF notifications_enabled AND user_email IS NOT NULL THEN
      -- Get service key securely (will be NULL if not configured)
      SELECT value INTO service_key FROM app_secrets WHERE key = 'service_role_key';
      SELECT value INTO functions_url FROM app_secrets WHERE key = 'supabase_functions_url';
      
      -- Only proceed if secrets are configured
      IF service_key IS NOT NULL AND functions_url IS NOT NULL THEN
        PERFORM net.http_post(
          url := functions_url || '/send-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'apikey', service_key
          ),
          body := jsonb_build_object(
            'type', 'compliance',
            'to', user_email,
            'data', jsonb_build_object(
              'userName', COALESCE(user_name, 'User'),
              'itemTitle', NEW.title,
              'status', NEW.status,
              'priority', NEW.priority,
              'country', NEW.country,
              'requirementType', NEW.requirement_type,
              'actionUrl', COALESCE(
                current_setting('app.frontend_url', true),
                (SELECT value FROM app_secrets WHERE key = 'frontend_url'),
                'https://taxstreamline-ai.lovable.app'
              ) || '/compliance'
            )
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 5: Update notify_report_status_change function to use secure methods  
CREATE OR REPLACE FUNCTION public.notify_report_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  notifications_enabled BOOLEAN;
  service_key TEXT;
  functions_url TEXT;
BEGIN
  -- Only trigger if status actually changed
  IF NEW.status != OLD.status THEN
    -- Get user email and preferences
    SELECT up.email, up.display_name, up.report_status_updates_enabled
    INTO user_email, user_name, notifications_enabled
    FROM user_profiles up
    WHERE up.user_id = NEW.user_id;

    -- Send notification if enabled
    IF notifications_enabled AND user_email IS NOT NULL THEN
      -- Get service key securely
      SELECT value INTO service_key FROM app_secrets WHERE key = 'service_role_key';
      SELECT value INTO functions_url FROM app_secrets WHERE key = 'supabase_functions_url';
      
      -- Only proceed if secrets are configured
      IF service_key IS NOT NULL AND functions_url IS NOT NULL THEN
        PERFORM net.http_post(
          url := functions_url || '/send-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'apikey', service_key
          ),
          body := jsonb_build_object(
            'type', 'report_status',
            'to', user_email,
            'data', jsonb_build_object(
              'userName', COALESCE(user_name, 'User'),
              'reportType', NEW.tax_type,
              'reportYear', NEW.tax_year,
              'previousStatus', OLD.status,
              'newStatus', NEW.status,
              'actionUrl', COALESCE(
                current_setting('app.frontend_url', true),
                (SELECT value FROM app_secrets WHERE key = 'frontend_url'),
                'https://taxstreamline-ai.lovable.app'
              ) || '/tax'
            )
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 6: Add comprehensive RLS policies for tp_document_shares table
-- First drop any existing policies
DROP POLICY IF EXISTS "Users can create share links for owned documents" ON tp_document_shares;
DROP POLICY IF EXISTS "Users can view own share links" ON tp_document_shares;
DROP POLICY IF EXISTS "Users can update own share links" ON tp_document_shares;
DROP POLICY IF EXISTS "Users can delete own share links" ON tp_document_shares;

-- Policy: Users can create share links for documents they own
CREATE POLICY "Users can create share links for owned documents"
ON tp_document_shares FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM transfer_pricing_documents
    WHERE id = tp_document_shares.document_id
    AND created_by = auth.uid()
  )
);

-- Policy: Users can view their own share links
CREATE POLICY "Users can view own share links"
ON tp_document_shares FOR SELECT
USING (auth.uid() = created_by);

-- Policy: Users can update their own share links
CREATE POLICY "Users can update own share links"
ON tp_document_shares FOR UPDATE
USING (auth.uid() = created_by);

-- Policy: Users can delete their own share links
CREATE POLICY "Users can delete own share links"
ON tp_document_shares FOR DELETE
USING (auth.uid() = created_by);

-- Step 7: Create a safe view that excludes password_hash for application queries
CREATE OR REPLACE VIEW public.tp_document_shares_safe AS
SELECT 
  id,
  document_id,
  share_token,
  access_level,
  CASE WHEN password_hash IS NOT NULL THEN true ELSE false END as has_password,
  expires_at,
  max_uses,
  current_uses,
  created_by,
  created_at
FROM tp_document_shares;

-- Grant access to the safe view
GRANT SELECT ON public.tp_document_shares_safe TO authenticated;