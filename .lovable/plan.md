

# Gap Analysis: Investor Plan vs Current App

After reading your full investor document and comparing it against every feature in your codebase, here is what is **already built**, what is **partially built**, and what is **missing entirely**.

---

## Already Built (matches investor plan)

These features exist and work in the app:

- Tax Reporting Engine: VAT, CIT, PAYE, WHT, Capital Gains calculators
- Transfer Pricing Toolkit with Master/Local File templates, risk assessment, benchmarking
- Compliance Deadline Tracker with calendar and alerts
- Audit Documentation Management Portal (document upload, categorization, version history)
- AI-Powered Regulatory Drafting Assistant (OpenAI integration)
- Role-Based Access Controls (RBAC) with RLS
- Client Portal for Transfer Pricing (read-only document sharing)
- Paystack payment integration
- Resend email integration
- Activity/audit logging
- Onboarding wizard
- Error tracking (Sentry) and analytics (PostHog)
- Stamp Duty, Education Tax, Petroleum Profit Tax calculators (bonus - beyond investor plan)

---

## Partially Built (needs work to match investor plan)

| Feature | What Exists | What's Missing |
|---------|-------------|----------------|
| **Tiered Pricing/Subscriptions** | Paystack integration exists but no pricing page or plan selection UI | Need a `/pricing` page with Starter (₦5,000), Pro (₦12,000), Enterprise tiers, plan gating, and subscription management |
| **Multi-Factor Authentication** | OTP input component exists | No actual MFA enrollment flow - need TOTP setup, backup codes, and enforcement for admin users |
| **Filing Pack Generator** | Filing form and history exist | Step-by-step guided filing workflow is basic; needs the "institutional-grade" output described in the plan |
| **Notification System** | Email/in-app notifications exist | Workflow notification steps were no-ops (recently fixed), but SMS and WhatsApp channels are not implemented |

---

## Missing Entirely (promised in investor plan but not in the app)

### High Priority - Core product promises

1. **Invoicing & Payment Portal** (Section 8.3)
   - No invoice creation, sending, or tracking
   - No client-facing payment links
   - No accounts receivable/payable module
   - This is listed as a core Starter plan feature

2. **OCR Receipt Capture - "Snap, Upload, Comply"** (Section 8.2)
   - This is your primary marketing hook per the investor plan
   - No camera/OCR integration exists
   - No automatic receipt categorization
   - No VAT extraction from receipts

3. **Payroll Module** (Section 8.3)
   - PAYE calculator exists but no actual payroll processing
   - No employee records management
   - No payslip generation
   - No pension tracking beyond calculation
   - No monthly remittance summaries

4. **Subscription/Pricing Page** (Section 7)
   - No visible pricing page or plan selection
   - No feature gating by plan tier (Starter vs Pro vs Enterprise)
   - No subscription management UI
   - No annual prepayment option

5. **PWA / Offline Capabilities** (Section 4.5)
   - No service worker, no manifest.json
   - No offline data entry or sync
   - Plan promises "Progressive Web App architecture"

### Medium Priority - Competitive differentiators

6. **Predictive Analytics / Forecasting** (Section 8.3)
   - No cash flow forecasting
   - No "What-If" scenario planning
   - No tax liability projections
   - No growth scenario modeling

7. **Bank Statement Import** (Section 8.2)
   - No bank API integration
   - No statement upload and parsing
   - No automatic transaction categorization from bank data

8. **MFA Enrollment Flow** (Section 5.4)
   - No TOTP authenticator app setup
   - No backup codes
   - No device fingerprinting
   - Critical for the security claims in the investor plan

9. **SMS & WhatsApp Notifications** (Section 3.4)
   - Referenced multiple times as multi-channel alerts
   - Only email exists currently
   - WhatsApp Business API integration needed

10. **Landing Page / Marketing Site** (Section 8.2)
    - App goes straight to auth/dashboard
    - No public-facing landing page explaining the product
    - No SEO-optimized content pages
    - Investors will want to see a proper marketing presence

### Lower Priority - Future roadmap items

11. **QuickBooks/Xero Integration** (Section 4.4) - listed as Phase 3
12. **NIN/TIN Verification** (Section 4.6) - identity validation
13. **Penalty Calculator** (Section 4.6) - late filing penalties
14. **Two-way Calendar Sync** (Section 3.4) - Google/Outlook integration
15. **White-labeling** (Section 7.5) - Enterprise feature

---

## Recommended Build Order

For investor readiness, I recommend building in this order:

### Phase 1: Make core promises real (what investors will click on)
1. **Pricing/Subscription page** with plan tiers and Paystack checkout
2. **Landing page** with product overview, pricing, and signup CTA
3. **PWA setup** (manifest + service worker) - quick win, validates "mobile-first" claim

### Phase 2: Build the marketing hook
4. **OCR Receipt Capture** using an OCR API or OpenAI vision
5. **Invoicing module** with payment links via Paystack

### Phase 3: Deepen the product
6. **Payroll module** building on existing PAYE calculator
7. **MFA enrollment** flow
8. **Predictive analytics** dashboard

### Phase 4: Scale features
9. **SMS/WhatsApp notifications**
10. **Bank statement import**

---

## Summary

Your app has strong bones - the tax calculators, transfer pricing toolkit, compliance tracker, AI assistant, and security infrastructure are solid. The biggest gaps are in the **revenue-generating features** (invoicing, subscriptions, pricing page) and the **primary marketing hook** (OCR receipt capture) that your investor plan heavily promotes. Building the pricing page, landing page, and receipt capture would make the app match what investors will expect to see after reading your plan.

