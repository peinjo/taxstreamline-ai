-- Create document audit logs table
CREATE TABLE public.document_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES public.document_metadata(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  action VARCHAR NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own document audit logs"
ON public.document_audit_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create audit logs for their documents"
ON public.document_audit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_document_audit_logs_document_id ON public.document_audit_logs(document_id);
CREATE INDEX idx_document_audit_logs_user_id ON public.document_audit_logs(user_id);
CREATE INDEX idx_document_audit_logs_created_at ON public.document_audit_logs(created_at DESC);