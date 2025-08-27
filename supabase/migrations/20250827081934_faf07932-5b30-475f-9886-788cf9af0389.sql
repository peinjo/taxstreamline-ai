-- Fix critical security vulnerability: Restrict tp_templates access to authenticated users only
-- Remove the overly permissive public read policy
DROP POLICY IF EXISTS "Everyone can read templates" ON tp_templates;

-- Create secure policies for authenticated users only
CREATE POLICY "Authenticated users can read templates" 
ON tp_templates FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create templates" 
ON tp_templates FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update templates" 
ON tp_templates FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Keep the admin policy for full management access
-- (This policy already exists and is secure)