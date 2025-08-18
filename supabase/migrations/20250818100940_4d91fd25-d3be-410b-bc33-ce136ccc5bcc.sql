-- Fix remaining security functions search paths
-- Fix the remaining functions that need secure search paths

-- Fix trigger_tp_audit_log function
CREATE OR REPLACE FUNCTION public.trigger_tp_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_tp_audit_event(
      'INSERT',
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      row_to_json(NEW),
      jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_tp_audit_event(
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(OLD),
      row_to_json(NEW),
      jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_tp_audit_event(
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      row_to_json(OLD),
      NULL,
      jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix calculate_risk_trends function
CREATE OR REPLACE FUNCTION public.calculate_risk_trends(p_user_id uuid, p_period text DEFAULT '12_months'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  trend_data JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', date_trunc('month', created_at),
      'avg_risk_level', AVG(
        CASE 
          WHEN risk_level = 'low' THEN 1
          WHEN risk_level = 'medium' THEN 2
          WHEN risk_level = 'high' THEN 3
          ELSE 2
        END
      ),
      'entity_count', COUNT(*)
    )
    ORDER BY date_trunc('month', created_at)
  ) INTO trend_data
  FROM tp_entities 
  WHERE user_id = p_user_id 
    AND created_at >= (
      CASE 
        WHEN p_period = '6_months' THEN now() - INTERVAL '6 months'
        WHEN p_period = '12_months' THEN now() - INTERVAL '12 months'
        WHEN p_period = '24_months' THEN now() - INTERVAL '24 months'
        ELSE now() - INTERVAL '12 months'
      END
    )
  GROUP BY date_trunc('month', created_at);
  
  RETURN COALESCE(trend_data, '[]'::jsonb);
END;
$function$;

-- Fix check_tp_permission function
CREATE OR REPLACE FUNCTION public.check_tp_permission(p_user_id uuid, p_permission text, p_document_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_role TEXT;
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Check if user is admin or manager (global permissions)
  SELECT role INTO user_role
  FROM tp_user_roles 
  WHERE user_id = p_user_id AND role IN ('admin', 'manager')
  LIMIT 1;
  
  IF user_role IN ('admin', 'manager') THEN
    RETURN TRUE;
  END IF;
  
  -- Check document-specific permissions if document_id provided
  IF p_document_id IS NOT NULL THEN
    SELECT COUNT(*) > 0 INTO has_permission
    FROM tp_document_teams dt
    WHERE dt.user_id = p_user_id 
    AND dt.document_id = p_document_id
    AND (
      (p_permission = 'view' AND dt.role IN ('owner', 'editor', 'reviewer', 'viewer')) OR
      (p_permission = 'edit' AND dt.role IN ('owner', 'editor')) OR
      (p_permission = 'review' AND dt.role IN ('owner', 'reviewer')) OR
      (p_permission = 'admin' AND dt.role = 'owner')
    );
  END IF;
  
  RETURN has_permission;
END;
$function$;

-- Fix log_tp_audit_event function
CREATE OR REPLACE FUNCTION public.log_tp_audit_event(p_action text, p_resource_type text, p_resource_id uuid DEFAULT NULL::uuid, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO tp_audit_log (
    user_id, action, resource_type, resource_id, 
    old_values, new_values, metadata
  ) VALUES (
    auth.uid(), p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_metadata
  );
END;
$function$;