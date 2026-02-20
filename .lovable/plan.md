
# TaxEase V1 - Remaining Items Review

Here's a complete breakdown of what's done, what needs attention, and what's left to do in your TaxEase application.

---

## Active Bug (Fix Required)

### 1. Audit Logger - Stale "pending" Events in Browser Storage
The edge function is now fixed and working, but your browser's localStorage likely still contains old failed events with `user_id: "pending"`. The client retries these every 30 seconds, causing repeated 500 errors.

**Fix:** Clear `audit_events` from localStorage. The code changes already sanitize invalid IDs, but stale data cached before the fix may still be stuck. A one-time migration in the `flushQueue` method should **delete** (not just sanitize) old invalid entries, and add a max retry count to prevent infinite retries of failing events.

---

## Missing Features

### 2. Forgot Password / Password Reset Flow
There is no "Forgot Password" link on the Login page, and no password reset page exists. The rate limiter has a `PASSWORD_RESET` config, and the help FAQ mentions it, but the actual feature is not implemented.

**Fix:** Add a `/auth/reset-password` page and a "Forgot Password" link to the Login page.

### 3. Email Confirmation Handling
After signup, there's no UI feedback telling users to check their email for a confirmation link. Users could be confused about why they can't log in.

**Fix:** Add a post-signup confirmation screen.

---

## Security Items (Manual - Supabase Dashboard)

These cannot be fixed via code:

### 4. Enable Leaked Password Protection
Go to **Supabase Dashboard -> Authentication -> Settings -> Password Security** and enable it.

### 5. Upgrade Postgres Version
Go to **Supabase Dashboard -> Settings -> Infrastructure** and upgrade to the latest version.

### 6. Function Search Path Mutable
The `handle_new_user` and `log_organization_activity` database functions have mutable search paths.

**Fix:** Add `SET search_path = ''` to these functions via a migration.

---

## Known Vulnerability

### 7. xlsx Package
The `xlsx` package has known security vulnerabilities (Prototype Pollution, ReDoS). It's used in 4 files for Excel import/export. Replacing it with `ExcelJS` requires a significant refactor. This is a decision for you - accept the risk or invest in the refactor.

---

## Polish / Quality of Life

### 8. Dead Navigation Link
The Dashboard's empty state has a "Calculate Tax" button pointing to `/tax`, but the actual route is `/tax-web-app`. This would show a blank page.

### 9. IP Address Placeholder
The `auditLogger.getClientIP()` method always returns `'client'` instead of the actual IP. The edge function already captures the real IP from headers, so the client-side placeholder is harmless but misleading.

---

## Summary Table

| Item | Type | Effort | Action |
|------|------|--------|--------|
| Audit logger stale events | Bug | Small | Code fix: clear stale localStorage, add retry limit |
| Forgot Password flow | Missing feature | Medium | Add reset password page and link |
| Post-signup confirmation UI | Missing feature | Small | Add confirmation screen after signup |
| Leaked Password Protection | Security | Manual | Enable in Supabase Dashboard |
| Postgres upgrade | Security | Manual | Upgrade in Supabase Dashboard |
| Function search path | Security | Small | Migration to set search_path |
| xlsx vulnerability | Security | Large | Replace with ExcelJS (optional) |
| Dead /tax link | Bug | Tiny | Change `/tax` to `/tax-web-app` |
| IP address placeholder | Polish | Tiny | Remove or keep as-is (server handles it) |

---

## Technical Implementation Details

**Audit logger fix:** Add a `maxRetries` counter to queued events. After 3 failed attempts, discard the event. Also clear `audit_events` from localStorage on app startup if they contain invalid UUIDs.

**Password reset:** Use `supabase.auth.resetPasswordForEmail()` for the request and `supabase.auth.updateUser()` on the callback page. Add route `/auth/reset-password` with a form for email input, and handle the magic link redirect.

**Function search path migration:**
```text
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.log_organization_activity() SET search_path = '';
```

**Dead link fix:** In `src/pages/Dashboard.tsx`, change `navigate("/tax")` to `navigate("/tax-web-app")`.
