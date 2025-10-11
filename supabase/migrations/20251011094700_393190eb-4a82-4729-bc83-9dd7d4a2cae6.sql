-- Update existing user_profiles to have all core features unlocked
UPDATE user_profiles 
SET unlocked_features = jsonb_build_object(
  'basic', true,
  'transfer_pricing', true,
  'advanced_analytics', true,
  'compliance_tracker', true,
  'team_collaboration', true,
  'calendar_advanced', true,
  'audit_reporting', true
)
WHERE unlocked_features IS NULL 
   OR unlocked_features = '{}'::jsonb 
   OR unlocked_features = '{"basic": true}'::jsonb;