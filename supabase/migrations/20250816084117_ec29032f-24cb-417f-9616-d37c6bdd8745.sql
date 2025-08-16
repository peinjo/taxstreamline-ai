-- Fix Security Issue: Remove public access to user_profiles table

-- Drop the overly permissive policy that allows reading all profiles
DROP POLICY IF EXISTS "Allow users to read all profiles" ON user_profiles;

-- Ensure users can only view their own profile data
-- Keep the existing secure policies and remove any public ones
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;

-- Create a single, secure policy for viewing profiles
CREATE POLICY "Users can view only their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure the insert, update policies are secure (these look good already)
-- But let's recreate them to be sure they're properly restrictive

-- Drop and recreate insert policies to consolidate
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;

CREATE POLICY "Users can create their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Drop and recreate update policies to consolidate
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;

CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Verify no delete policy exists (profiles shouldn't be deletable by users)
-- This is good - users shouldn't be able to delete their profiles