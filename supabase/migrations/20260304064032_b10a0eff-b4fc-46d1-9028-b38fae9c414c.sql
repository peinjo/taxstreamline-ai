CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  -- Verify caller owns the user_id
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to generate invoice numbers for other users';
  END IF;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM invoices WHERE user_id = p_user_id;
  RETURN 'INV-' || LPAD(next_num::TEXT, 5, '0');
END;
$$;