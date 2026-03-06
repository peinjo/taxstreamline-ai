
-- Create invoice_share_tokens table for public invoice payment links
CREATE TABLE IF NOT EXISTS public.invoice_share_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  is_active boolean DEFAULT true
);

ALTER TABLE public.invoice_share_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own invoice tokens" ON public.invoice_share_tokens
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invoices WHERE id = invoice_id AND user_id = auth.uid())
  );

CREATE POLICY "Anyone can view active tokens" ON public.invoice_share_tokens
  FOR SELECT TO anon USING (is_active = true AND expires_at > now());

CREATE POLICY "Anyone can view invoices via share token" ON public.invoices
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.invoice_share_tokens WHERE invoice_id = id AND is_active = true AND expires_at > now())
  );

CREATE POLICY "Anyone can view invoice items via share token" ON public.invoice_items
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.invoice_share_tokens ist 
      JOIN public.invoices i ON i.id = ist.invoice_id 
      WHERE i.id = invoice_id AND ist.is_active = true AND ist.expires_at > now()
    )
  );
