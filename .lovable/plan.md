

# TaxEase - Complete Functions Audit

After reviewing every page, hook, service, edge function, and database trigger, here is a full breakdown of what is not working or needs improvement.

---

## 1. BROKEN - Will Not Work At All

### 1.1 Database Triggers Missing for Report Status Notifications
The function `notify_report_status_change()` exists but is **not attached to any table as a trigger**. When a tax report's status changes, no email notification is sent. The trigger should be on the `tax_reports` table.

**Fix:** Create a migration to attach the trigger to `tax_reports`.

---

### 1.2 Duplicate Tables Causing Data Confusion
The database has **both** uppercase and lowercase versions of three tables:
- `Activities` and `activities`
- `Dashboard Metrics` and `dashboard_metrics`
- `Deadlines` and `deadlines`

The code references the lowercase versions. The uppercase ones appear to be leftover artifacts. This can cause confusion and wasted storage.

**Fix:** Migrate any data from the uppercase tables to lowercase, then drop the uppercase tables.

---

### 1.3 `check-deadlines` Edge Function Never Invoked
The function exists and works, but nothing calls it. No cron job, no client code. The client-side `useDeadlineChecker` hook does similar work but only for the currently logged-in user, and doesn't send emails/SMS.

**Fix:** Set up a `pg_cron` job to invoke `check-deadlines` daily, or remove the edge function if client-side is sufficient.

---

### 1.4 Email Sender Uses `onboarding@resend.dev`
The `send-email` edge function sends from `onboarding@resend.dev`, which is Resend's sandbox domain. Emails will likely be rejected or land in spam for real users. You need a verified custom domain.

**Fix:** Set up a custom domain in Resend and update the `from` address.

---

### 1.5 FIRS Filing is Simulated
`src/integrations/firs.ts` generates a fake reference number and never contacts the FIRS API. Users see "Tax filing submitted successfully" but nothing is actually filed.

**Status:** A "Draft Mode" banner was already added to the filing form. Verify it's visible and clear enough.

---

## 2. PARTIALLY WORKING - Functional But With Issues

### 2.1 Notification Service Uses Wrong Data Source
`src/services/notificationService.ts` queries the `deadlines` table, while `useDeadlineChecker` queries `calendar_events` and `compliance_rules`. Two systems check deadlines using different data, leading to inconsistent notifications.

**Fix:** Consolidate to use one source of truth (likely `calendar_events` + `compliance_items`).

---

### 2.2 Workflow Engine - DB Persistence Has ID Mismatch
The `WorkflowEngine.ts` generates IDs like `exec_1234567890` but tries to insert them into a UUID column. The code has a workaround (`execution.id.replace('exec_', '').length === 36 ? ...`) that will almost always fail since timestamps aren't 36 chars. The row is inserted without a proper ID, or fails silently.

**Fix:** Use `crypto.randomUUID()` for execution IDs, or let the DB generate them.

---

### 2.3 Workflow Engine - Notification Steps Are No-ops
The `sendNotification` method in `WorkflowEngine.ts` handles `email` and `in_app` notification types as empty `break` statements. Only `toast` actually works. Workflows that include email or in-app notification steps silently do nothing.

**Fix:** Wire email notifications to the `send-email` edge function, and in-app to the `notifications` table.

---

### 2.4 AI Assistant - CORS Headers May Be Incomplete
The `ai-operations` edge function uses a basic CORS header set that's missing newer Supabase client headers (`x-supabase-client-platform`, `x-supabase-client-platform-version`, etc.). This could cause preflight failures with newer SDK versions.

**Fix:** Update CORS headers to include the full set.

---

### 2.5 `send-email` Authentication Mismatch  
The `send-email` function has `verify_jwt = false` in `config.toml` but implements its own auth check. The function checks for service role key OR user JWT. However, the `check-deadlines` function calls `send-email` using `supabase.functions.invoke()` with the service role client, passing the key as `apikey` header - but `send-email` checks `req.headers.get('apikey')` against the service role key. This should work, but if the internal call format changes, it will break silently.

---

### 2.6 Resend Email - From Address Limitation
Even with a valid Resend API key, using `onboarding@resend.dev` limits you to sending only to the account owner's email. No other recipients will receive emails. This affects ALL email features: deadline reminders, compliance alerts, and report status updates.

---

## 3. MISSING FUNCTIONALITY

