-- Create application logs table
CREATE TABLE IF NOT EXISTS public.application_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR', 'DEBUG')),
  message TEXT NOT NULL,
  component TEXT,
  action TEXT,
  error_message TEXT,
  error_stack TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  duration NUMERIC,
  endpoint TEXT,
  method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_application_logs_user_id ON public.application_logs(user_id);
CREATE INDEX idx_application_logs_level ON public.application_logs(level);
CREATE INDEX idx_application_logs_created_at ON public.application_logs(created_at DESC);
CREATE INDEX idx_application_logs_component ON public.application_logs(component);

-- Enable RLS
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own logs"
  ON public.application_logs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own logs"
  ON public.application_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create function to clean old logs (optional, for maintenance)
CREATE OR REPLACE FUNCTION public.clean_old_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.application_logs
  WHERE created_at < now() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create function to get log statistics
CREATE OR REPLACE FUNCTION public.get_log_statistics(
  p_user_id UUID DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT now() - INTERVAL '7 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSONB;
BEGIN
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
        WHERE (p_user_id IS NULL OR user_id = p_user_id)
          AND created_at BETWEEN p_start_date AND p_end_date
          AND component IS NOT NULL
        GROUP BY component
        ORDER BY count DESC
        LIMIT 10
      ) component_stats
    )
  ) INTO stats
  FROM public.application_logs
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND created_at BETWEEN p_start_date AND p_end_date;
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$;