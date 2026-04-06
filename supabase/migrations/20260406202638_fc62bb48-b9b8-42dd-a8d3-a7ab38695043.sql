ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS deadline_notifications_enabled boolean DEFAULT true;