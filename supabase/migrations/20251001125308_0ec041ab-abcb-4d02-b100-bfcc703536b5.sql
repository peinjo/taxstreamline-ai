-- Add RLS policies for tables missing them (corrected version)

-- Policies for Activities table (with capital A)
CREATE POLICY "Users can view all activities"
ON "Activities"
FOR SELECT
USING (true);

CREATE POLICY "System can insert activities"
ON "Activities"
FOR INSERT
WITH CHECK (true);

-- Policies for Dashboard Metrics table (with capitals)
CREATE POLICY "Users can view all dashboard metrics"
ON "Dashboard Metrics"
FOR SELECT
USING (true);

CREATE POLICY "System can manage dashboard metrics"
ON "Dashboard Metrics"
FOR ALL
USING (true);

-- Policies for Deadlines table (with capital D)
CREATE POLICY "Users can view all deadlines"
ON "Deadlines"
FOR SELECT
USING (true);

CREATE POLICY "System can insert deadlines"
ON "Deadlines"
FOR INSERT
WITH CHECK (true);