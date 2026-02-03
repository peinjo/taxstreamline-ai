-- Fix Security Definer View issue by recreating as SECURITY INVOKER (default)
DROP VIEW IF EXISTS public.tp_document_shares_safe;

-- Recreate view with explicit SECURITY INVOKER (default behavior, no special permissions)
CREATE VIEW public.tp_document_shares_safe
WITH (security_invoker = true)
AS
SELECT 
  id,
  document_id,
  share_token,
  access_level,
  CASE WHEN password_hash IS NOT NULL THEN true ELSE false END as has_password,
  expires_at,
  max_uses,
  current_uses,
  created_by,
  created_at
FROM tp_document_shares;

-- Grant access to authenticated users
GRANT SELECT ON public.tp_document_shares_safe TO authenticated;