-- Add missing email and display_name columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS display_name text;

-- Update existing user profile with email if it doesn't have one
UPDATE public.user_profiles
SET email = (SELECT email FROM auth.users WHERE id = user_profiles.user_id),
    display_name = COALESCE(display_name, full_name)
WHERE email IS NULL;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();