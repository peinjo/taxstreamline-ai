-- Add missing RLS policies for tables that need them

-- tp_approval_workflows policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_approval_workflows' 
    AND policyname = 'Users can manage workflows for their documents'
  ) THEN
    CREATE POLICY "Users can manage workflows for their documents" 
    ON public.tp_approval_workflows FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.transfer_pricing_documents tpd 
        WHERE tpd.id = tp_approval_workflows.document_id 
        AND tpd.created_by = auth.uid()
      )
    );
  END IF;
END $$;

-- tp_client_portal policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_client_portal' 
    AND policyname = 'Users can access their client portal'
  ) THEN
    CREATE POLICY "Users can access their client portal" 
    ON public.tp_client_portal FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- tp_compliance_tracker policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_compliance_tracker' 
    AND policyname = 'Users can manage their compliance tracking'
  ) THEN
    CREATE POLICY "Users can manage their compliance tracking" 
    ON public.tp_compliance_tracker FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- tp_currency_rates policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_currency_rates' 
    AND policyname = 'Anyone can view currency rates'
  ) THEN
    CREATE POLICY "Anyone can view currency rates" 
    ON public.tp_currency_rates FOR SELECT 
    USING (true);
  END IF;
END $$;

-- tp_file_metadata policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_file_metadata' 
    AND policyname = 'Users can manage their file metadata'
  ) THEN
    CREATE POLICY "Users can manage their file metadata" 
    ON public.tp_file_metadata FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- tp_risk_assessments policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tp_risk_assessments' 
    AND policyname = 'Users can manage their risk assessments'
  ) THEN
    CREATE POLICY "Users can manage their risk assessments" 
    ON public.tp_risk_assessments FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;