import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaxGuideProps {
  searchQuery: string;
}

const GUIDES = [
  {
    id: "vat",
    title: "Value Added Tax (VAT)",
    content: `
# Value Added Tax Guide

VAT is a consumption tax placed on goods and services. Here are key points:

- Standard rate: [VAT Rate]
- Registration threshold: [Amount]
- Filing frequency: [Frequency]

## Key Concepts
[Placeholder for key VAT concepts]

## Compliance Requirements
[Placeholder for compliance requirements]
    `,
  },
  {
    id: "paye",
    title: "Pay As You Earn (PAYE)",
    content: `
# PAYE Tax Guide

PAYE is a method of paying income tax and national insurance contributions. Key points:

- Tax bands: [Tax Bands]
- Allowances: [Allowances]
- Deductions: [Deductions]

## Calculation Method
[Placeholder for calculation method]

## Employer Obligations
[Placeholder for employer obligations]
    `,
  },
  {
    id: "corporate",
    title: "Corporate Income Tax",
    content: `
# Corporate Income Tax Guide

Corporate tax is levied on the profits made by companies. Important aspects:

- Tax rate: [Rate]
- Assessment period: [Period]
- Allowable deductions: [Deductions]

## Filing Requirements
[Placeholder for filing requirements]

## Tax Incentives
[Placeholder for tax incentives]
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
              <AccordionTrigger>{guide.title}</AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">
                    {guide.content}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}