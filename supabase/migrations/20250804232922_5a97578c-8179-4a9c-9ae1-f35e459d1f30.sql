-- Priority 1: Fix Critical Security Issues
-- Enable RLS on tables flagged by linter

-- Enable RLS on calendar_events (already has policies)
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on activities  
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on deadlines
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

-- Enable RLS on dashboard_metrics
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for activities table
CREATE POLICY "Users can view all activities" 
ON activities FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create activities" 
ON activities FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add basic RLS policies for deadlines table
CREATE POLICY "Users can view all deadlines" 
ON deadlines FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage deadlines" 
ON deadlines FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add basic RLS policies for dashboard_metrics table
CREATE POLICY "Users can view all dashboard metrics" 
ON dashboard_metrics FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage dashboard metrics" 
ON dashboard_metrics FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Fix function security issues by setting search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_organization_activity(org_id bigint, action text, details jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO organization_activities (organization_id, user_id, action, details)
  VALUES (org_id, auth.uid(), action, details);
END;
$$;