### 3.1 No Cron/Scheduled Jobs
The app has time-sensitive features (deadline checking, compliance alerts) but no scheduled execution mechanism. Everything relies on:
- A user being logged in (client-side `useDeadlineChecker`)
- Or manual invocation of edge functions

**Fix:** Add `pg_cron` jobs for `check-deadlines` and potentially compliance status updates.

---

### 3.2 Audit Logger `getClientIP()` Returns Placeholder
The client always sends `'client'` as the IP. The server captures the real IP, but the client field in the database is misleading.

**Fix:** Remove the client-side IP field entirely and let the server handle it.

---

## 4. CONFIGURATION ISSUES

### 4.1 `webhook-caller` Missing from `config.toml`
The edge function exists but has no entry in `supabase/config.toml`. It defaults to `verify_jwt = true`, which happens to be correct, but it should be explicit.

**Fix:** Add `[functions.webhook-caller]` with `verify_jwt = true`.

---

### 4.2 Paystack Webhook - No Signature Verification
The `paystack-webhook` function processes incoming webhooks but should verify the Paystack signature header (`x-paystack-signature`) to prevent spoofed payment confirmations.

**Fix:** Add HMAC signature verification using `PAYSTACK_SECRET_KEY`.

---

## Summary Table

| # | Issue | Impact | Effort | Priority |
|---|-------|--------|--------|----------|
| 1.1 | Report status trigger not attached | Emails never sent on report status change | Tiny | High |
| 1.2 | Duplicate uppercase tables | Data confusion, wasted storage | Small | Medium |
| 1.3 | `check-deadlines` never invoked | Deadline emails never sent automatically | Small | High |
| 1.4 | Email from `onboarding@resend.dev` | Emails only reach account owner | Manual | High |
| 1.5 | FIRS filing simulated | Already has draft label - verify | None | Low |
| 2.1 | Notification service wrong data source | Inconsistent deadline checking | Small | Medium |
| 2.2 | Workflow execution ID mismatch | DB inserts may fail silently | Tiny | Medium |
| 2.3 | Workflow notification steps are no-ops | Email/in-app workflow steps do nothing | Small | Medium |
| 2.4 | AI CORS headers incomplete | May cause preflight failures | Tiny | Medium |
| 2.5 | Email auth flow fragile | Could break on SDK updates | Small | Low |
| 2.6 | Resend sandbox limitation | Emails only to account owner | Manual | High |
| 3.1 | No cron jobs | Time-sensitive features unreliable | Medium | High |
| 3.2 | Client IP placeholder | Misleading data in audit logs | Tiny | Low |
| 4.1 | `webhook-caller` not in config.toml | Using implicit defaults | Tiny | Low |
| 4.2 | Paystack webhook no signature check | Payment fraud risk | Small | High |

---

## Recommended Fix Order

1. **Attach report status trigger** (1.1) - emails are completely broken
2. **Fix workflow execution IDs** (2.2) - quick fix, prevents silent DB failures
3. **Update AI CORS headers** (2.4) - may be causing current errors
4. **Add `webhook-caller` to config.toml** (4.1) - 10-second fix
5. **Add Paystack signature verification** (4.2) - security risk
6. **Fix notification data source** (2.1) - consolidate deadline logic
7. **Wire workflow notification steps** (2.3) - complete the feature
8. **Drop duplicate tables** (1.2) - clean up the database
9. **Set up cron job for deadlines** (3.1) - requires pg_cron extension
10. **Configure custom email domain** (1.4, 2.6) - manual Resend setup

---

## Technical Details

**1.1 - Attach report status trigger:**
```sql
CREATE TRIGGER report_status_notification
  AFTER UPDATE ON public.tax_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_report_status_change();
```

**2.2 - Fix workflow execution IDs:**
In `WorkflowEngine.ts`, replace `exec_${Date.now()}` with `crypto.randomUUID()`.

**2.4 - Update CORS headers in `ai-operations`:**
Add `x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version` to `Access-Control-Allow-Headers`.

**4.2 - Paystack signature verification:**
```typescript
const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
if (hash !== req.headers.get('x-paystack-signature')) { return 401; }
```

**1.2 - Drop duplicate tables:**
```sql
DROP TABLE IF EXISTS public."Activities";
DROP TABLE IF EXISTS public."Dashboard Metrics";
DROP TABLE IF EXISTS public."Deadlines";
```

