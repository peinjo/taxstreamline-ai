-- Fix SECURITY DEFINER functions with proper role checks

-- Fix clean_old_logs to require admin role
CREATE OR REPLACE FUNCTION public.clean_old_logs(days_to_keep integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only admins can clean logs
  IF NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Only administrators can clean logs';
  END IF;

  DELETE FROM public.application_logs
  WHERE created_at < now() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Fix get_log_statistics to verify permission
CREATE OR REPLACE FUNCTION public.get_log_statistics(
  p_user_id uuid DEFAULT NULL::uuid, 
  p_start_date timestamp with time zone DEFAULT (now() - '7 days'::interval), 
  p_end_date timestamp with time zone DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSONB;
  effective_user_id UUID;
BEGIN
  -- Permission check: user can only see their own stats unless admin
  IF p_user_id IS NOT NULL AND p_user_id != auth.uid() AND NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Permission denied: cannot access other user statistics';
  END IF;
  
  -- If no user_id provided, use current user (unless admin requesting all)
  effective_user_id := COALESCE(p_user_id, auth.uid());
  
  SELECT jsonb_build_object(
    'total_logs', COUNT(*),
    'errors', COUNT(*) FILTER (WHERE level = 'ERROR'),
    'warnings', COUNT(*) FILTER (WHERE level = 'WARN'),
    'info', COUNT(*) FILTER (WHERE level = 'INFO'),
    'debug', COUNT(*) FILTER (WHERE level = 'DEBUG'),
    'avg_duration', ROUND(AVG(duration), 2),
    'by_component', (
      SELECT jsonb_object_agg(component, count)
      FROM (
        SELECT component, COUNT(*) as count
        FROM public.application_logs
        WHERE (effective_user_id IS NULL OR user_id = effective_user_id)
          AND created_at BETWEEN p_start_date AND p_end_date
          AND component IS NOT NULL
        GROUP BY component
        ORDER BY count DESC
        LIMIT 10
      ) component_stats
    )
  ) INTO stats
  FROM public.application_logs
  WHERE (effective_user_id IS NULL OR user_id = effective_user_id)
    AND created_at BETWEEN p_start_date AND p_end_date;
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$;

-- Also update storage policy to require authentication for profile pictures
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Allow public read access to profile pictures" ON storage.objects;

-- Create authenticated-only access policy
CREATE POLICY "Authenticated users can view profile pictures" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'profiles');