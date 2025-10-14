-- Update existing user profiles to unlock bulk_operations feature
UPDATE user_profiles
SET unlocked_features = COALESCE(unlocked_features, '{}'::jsonb) || 
  '{"bulk_operations": true}'::jsonb
WHERE unlocked_features IS NULL 
  OR NOT (unlocked_features ? 'bulk_operations');