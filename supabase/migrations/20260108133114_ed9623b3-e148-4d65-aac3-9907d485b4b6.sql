-- Only fix the application_logs system logs policy since the user logs policy already exists
-- Drop the permissive system logs part if it still exists with OR user_id IS NULL in another policy
DROP POLICY IF EXISTS "Users can view all logs" ON public.application_logs;

-- Create admin-only policy for viewing system logs (where user_id IS NULL)
-- Check if this policy doesn't already exist before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'application_logs' 
    AND policyname = 'Admins can view system logs'
  ) THEN
    CREATE POLICY "Admins can view system logs"
    ON public.application_logs
    FOR SELECT
    TO authenticated
    USING (
      user_id IS NULL 
      AND EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND role = 'admin'
      )
    );
  END IF;
END $$;