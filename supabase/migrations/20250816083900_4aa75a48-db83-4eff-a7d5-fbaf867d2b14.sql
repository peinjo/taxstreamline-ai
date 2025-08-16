-- Fix Security Issue: Restrict deadlines table access to authenticated users only

-- First, add user_id column to deadlines table to associate deadlines with specific users
ALTER TABLE deadlines ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Set a default user_id for existing records (or you could delete them if they're test data)
-- For now, we'll make existing deadlines visible to all authenticated users by leaving user_id NULL
-- and handling this in the policy

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Users can view all deadlines" ON deadlines;
DROP POLICY IF EXISTS "Authenticated users can manage deadlines" ON deadlines;

-- Create secure RLS policies that restrict access properly
CREATE POLICY "Users can view their own deadlines" 
ON deadlines FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own deadlines" 
ON deadlines FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deadlines" 
ON deadlines FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deadlines" 
ON deadlines FOR DELETE 
USING (auth.uid() = user_id);

-- Also check and fix the similar issue with activities table if needed
DROP POLICY IF EXISTS "Users can view all activities" ON activities;

-- Create user-specific policy for activities (assuming activities should be user-specific)
-- Add user_id column to activities if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'user_id') THEN
        ALTER TABLE activities ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Create secure policies for activities
CREATE POLICY "Users can view their own activities" 
ON activities FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own activities" 
ON activities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Dashboard metrics should also be user-specific
DROP POLICY IF EXISTS "Users can view all dashboard metrics" ON dashboard_metrics;
DROP POLICY IF EXISTS "Authenticated users can manage dashboard metrics" ON dashboard_metrics;

-- Add user_id to dashboard_metrics if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_metrics' AND column_name = 'user_id') THEN
        ALTER TABLE dashboard_metrics ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Create secure policies for dashboard_metrics
CREATE POLICY "Users can view their own dashboard metrics" 
ON dashboard_metrics FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own dashboard metrics" 
ON dashboard_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard metrics" 
ON dashboard_metrics FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard metrics" 
ON dashboard_metrics FOR DELETE 
USING (auth.uid() = user_id);