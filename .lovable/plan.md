

# TaxEase - Functions Audit: What's Not Working or Needs Improvement

After a thorough review of every page, service, hook, and edge function in the app, here is a categorized list of issues.

---

## 1. Broken / Non-Functional

### 1.1 Replit Auth Button (Signup Page)
The Signup page displays a visible "ReplitAuthButton Placeholder" text to users. The underlying component (`ReplitAuthButton.tsx`) loads a third-party Replit script that has nothing to do with TaxEase. This is dead code from a different platform.

**Fix:** Remove the placeholder `<div>ReplitAuthButton Placeholder</div>` and the "Or continue with" divider from `src/pages/auth/Signup.tsx`. Delete `src/components/auth/ReplitAuthButton.tsx`.

---

### 1.2 FIRS Filing Integration is Simulated
The `src/integrations/firs.ts` `submitFiling()` function generates a fake `FIRS-{timestamp}` reference and never actually calls the FIRS API. It always returns `status: "success"` locally but inserts `status: "pending"` in the database. The `getFilingStatus()` function just reads back from the local database, not from FIRS.

**Impact:** Users may think their tax filing was submitted to the government when it was not. This needs either a real integration or a clear "Draft/Simulated" label.

**Fix:** Add prominent UI labels like "Draft Filing - Not Submitted to FIRS" so users are not misled, or implement the actual FIRS API when available.

---

### 1.3 `check-deadlines` Edge Function Has No Trigger
The edge function exists and works, but nothing in the client code ever calls it (`check-deadlines` returns zero search results in `/src`). It is not connected to a cron job or scheduled invocation. The client-side `useDeadlineChecker` hook duplicates some of this logic locally but does not use the edge function.

**Fix:** Either invoke `check-deadlines` from a cron job (Supabase Cron or `pg_cron`) or remove it and rely solely on the client-side hook.

---

### 1.4 `send-email` and `send-whatsapp` Missing from `config.toml`
The edge functions `send-email`, `send-whatsapp`, and `check-deadlines` exist in `supabase/functions/` but are not declared in `supabase/config.toml`. Without entries, their JWT verification defaults may not match expectations.

**Fix:** Add entries for all missing functions in `config.toml`.

---

## 2. Partially Working / Needs Improvement

### 2.1 AI Assistant - Function Calling is Disabled
The `useAIAssistant` hook sends messages to the `ai-operations` edge function, which returns a plain text response. The edge function does **not** pass any function definitions to OpenAI, so function calling never triggers. The client code has logic to handle `function_call` responses, but the server always returns `function_call: null`. All the registered AI actions (calendar, compliance, tax, workflow, automation, etc.) are effectively dead code.

**Fix:** Pass the action registry's function definitions to the OpenAI API call in the edge function, or implement a separate action-parsing layer.

---

### 2.2 Workflow Engine is In-Memory Only
`WorkflowEngine.ts` stores all workflow executions in a local `Map`. Nothing persists to the database. If the user refreshes the page, all workflow state is lost. There's no UI to view past executions.

**Fix:** Persist workflow executions to a Supabase table and add a history/status view.

---

### 2.3 Tax Optimization Plans are In-Memory Only
`useTaxOptimization.ts` uses `useState` to store saved optimization plans. They disappear on page refresh. The `savePlan` function just pushes to local state.

**Fix:** Persist saved plans to Supabase or clearly label them as session-only.

---

### 2.4 Dashboard Metrics Query Expects a Single Row
`useDashboardMetrics()` calls `.single()` on `dashboard_metrics`, which will throw an error if there are zero or multiple rows for the user. The table likely needs a user-scoped query (`.eq("user_id", user.id)`).

**Fix:** Add a `.eq("user_id", user.id)` filter and use `.maybeSingle()` to handle the zero-row case gracefully.

---

### 2.5 Notification Service References Missing `deadlines` Table
`src/services/notificationService.ts` queries a `deadlines` table, which appears to be a simple table populated by the SampleDataButton. The client-side `useDeadlineChecker` hook queries `calendar_events` and `compliance_rules` instead, creating a disconnect where two different systems handle deadline checking with different data sources.

