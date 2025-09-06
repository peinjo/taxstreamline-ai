-- Fix infinite recursion in tp_user_roles by creating security definer function
-- and updating problematic policies

-- First, create a security definer function to check user roles without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  SELECT role FROM public.tp_user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Create another function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_tp_role(required_role TEXT)
RETURNS BOOLEAN 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tp_user_roles 
    WHERE user_id = auth.uid() AND role = required_role
  );
$$;

-- Drop existing problematic policies on tp_user_roles that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.tp_user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.tp_user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.tp_user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.tp_user_roles;

-- Create new safe policies for tp_user_roles
CREATE POLICY "Users can view their own tp roles" 
ON public.tp_user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tp roles" 
ON public.tp_user_roles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tp roles" 
ON public.tp_user_roles FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

-- Fix dashboard_metrics table to prevent NULL user_id exposure
-- Update existing NULL records to a system user approach
UPDATE public.dashboard_metrics 
SET user_id = auth.uid() 
WHERE user_id IS NULL AND auth.uid() IS NOT NULL;

-- Make user_id NOT NULL and update the policy
ALTER TABLE public.dashboard_metrics 
ALTER COLUMN user_id SET NOT NULL;

-- Update the policy to remove the NULL check
DROP POLICY IF EXISTS "Users can view their own dashboard metrics" ON public.dashboard_metrics;
CREATE POLICY "Users can view their own dashboard metrics" 
ON public.dashboard_metrics FOR SELECT 
USING (auth.uid() = user_id);

-- Add missing RLS policies for tables that have RLS enabled but no policies
-- Based on the linter warnings, let's add policies for tables that need them

-- tp_approval_workflows policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_approval_workflows' 
    AND policyname = 'Users can manage workflows for their documents'
  ) THEN
    CREATE POLICY "Users can manage workflows for their documents" 
    ON public.tp_approval_workflows FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.transfer_pricing_documents tpd 
        WHERE tpd.id = tp_approval_workflows.document_id 
        AND tpd.created_by = auth.uid()
      )
    );
  END IF;
END $$;

-- tp_client_portal policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_client_portal' 
    AND policyname = 'Users can access their client portal'
  ) THEN
    CREATE POLICY "Users can access their client portal" 
    ON public.tp_client_portal FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- tp_compliance_tracker policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_compliance_tracker' 
    AND policyname = 'Users can manage their compliance tracking'
  ) THEN
    CREATE POLICY "Users can manage their compliance tracking" 
    ON public.tp_compliance_tracker FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- tp_currency_rates policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_currency_rates' 
    AND policyname = 'Anyone can view currency rates'
  ) THEN
    CREATE POLICY "Anyone can view currency rates" 
    ON public.tp_currency_rates FOR SELECT 
    USING (true);
  END IF;
END $$;

-- tp_file_metadata policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_file_metadata' 
    AND policyname = 'Users can manage their file metadata'
  ) THEN
    CREATE POLICY "Users can manage their file metadata" 
    ON public.tp_file_metadata FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- tp_risk_assessments policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_risk_assessments' 
    AND policyname = 'Users can manage their risk assessments'
  ) THEN
    CREATE POLICY "Users can manage their risk assessments" 
    ON public.tp_risk_assessments FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;