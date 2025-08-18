-- Critical Security Fix: Database function search paths
-- Fix all database functions to have secure search paths

-- Fix handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Recreate trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix create_document_version function
CREATE OR REPLACE FUNCTION public.create_document_version(p_document_id uuid, p_content jsonb, p_changes_summary text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_version_number integer;
  v_version_id uuid;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO v_version_number
  FROM document_versions 
  WHERE document_id = p_document_id;
  
  -- Create new version record
  INSERT INTO document_versions (
    document_id, 
    version_number, 
    content, 
    changes_summary, 
    created_by
  ) VALUES (
    p_document_id,
    v_version_number,
    p_content,
    p_changes_summary,
    auth.uid()
  ) RETURNING id INTO v_version_id;
  
  -- Update main document with new version
  UPDATE transfer_pricing_documents 
  SET 
    version = v_version_number,
    content = p_content,
    updated_at = now()
  WHERE id = p_document_id;
  
  RETURN v_version_id;
END;
$function$;

-- Fix increment_kb_view_count function
CREATE OR REPLACE FUNCTION public.increment_kb_view_count(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE tp_knowledge_base 
  SET view_count = view_count + 1 
  WHERE id = article_id;
END;
$function$;

-- Fix log_organization_activity function
CREATE OR REPLACE FUNCTION public.log_organization_activity(org_id bigint, action text, details jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO organization_activities (organization_id, user_id, action, details)
  VALUES (org_id, auth.uid(), action, details);
END;
$function$;

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(required_role app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
    AND role = required_role
  );
$function$;

-- Add missing RLS policies for tables without them

-- Add RLS policies for Activities table (capitalized)
DROP POLICY IF EXISTS "Users can view their own activities" ON "Activities";
CREATE POLICY "Users can view their own activities" 
ON "Activities" FOR SELECT 
USING (auth.uid()::text = text::text);

-- Add RLS policies for Dashboard Metrics table  
DROP POLICY IF EXISTS "Users can view dashboard metrics" ON "Dashboard Metrics";
CREATE POLICY "Users can view dashboard metrics" 
ON "Dashboard Metrics" FOR SELECT 
USING (true); -- Dashboard metrics can be viewed by authenticated users

-- Add RLS policies for Deadlines table (capitalized)
DROP POLICY IF EXISTS "Users can view their own deadlines" ON "Deadlines";
CREATE POLICY "Users can view their own deadlines" 
ON "Deadlines" FOR SELECT 
USING (auth.uid()::text = "Text"::text);

-- Enable RLS on tp_analytics_data table if not already enabled
ALTER TABLE tp_analytics_data ENABLE ROW LEVEL SECURITY;

-- Add missing policies for tp_analytics_data
CREATE POLICY "Users can manage their own analytics data" 
ON tp_analytics_data FOR ALL 
USING (auth.uid() = user_id);

-- Enable RLS on tp_approval_steps table if not already enabled  
ALTER TABLE tp_approval_steps ENABLE ROW LEVEL SECURITY;

-- Add policies for tp_approval_steps
CREATE POLICY "Users can view approval steps for accessible workflows" 
ON tp_approval_steps FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tp_approval_workflows w
    INNER JOIN tp_document_teams dt ON w.document_id = dt.document_id
    WHERE w.id = tp_approval_steps.workflow_id
    AND dt.user_id = auth.uid()
  ) OR 
  approver_user_id = auth.uid()
);

CREATE POLICY "Approvers can update their assigned steps" 
ON tp_approval_steps FOR UPDATE 
USING (approver_user_id = auth.uid());

-- Enable RLS on tp_approval_workflows table if not already enabled
ALTER TABLE tp_approval_workflows ENABLE ROW LEVEL SECURITY;