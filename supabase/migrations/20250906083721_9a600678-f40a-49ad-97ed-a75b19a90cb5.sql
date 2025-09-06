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
-- First delete any NULL user_id records (they represent security vulnerabilities)
DELETE FROM public.dashboard_metrics WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE public.dashboard_metrics 
ALTER COLUMN user_id SET NOT NULL;

-- Update the policy to remove the NULL check
DROP POLICY IF EXISTS "Users can view their own dashboard metrics" ON public.dashboard_metrics;
CREATE POLICY "Users can view their own dashboard metrics" 
ON public.dashboard_metrics FOR SELECT 
USING (auth.uid() = user_id);