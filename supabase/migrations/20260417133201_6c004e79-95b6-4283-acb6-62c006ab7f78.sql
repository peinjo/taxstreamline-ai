ALTER TABLE public.filing_packs
  ADD COLUMN IF NOT EXISTS firs_reference TEXT,
  ADD COLUMN IF NOT EXISTS submission_notes TEXT,
  ADD COLUMN IF NOT EXISTS payment_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS payment_date DATE;

-- Make sure storage bucket for proofs exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('filing-proofs', 'filing-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for proofs bucket: users can manage only their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'filing-proofs: users read own'
  ) THEN
    CREATE POLICY "filing-proofs: users read own"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'filing-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'filing-proofs: users upload own'
  ) THEN
    CREATE POLICY "filing-proofs: users upload own"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'filing-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'filing-proofs: users update own'
  ) THEN
    CREATE POLICY "filing-proofs: users update own"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'filing-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'filing-proofs: users delete own'
  ) THEN
    CREATE POLICY "filing-proofs: users delete own"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'filing-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;