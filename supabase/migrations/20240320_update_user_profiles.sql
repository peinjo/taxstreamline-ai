-- Add new columns to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for profile pictures if it doesn't exist
INSERT INTO storage.buckets (id, name)
SELECT 'profiles', 'profiles'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profiles'
);

-- Set up storage policy to allow authenticated users to upload their own profile pictures
CREATE POLICY "Allow users to upload their own profile picture" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'profiles' AND
        (storage.foldername(name))[1] = 'avatars'
    );

CREATE POLICY "Allow users to update their own profile picture" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'profiles' AND
        (storage.foldername(name))[1] = 'avatars'
    );

CREATE POLICY "Allow public read access to profile pictures" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'profiles');