-- Drop overly permissive policies on legacy tables with capital letters
DROP POLICY IF EXISTS "Users can view all activities" ON "Activities";
DROP POLICY IF EXISTS "Users can view all deadlines" ON "Deadlines";
DROP POLICY IF EXISTS "Users can view all dashboard metrics" ON "Dashboard Metrics";

-- Create restrictive policies - only admins can access these legacy tables
CREATE POLICY "Only admins can view Activities"
ON "Activities" FOR SELECT
USING (public.has_role('admin'::app_role));

CREATE POLICY "Only admins can view Deadlines"  
ON "Deadlines" FOR SELECT
USING (public.has_role('admin'::app_role));

CREATE POLICY "Only admins can view Dashboard Metrics"
ON "Dashboard Metrics" FOR SELECT
USING (public.has_role('admin'::app_role));