**Fix:** Consolidate deadline logic to use one source of truth.

---

### 2.6 Audit Logger `getClientIP()` Always Returns `'client'`
The method is a placeholder that never fetches the real IP. While the server-side edge function captures the real IP from headers, the client sends `'client'` as the IP value, which gets stored in the database.

**Fix:** Either remove the client-side IP field (let the server handle it) or use a service like `api.ipify.org`.

---

## 3. UI / UX Issues

### 3.1 Signup Page Shows "ReplitAuthButton Placeholder" Text
Users see raw placeholder text "ReplitAuthButton Placeholder" below the signup form. This looks unprofessional.

**Fix:** Remove it (covered in item 1.1).

---

### 3.2 Reset Password - Recovery Token Detection May Fail
`ResetPassword.tsx` checks `window.location.hash` for `type=recovery`, but Supabase may use query parameters or a different hash format depending on configuration. If the token isn't detected, users see "Invalid Reset Link" even with a valid link.

**Fix:** Also check URL search params, and handle the Supabase `onAuthStateChange` `PASSWORD_RECOVERY` event.

---

## 4. Security / Configuration

### 4.1 `xlsx` Package Vulnerability
Still present with known Prototype Pollution and ReDoS vulnerabilities. Used in 4 files.

### 4.2 Leaked Password Protection (Manual)
Needs to be enabled in Supabase Dashboard > Authentication > Settings.

### 4.3 Postgres Version Upgrade (Manual)
Needs to be done in Supabase Dashboard > Settings > Infrastructure.

---

## Summary Table

| # | Issue | Status | Effort | Priority |
|---|-------|--------|--------|----------|
| 1.1 | Replit Auth placeholder on Signup page | Broken | Tiny | High |
| 1.2 | FIRS filing is simulated, no label | Misleading | Small | High |
| 1.3 | `check-deadlines` edge function never called | Dead code | Small | Medium |
| 1.4 | Missing `config.toml` entries for edge functions | Misconfigured | Tiny | Medium |
| 2.1 | AI function calling is disabled | Partially working | Medium | Medium |
| 2.2 | Workflow executions not persisted | In-memory only | Medium | Low |
| 2.3 | Tax optimization plans not persisted | In-memory only | Small | Low |
| 2.4 | Dashboard metrics query missing user filter | Bug | Tiny | High |
| 2.5 | Duplicate deadline logic across services | Inconsistent | Small | Medium |
| 2.6 | Client IP placeholder in audit logger | Cosmetic | Tiny | Low |
| 3.2 | Password reset token detection fragile | May break | Small | Medium |
| 4.1 | xlsx vulnerability | Security | Large | Medium |
| 4.2 | Leaked password protection | Manual | Manual | High |
| 4.3 | Postgres version upgrade | Manual | Manual | Medium |

---

## Recommended Fix Order

1. Remove Replit Auth placeholder (1.1) - users see this immediately
2. Fix Dashboard metrics query (2.4) - may cause errors for all users
3. Add "Simulated" labels to FIRS filing (1.2) - prevents user confusion
4. Fix password reset token detection (3.2) - new feature may not work
5. Add missing `config.toml` entries (1.4) - quick fix
6. Wire up `check-deadlines` or remove it (1.3)
7. Everything else based on your priorities

## Technical Details

**1.1 - Replit Auth removal:**
- In `src/pages/auth/Signup.tsx`, delete lines 166-178 (the "Or continue with" section and placeholder)
- Delete `src/components/auth/ReplitAuthButton.tsx`

**2.4 - Dashboard metrics fix:**
- In `src/hooks/useDashboard.ts`, change the query to filter by `user_id` and use `.maybeSingle()`

**1.4 - config.toml entries:**
Add to `supabase/config.toml`:
```text
[functions.send-email]
verify_jwt = false

[functions.send-sms]
verify_jwt = true

[functions.send-whatsapp]
verify_jwt = true

[functions.check-deadlines]
verify_jwt = false
```

**3.2 - Password reset fix:**
Listen for `supabase.auth.onAuthStateChange` with `PASSWORD_RECOVERY` event in addition to checking the URL hash.

