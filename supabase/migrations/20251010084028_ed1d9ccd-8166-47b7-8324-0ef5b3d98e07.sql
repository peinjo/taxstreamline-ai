-- Add feature unlock columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS unlocked_features JSONB DEFAULT '{"basic": true}'::jsonb,
ADD COLUMN IF NOT EXISTS feature_usage_stats JSONB DEFAULT '{}'::jsonb;

-- Create index for faster queries on unlocked features
CREATE INDEX IF NOT EXISTS idx_user_profiles_unlocked_features ON user_profiles USING GIN (unlocked_features);

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.unlocked_features IS 'Tracks which features the user has unlocked based on their activity';
COMMENT ON COLUMN user_profiles.feature_usage_stats IS 'Stores activity counters for feature unlock thresholds (tax_reports_count, documents_count, etc.)';