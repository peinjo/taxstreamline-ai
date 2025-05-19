
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaxGuideProps {
  searchQuery: string;
}

const GUIDES = [
  {
    id: "vat",
    title: "Value Added Tax (VAT)",
    badge: "Essential",
    content: `
# Value Added Tax Guide

VAT is a consumption tax placed on goods and services. Here are key points:

- Standard rate: 7.5% in Nigeria
- Registration threshold: NGN 25 million turnover in a calendar year
- Filing frequency: Monthly, due by the 21st of the following month

## Key Concepts

1. **Input VAT**: The VAT you pay on business purchases
2. **Output VAT**: The VAT you charge on your sales
3. **VAT Payable**: Output VAT minus Input VAT

## Compliance Requirements

1. Register for VAT if your turnover exceeds the threshold
2. Issue VAT invoices for all sales
3. Keep accurate VAT records for at least 6 years
4. File VAT returns and make payments monthly

## Common Mistakes to Avoid

1. Not registering when required
2. Incorrect VAT rates
3. Late filing or payment
4. Claiming input VAT on non-qualifying expenses
    `,
  },
  {
    id: "paye",
    title: "Pay As You Earn (PAYE)",
    badge: "Required",
    content: `
# PAYE Tax Guide

PAYE is a method of collecting income tax from employees. Key points:

- Tax bands (2023):
  - First NGN 300,000: 7%
  - Next NGN 300,000: 11%
  - Next NGN 500,000: 15%
  - Next NGN 500,000: 19%
  - Next NGN 1,600,000: 21%
  - Above NGN 3,200,000: 24%
  
- Allowances:
  - Consolidated Relief Allowance: NGN 200,000 + 20% of gross income
  - Pension contributions: Generally tax-exempt
  - National Housing Fund: Tax-exempt
  - National Health Insurance: Tax-exempt

## Calculation Method

1. Calculate gross income (salary + allowances)
2. Subtract exempt allowances (NHF, NHIS, pension)
3. Apply consolidated relief allowance
4. Apply tax bands progressively to taxable income
5. Sum tax from each band to get total PAYE

## Employer Obligations

1. Register with tax authorities
2. Deduct PAYE from employees' salaries
3. Remit PAYE by the 10th of the following month
4. Issue annual tax deduction cards to employees
5. File annual returns by January 31st
    `,
  },
  {
    id: "corporate",
    title: "Corporate Income Tax",
    badge: "Important",
    content: `
# Corporate Income Tax Guide

Corporate tax is levied on profits made by companies in Nigeria. Important aspects:

- Tax rates:
  - Small companies (turnover less than NGN 25 million): 0%
  - Medium companies (turnover NGN 25-100 million): 20%
  - Large companies (turnover over NGN 100 million): 30%
  
- Assessment period: Financial year of the company

- Allowable deductions:
  - Expenses wholly, exclusively, and necessarily for business purposes
  - Interest on loans for business operations
  - Repairs and maintenance
  - Research and development
  - Bad debts written off

## Filing Requirements

1. Self-assessment filing within 6 months after financial year-end
2. Payment of tax due on or before filing date
3. Audited financial statements must accompany returns
4. Required to file returns even if in a loss position

## Tax Incentives

1. Pioneer status: 3-5 year tax holiday for qualifying industries
2. Accelerated capital allowances
3. Rural investment allowance
4. Export processing zone incentives
5. Infrastructure tax relief
    `,
  },
  {
    id: "capital-gains",
    title: "Capital Gains Tax",
    badge: "Guide",
    content: `
# Capital Gains Tax Guide

Capital Gains Tax (CGT) applies to profits from the sale or disposal of assets. Key information:

- Tax rate: 10% flat rate
- Applies to: Profits from sale of assets like land, buildings, shares, and other property

## Exemptions

1. Main residence (subject to conditions)
2. Nigerian government securities
3. Life insurance policies
4. Personal motor vehicles
5. Stocks and shares (temporary exemption until 2025)

## Calculation Method

1. Calculate proceeds from disposal
2. Deduct original cost of acquisition
3. Deduct allowable expenses related to acquisition and disposal
4. The result is the chargeable gain
5. Apply 10% rate to the gain

## Filing Requirements

1. File returns within 30 days of disposal
2. Pay CGT along with the return
3. Keep supporting documentation for at least 6 years
    `,
  },
  {
    id: "withholding",
    title: "Withholding Tax",
    badge: "Reference",
    content: `
# Withholding Tax Guide

Withholding Tax (WHT) is an advance payment of income tax. Important points:

- Rates:
  - Dividends, interest, rent: 10%
  - Royalties: 10%
  - Professional services: 10%
  - Construction and technical services: 5%
  - Directors' fees: 10%
  - Consultancy and management services: 10%
  - Commission: 10%
  - Contracts other than sales in the ordinary course of business: 5%
  
## Key Concepts

1. **Withholding Agent**: Entity responsible for deducting WHT
2. **WHT Credit Notes**: Issued to the payee as evidence of tax withheld
3. **Final Tax**: For dividends, interest, rent, and royalties paid to individuals

## Compliance Requirements

1. Deduct WHT at source when making qualifying payments
2. Remit WHT to tax authorities by the 21st of the following month
3. Issue WHT credit notes to the payee
4. File WHT returns monthly

## Using WHT Credit Notes

1. Use as evidence of tax paid in advance
2. Offset against final tax liability at year end
3. Request for refund if WHT credits exceed tax liability
    `,
  },
];

export function TaxGuides({ searchQuery }: TaxGuideProps) {
  const filteredGuides = GUIDES.filter((guide) =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Guides</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {filteredGuides.map((guide) => (
            <AccordionItem key={guide.id} value={guide.id}>
              <AccordionTrigger>
                <div className="flex items-center">
                  {guide.title}
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800 border-blue-200">
                    {guide.badge}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap font-sans text-sm">
                    {guide.content}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
