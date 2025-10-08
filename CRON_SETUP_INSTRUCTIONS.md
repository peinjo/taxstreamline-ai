# Email Notification Cron Setup

This document explains how to set up automated deadline reminder emails using Supabase cron jobs.

## Prerequisites

1. Supabase project with `pg_cron` and `pg_net` extensions enabled
2. Resend API key configured in Supabase secrets (`RESEND_API_KEY`)
3. Edge functions deployed (`send-email` and `check-deadlines`)

## Enable Required Extensions

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

## Set Up Daily Deadline Checker

This cron job runs every day at 9:00 AM UTC to check for upcoming deadlines and send reminder emails:

```sql
SELECT cron.schedule(
  'daily-deadline-check',
  '0 9 * * *', -- Every day at 9:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://ukuhdrsywxbuhcytjfog.supabase.co/functions/v1/check-deadlines',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWhkcnN5d3hidWhjeXRqZm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MzI2NzEsImV4cCI6MjA0ODAwODY3MX0.98XpogU4WCMXHboFgYjjR8JCYzUav7HIKwohUkRB9zE"}'::jsonb
  ) as request_id;
  $$
);
```

## Verify Cron Job Status

Check if your cron job is scheduled:

```sql
SELECT * FROM cron.job;
```

## Manually Trigger for Testing

To test the deadline checker immediately without waiting for the scheduled time:

```sql
SELECT net.http_post(
  url := 'https://ukuhdrsywxbuhcytjfog.supabase.co/functions/v1/check-deadlines',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWhkcnN5d3hidWhjeXRqZm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MzI2NzEsImV4cCI6MjA0ODAwODY3MX0.98XpogU4WCMXHboFgYjjR8JCYzUav7HIKwohUkRB9zE"}'::jsonb
) as request_id;
```

## Cron Schedule Syntax

The cron syntax follows standard format:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, Sunday to Saturday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Common Schedules

- `0 9 * * *` - Daily at 9:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1` - Every Monday at 9:00 AM
- `*/30 * * * *` - Every 30 minutes

## Unschedule a Cron Job

To remove a cron job:

```sql
SELECT cron.unschedule('daily-deadline-check');
```

## Email Notification Features

### 1. Deadline Reminders
- Automatically sent 7, 3, and 1 day(s) before deadlines
- Includes compliance items and global deadlines
- Users can customize reminder days in Settings → Email Notifications

### 2. Compliance Alerts
- Triggered when compliance items become overdue
- Sent via database trigger (automatic)
- Can be disabled in user preferences

### 3. Report Status Updates
- Sent when tax report status changes
- Triggered via database trigger (automatic)
- Can be disabled in user preferences

## Email Templates

All email templates are React Email components located in:
- `supabase/functions/send-email/_templates/deadline-reminder.tsx`
- `supabase/functions/send-email/_templates/compliance-alert.tsx`
- `supabase/functions/send-email/_templates/report-status.tsx`

## Resend Configuration

Make sure your Resend account is properly configured:

1. **Verify Domain**: https://resend.com/domains
2. **Create API Key**: https://resend.com/api-keys
3. **Update "From" Address**: Edit the `from` field in `send-email/index.ts` to use your verified domain

Example:
```typescript
from: "Tax Compliance <notifications@yourdomain.com>"
```

## Monitoring

### Check Edge Function Logs
View logs for the email functions in your Supabase dashboard:
- https://supabase.com/dashboard/project/ukuhdrsywxbuhcytjfog/functions/send-email/logs
- https://supabase.com/dashboard/project/ukuhdrsywxbuhcytjfog/functions/check-deadlines/logs

### Check Cron Job History
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-deadline-check')
ORDER BY start_time DESC
LIMIT 10;
```

## Troubleshooting

### Emails Not Sending
1. Verify Resend API key is set correctly
2. Check edge function logs for errors
3. Ensure `pg_net` extension is enabled
4. Verify domain is validated in Resend

### Cron Job Not Running
1. Check if `pg_cron` extension is enabled
2. Verify cron job is scheduled: `SELECT * FROM cron.job;`
3. Check cron execution logs
4. Ensure edge function URL is correct

### Users Not Receiving Emails
1. Check user's email preferences in database
2. Verify email address is correct in user_profiles
3. Check spam folder
4. Review Resend dashboard for delivery status
