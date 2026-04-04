-- Fix: make full_name and address nullable so the signup trigger doesn't fail
ALTER TABLE public.user_profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN address DROP NOT NULL;