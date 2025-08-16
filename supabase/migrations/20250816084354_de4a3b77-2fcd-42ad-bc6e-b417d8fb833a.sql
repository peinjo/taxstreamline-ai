-- Fix Security Issue: Ensure activities and deadlines are completely private
-- Handle existing policies properly

-- Tighten activities table policies
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Users can create their own activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users can create activities" ON activities;

-- Create comprehensive policies for activities table
CREATE POLICY "Users can view only their own activities" 
ON activities FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
ON activities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" 
ON activities FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" 
ON activities FOR DELETE 
USING (auth.uid() = user_id);

-- Tighten deadlines table policies
DROP POLICY IF EXISTS "Users can view their own deadlines" ON deadlines;

CREATE POLICY "Users can view only their own deadlines" 
ON deadlines FOR SELECT 
USING (auth.uid() = user_id);

-- Clean up any potentially exposed data without user association
-- First check if there are any NULL user_id records and delete them
DELETE FROM activities WHERE user_id IS NULL;
DELETE FROM deadlines WHERE user_id IS NULL;

-- Make user_id NOT NULL to prevent future data leaks
ALTER TABLE activities ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE deadlines ALTER COLUMN user_id SET NOT NULL;

-- Fix document_comments to be more restrictive
DROP POLICY IF EXISTS "Allow users to read all document comments" ON document_comments;
DROP POLICY IF EXISTS "Select document comments" ON document_comments;
DROP POLICY IF EXISTS "Users can view document comments" ON document_comments;

-- Create a more secure policy for document comments (only authenticated users can view)
CREATE POLICY "Authenticated users can view document comments" 
ON document_comments FOR SELECT 
USING (auth.uid() IS NOT NULL);