
-- 1. Fix invoice share token self-join bug (CRITICAL: exposes all invoices publicly)
DROP POLICY IF EXISTS "Anyone can view invoices via share token" ON public.invoices;

-- Note: We intentionally do NOT recreate a public-read policy here.
-- Public invoice viewing should go through the dedicated edge function
-- (validate-share-link) using the service role, per the project's
-- share-link architecture. This eliminates the broken policy entirely.

-- 2. Restrict global_compliance writes to admins only
DROP POLICY IF EXISTS "Authenticated users can manage global compliance" ON public.global_compliance;

CREATE POLICY "Admins can insert global compliance"
ON public.global_compliance
FOR INSERT
TO authenticated
WITH CHECK (public.has_role('admin'::app_role));

CREATE POLICY "Admins can update global compliance"
ON public.global_compliance
FOR UPDATE
TO authenticated
USING (public.has_role('admin'::app_role))
WITH CHECK (public.has_role('admin'::app_role));

CREATE POLICY "Admins can delete global compliance"
ON public.global_compliance
FOR DELETE
TO authenticated
USING (public.has_role('admin'::app_role));

-- 3. Fix privilege escalation on user_roles (any user could grant themselves admin)
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- Only admins can assign roles. The handle_new_user() trigger uses
-- SECURITY DEFINER and bypasses RLS, so default 'user' role assignment
-- on signup continues to work.
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role('admin'::app_role));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role('admin'::app_role))
WITH CHECK (public.has_role('admin'::app_role));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role('admin'::app_role));

-- 4. Fix mutable search_path on log_organization_activity
CREATE OR REPLACE FUNCTION public.log_organization_activity(org_id bigint, action text, details jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.organization_activities (organization_id, user_id, action, details)
  VALUES (org_id, auth.uid(), action, details);
END;
$function$;

-- 5. Add INSERT policy for tp_audit_log so the trigger_tp_audit_log() trigger
-- (which runs as the invoking user when not SECURITY DEFINER on the source row)
-- and any direct logging works. The function log_tp_audit_event() is SECURITY DEFINER
-- so it bypasses RLS, but we add a defensive policy for service role / definers.
CREATE POLICY "System can insert audit logs"
ON public.tp_audit_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
