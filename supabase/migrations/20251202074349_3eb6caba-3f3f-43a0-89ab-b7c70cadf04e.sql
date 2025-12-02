-- Add comprehensive filing guides to tax_guides table
INSERT INTO tax_guides (title, content, category) VALUES
(
  'VAT Filing Guide - FIRS Portal Step-by-Step',
  '# VAT Filing Guide - FIRS Portal

## Overview
This guide walks you through filing your VAT returns on the FIRS TaxPro-Max portal.

## Prerequisites
- Valid TIN (Tax Identification Number)
- Active TaxPro-Max account
- Prepared VAT filing pack with calculations
- Payment evidence (if applicable)

## Step-by-Step Filing Process

### Step 1: Login to TaxPro-Max
1. Visit https://taxpromax.firs.gov.ng
2. Enter your TIN and password
3. Click "Login"

### Step 2: Navigate to VAT Returns
1. From the dashboard, click "VAT"
2. Select "File VAT Returns"
3. Choose the appropriate tax period (month/quarter)

### Step 3: Enter Transaction Details
1. **Input VAT (Purchases)**
   - Enter total purchases subject to VAT
   - Upload supporting invoices if required
   
2. **Output VAT (Sales)**
   - Enter total taxable sales
   - Exclude exempt sales
   
3. **Net VAT Payable**
   - System auto-calculates: Output VAT - Input VAT
   - Review calculation carefully

### Step 4: Review and Submit
1. Review all entered data
2. Attach your filing pack PDF
3. Click "Submit Return"
4. Download acknowledgement slip

### Step 5: Make Payment (if applicable)
1. Generate FIRS Remita RRR
2. Pay via bank or online
3. Upload payment evidence to portal

## Common Mistakes to Avoid
- ❌ Filing after deadline (21st of following month)
- ❌ Forgetting to exclude exempt sales
- ❌ Not keeping transaction records
- ❌ Submitting without reviewing calculations

## Required Documents
✓ Sales invoices
✓ Purchase invoices  
✓ Payment receipts
✓ Bank statements

## Support
- FIRS Helpline: 0700-CALL-FIRS
- Email: support@firs.gov.ng
',
  'vat_filing'
),
(
  'Corporate Income Tax (CIT) Filing Guide',
  '# Corporate Income Tax Filing Guide

## Overview
Guide for filing annual Corporate Income Tax returns in Nigeria.

## Filing Deadline
Within 6 months after the end of your financial year.

## Required Information
- Company TIN
- Financial statements (audited if required)
- Profit & Loss statement
- Balance sheet
- Tax computation schedule

## Filing Process

### Step 1: Prepare Financial Statements
1. Close your books for the financial year
2. Prepare profit & loss statement
3. Complete balance sheet
4. Calculate taxable profit

### Step 2: Calculate Tax Liability
1. Start with accounting profit
2. Add back non-allowable expenses
3. Deduct capital allowances
4. Apply 30% CIT rate (or 20% for small companies)

### Step 3: File on TaxPro-Max
1. Login to TaxPro-Max portal
2. Navigate to "CIT Returns"
3. Select appropriate year
4. Upload required documents:
   - Audited financial statements
   - Tax computation
   - Supporting schedules

### Step 4: Submit and Pay
1. Review submission carefully
2. Submit return
3. Generate payment reference
4. Make payment within 2 months

## Small Company Rate
Companies with turnover below ₦25 million qualify for 20% rate instead of 30%.

## Deductible Expenses
✓ Staff salaries
✓ Rent and utilities
✓ Professional fees
✓ Depreciation (via capital allowances)

## Non-Deductible Expenses
❌ Donations (above limit)
❌ Entertainment expenses
❌ Personal expenses
❌ Provisions (except bad debts)

## Penalties for Late Filing
- Late filing: ₦25,000 first month + ₦5,000 each subsequent month
- Late payment: 10% of tax + 5% interest per annum
',
  'cit_filing'
),
(
  'Personal Income Tax (PIT) Filing Guide',
  '# Personal Income Tax Filing Guide

## Overview
Guide for individual taxpayers filing annual tax returns in Nigeria.

## Who Must File?
- Employees earning above minimum threshold
- Self-employed individuals
- Business owners
- Anyone with taxable income

## Filing Deadline
On or before March 31 of the following year.

## Tax Rates (Progressive)
| Income Band | Rate |
|------------|------|
| First ₦300,000 | 7% |
| Next ₦300,000 | 11% |
| Next ₦500,000 | 15% |
| Next ₦500,000 | 19% |
| Next ₦1,600,000 | 21% |
| Above ₦3,200,000 | 24% |

## Filing Process

### Step 1: Gather Documents
- Employment letters
- Salary statements
- Pension contributions
- NHIS contributions
- Life insurance premiums

### Step 2: Calculate Income
1. Total gross income
2. Less: Pension contributions (max 10%)
3. Less: NHIS contributions
4. Less: Life insurance (max ₦200,000)
5. = Taxable income

### Step 3: File Return
**For Employees (PAYE):**
- Employer files on your behalf
- Review annual tax summary
- Keep records

**For Self-Employed:**
1. Login to state tax portal
2. Complete self-assessment form
3. Upload supporting documents
4. Submit and get assessment

### Step 4: Make Payment
- Pay assessed amount
- Keep receipt for records

## Tax Reliefs Available
- Consolidated Relief: Higher of 1% of gross income or ₦200,000 + 20% of gross income
- Pension contributions (up to 10%)
- NHIS contributions
- Life insurance premiums (max ₦200,000)

## Record Keeping
Keep records for minimum 6 years:
- Income statements
- Tax receipts
- Relevant correspondence
',
  'pit_filing'
),
(
  'Withholding Tax (WHT) Guide',
  '# Withholding Tax Guide for Nigeria

## What is WHT?
Advance tax deducted at source on certain transactions and remitted to FIRS/State IRS.

## Common WHT Rates
| Transaction Type | Rate |
|-----------------|------|
| Dividends | 10% |
| Interest | 10% |
| Rent | 10% |
| Royalties | 10% |
| Professional fees | 10% |
| Directors fees | 10% |
| Contracts (non-construction) | 5% |
| Construction contracts | 5% |

## Who Deducts WHT?
- Companies making qualifying payments
- Government agencies
- Large organizations

## Filing Requirements
**Monthly Remittance:**
- Deduct WHT when making payment
- Remit to tax authority within 21 days
- File monthly WHT returns

**Documentation:**
- Issue WHT certificate to payee
- Keep records for 6 years
- Reconcile with annual returns

## How to File WHT Returns

### Step 1: Calculate Deductions
For each payment made:
1. Identify if subject to WHT
2. Apply correct rate
3. Deduct from gross amount
4. Pay net to supplier

### Step 2: Complete Schedule
Create schedule showing:
- Beneficiary name and TIN
- Nature of payment
- Gross amount
- WHT rate applied
- Tax deducted
- Net amount paid

### Step 3: File and Pay
1. Login to TaxPro-Max
2. Navigate to "WHT Returns"
3. Upload completed schedule
4. Generate payment reference
5. Make remittance

### Step 4: Issue Certificates
- Generate WHT certificates
- Send to beneficiaries
- Keep copies for records

## Common Errors to Avoid
❌ Using wrong WHT rate
❌ Late remittance (penalties apply)
❌ Not issuing certificates
❌ Poor record keeping

## Exemptions
Some transactions are exempt:
- Imports (subject to special rules)
- Inter-company dividends (conditions apply)
- Certain government payments
',
  'wht_filing'
);