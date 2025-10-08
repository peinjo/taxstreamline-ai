-- Add email preferences to user profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS deadline_reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1],
ADD COLUMN IF NOT EXISTS compliance_alerts_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS report_status_updates_enabled BOOLEAN DEFAULT true;

-- Create function to send compliance alert when status changes to overdue
CREATE OR REPLACE FUNCTION notify_compliance_overdue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  notifications_enabled BOOLEAN;
BEGIN
  -- Only trigger for status changes to 'overdue'
  IF NEW.status = 'overdue' AND (OLD.status IS NULL OR OLD.status != 'overdue') THEN
    -- Get user email and preferences
    SELECT up.email, up.display_name, up.compliance_alerts_enabled
    INTO user_email, user_name, notifications_enabled
    FROM user_profiles up
    WHERE up.user_id = NEW.user_id;

    -- Send notification if enabled
    IF notifications_enabled AND user_email IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://ukuhdrsywxbuhcytjfog.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWhkcnN5d3hidWhjeXRqZm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MzI2NzEsImV4cCI6MjA0ODAwODY3MX0.98XpogU4WCMXHboFgYjjR8JCYzUav7HIKwohUkRB9zE'
        ),
        body := jsonb_build_object(
          'type', 'compliance',
          'to', user_email,
          'data', jsonb_build_object(
            'userName', COALESCE(user_name, 'User'),
            'itemTitle', NEW.title,
            'status', NEW.status,
            'priority', NEW.priority,
            'country', NEW.country,
            'requirementType', NEW.requirement_type,
            'actionUrl', 'https://ukuhdrsywxbuhcytjfog.lovable.app/compliance'
          )
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for compliance status changes
DROP TRIGGER IF EXISTS compliance_overdue_notification ON compliance_items;
CREATE TRIGGER compliance_overdue_notification
  AFTER UPDATE ON compliance_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_compliance_overdue();

-- Create function to send report status update
CREATE OR REPLACE FUNCTION notify_report_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  notifications_enabled BOOLEAN;
BEGIN
  -- Only trigger if status actually changed
  IF NEW.status != OLD.status THEN
    -- Get user email and preferences
    SELECT up.email, up.display_name, up.report_status_updates_enabled
    INTO user_email, user_name, notifications_enabled
    FROM user_profiles up
    WHERE up.user_id = NEW.user_id;

    -- Send notification if enabled
    IF notifications_enabled AND user_email IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://ukuhdrsywxbuhcytjfog.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWhkcnN5d3hidWhjeXRqZm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MzI2NzEsImV4cCI6MjA0ODAwODY3MX0.98XpogU4WCMXHboFgYjjR8JCYzUav7HIKwohUkRB9zE'
        ),
        body := jsonb_build_object(
          'type', 'report_status',
          'to', user_email,
          'data', jsonb_build_object(
            'userName', COALESCE(user_name, 'User'),
            'reportType', NEW.tax_type,
            'reportYear', NEW.tax_year,
            'previousStatus', OLD.status,
            'newStatus', NEW.status,
            'actionUrl', 'https://ukuhdrsywxbuhcytjfog.lovable.app/tax'
          )
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;