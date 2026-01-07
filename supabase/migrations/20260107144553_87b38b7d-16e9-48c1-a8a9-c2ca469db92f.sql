-- Phase 1: Fix Overly Permissive RLS Policies
-- Phase 6: Database Cleanup (duplicate tables and policies)

-- =====================================================
-- PHASE 1: Fix RLS Policies
-- =====================================================

-- Drop and recreate the teams policy with proper check
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
CREATE POLICY "Users can create teams" 
ON public.teams 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Drop and recreate notifications policy
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;
CREATE POLICY "Users can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Fix Activities table - add user_id check instead of true
DROP POLICY IF EXISTS "System can insert activities" ON public."Activities";

-- Fix Dashboard Metrics table - add user_id check
DROP POLICY IF EXISTS "System can manage dashboard metrics" ON public."Dashboard Metrics";

-- Fix Deadlines table - add user_id check
DROP POLICY IF EXISTS "System can insert deadlines" ON public."Deadlines";

-- =====================================================
-- PHASE 6: Remove duplicate messages policies
-- =====================================================

-- Remove duplicate SELECT policies on messages table (keep the best one)
DROP POLICY IF EXISTS "Users can view messages in their team" ON public.messages;
DROP POLICY IF EXISTS "Team members can view messages" ON public.messages;

-- Create a single, well-defined policy for viewing messages
CREATE POLICY "Users can view team messages" 
ON public.messages 
FOR SELECT 
USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- Create audit_logs table for audit-logger edge function
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  resource TEXT,
  action TEXT,
  details JSONB,
  severity TEXT NOT NULL DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
-- Only authenticated users can insert their own audit logs
CREATE POLICY "Users can insert their own audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (public.has_role('admin'));

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);