
## Status: What's Left

### Already done ✓
- Supabase Tax-App project connected
- Build errors fixed (`useCalendarEventsMutations`, `CommandPalette` cmdk crash)
- E2E verified: signup → email confirmation redirect → login → dashboard renders
- xlsx → ExcelJS migration is already complete (the stale `.lovable/plan.md` is outdated; no actual `xlsx` imports remain)

### Outstanding / not yet verified

**1. Onboarding tour** — never actually exercised E2E. The login test went straight to a dashboard for an existing confirmed account that had likely already completed onboarding. The 5-step AI-assisted onboarding wizard + driver.js tour for a brand-new user has not been walked through.

**2. New-signup full path** — blocked previously by email confirmation. Either:
   - Disable "Confirm email" in Supabase Auth → Providers → Email (fastest), or
   - Manually confirm a fresh test user, then resume

**3. RLS / security review** — `rls_setup.sql` exists but the project has 71 tables; many likely lack policies. A `supabase--linter` run would surface missing-RLS warnings before production.

**4. Cleanup** — delete the stale `.lovable/plan.md` (xlsx fixes already applied).

### Recommended next step
Pick ONE:
- **(A) Finish true E2E**: disable email confirmation → sign up a fresh user → walk through onboarding wizard + driver.js tour → land on dashboard. (~10 min)
- **(B) Security pass**: run Supabase linter, list tables missing RLS, propose policies. (~15 min)
- **(C) Move on to a feature** from the roadmap (FIRS e-filing prep, payroll, OCR receipts, etc.).
