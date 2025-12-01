-- Enable Row Level Security on tables
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON calendar_events;

DROP POLICY IF EXISTS "Users can create their own activities" ON activities;
DROP POLICY IF EXISTS "Users can view only their own activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;

DROP POLICY IF EXISTS "Users can create their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Users can view only their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Users can update their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Users can delete their own deadlines" ON deadlines;

DROP POLICY IF EXISTS "Users can create their own dashboard metrics" ON dashboard_metrics;
DROP POLICY IF EXISTS "Users can view their own dashboard metrics" ON dashboard_metrics;
DROP POLICY IF EXISTS "Users can update their own dashboard metrics" ON dashboard_metrics;
DROP POLICY IF EXISTS "Users can delete their own dashboard metrics" ON dashboard_metrics;

-- Calendar Events Policies
CREATE POLICY "Users can create their own calendar events"
ON calendar_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own calendar events"
ON calendar_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
ON calendar_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
ON calendar_events FOR DELETE
USING (auth.uid() = user_id);

-- Activities Policies
CREATE POLICY "Users can create their own activities"
ON activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own activities"
ON activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
ON activities FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
ON activities FOR DELETE
USING (auth.uid() = user_id);

-- Deadlines Policies
CREATE POLICY "Users can create their own deadlines"
ON deadlines FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own deadlines"
ON deadlines FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own deadlines"
ON deadlines FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deadlines"
ON deadlines FOR DELETE
USING (auth.uid() = user_id);

-- Dashboard Metrics Policies
CREATE POLICY "Users can create their own dashboard metrics"
ON dashboard_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own dashboard metrics"
ON dashboard_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard metrics"
ON dashboard_metrics FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard metrics"
ON dashboard_metrics FOR DELETE
USING (auth.uid() = user_id);