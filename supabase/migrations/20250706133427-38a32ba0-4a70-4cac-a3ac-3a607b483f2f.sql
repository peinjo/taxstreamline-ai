-- Phase 6: Collaboration & Security Database Schema

-- Transfer Pricing specific user roles and permissions
CREATE TABLE IF NOT EXISTS tp_user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'analyst', 'reviewer', 'client')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Document comments and reviews
CREATE TABLE IF NOT EXISTS tp_document_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES tp_document_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'comment' CHECK (comment_type IN ('comment', 'suggestion', 'approval', 'rejection')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document approval workflows
CREATE TABLE IF NOT EXISTS tp_approval_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  workflow_name TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Approval workflow steps
CREATE TABLE IF NOT EXISTS tp_approval_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES tp_approval_workflows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  approver_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  approver_role TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(workflow_id, step_number)
);

-- Team assignments for documents
CREATE TABLE IF NOT EXISTS tp_document_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'reviewer', 'viewer')),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(document_id, user_id)
);

-- Comprehensive audit log
CREATE TABLE IF NOT EXISTS tp_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Client portal access controls
CREATE TABLE IF NOT EXISTS tp_client_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL,
  access_level TEXT DEFAULT 'view' CHECK (access_level IN ('view', 'comment', 'download')),
  expires_at TIMESTAMP WITH TIME ZONE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_user_id, document_id)
);

-- Document sharing links
CREATE TABLE IF NOT EXISTS tp_document_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
  access_level TEXT DEFAULT 'view' CHECK (access_level IN ('view', 'comment', 'download')),
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE tp_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_document_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_client_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_document_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tp_user_roles
CREATE POLICY "Users can view their own roles" ON tp_user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON tp_user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tp_user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for tp_document_comments
CREATE POLICY "Users can view comments on accessible documents" ON tp_document_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tp_document_teams dt
      WHERE dt.document_id = tp_document_comments.document_id 
      AND dt.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM tp_user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can create comments on accessible documents" ON tp_document_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tp_document_teams dt
      WHERE dt.document_id = tp_document_comments.document_id 
      AND dt.user_id = auth.uid()
      AND dt.role IN ('owner', 'editor', 'reviewer')
    )
  );

-- RLS Policies for tp_approval_workflows
CREATE POLICY "Users can view workflows for accessible documents" ON tp_approval_workflows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tp_document_teams dt
      WHERE dt.document_id = tp_approval_workflows.document_id 
      AND dt.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM tp_user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'manager')
    )
  );

-- RLS Policies for tp_audit_log  
CREATE POLICY "Admins and managers can view audit logs" ON tp_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tp_user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'manager')
    )
  );

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_tp_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO tp_audit_log (
    user_id, action, resource_type, resource_id, 
    old_values, new_values, metadata
  ) VALUES (
    auth.uid(), p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_metadata
  );
END;
$$;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_tp_permission(
  p_user_id UUID,
  p_permission TEXT,
  p_document_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Trigger to auto-create audit logs for document changes
CREATE OR REPLACE FUNCTION trigger_tp_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
$$;

-- Add audit triggers to key tables
CREATE TRIGGER tp_audit_trigger_entities
  AFTER INSERT OR UPDATE OR DELETE ON tp_entities
  FOR EACH ROW EXECUTE FUNCTION trigger_tp_audit_log();

CREATE TRIGGER tp_audit_trigger_transactions  
  AFTER INSERT OR UPDATE OR DELETE ON tp_transactions
  FOR EACH ROW EXECUTE FUNCTION trigger_tp_audit_log();

CREATE TRIGGER tp_audit_trigger_documents
  AFTER INSERT OR UPDATE OR DELETE ON transfer_pricing_documents
  FOR EACH ROW EXECUTE FUNCTION trigger_tp_audit_log();