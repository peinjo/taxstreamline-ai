import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | TaxEase</title>
        <meta name="description" content="TaxEase terms of service — the agreement governing your use of our platform." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">TaxEase</Link>
            <Button variant="outline" asChild>
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-3xl prose prose-neutral dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Effective date: March 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using the TaxEase platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

          <h2>2. Description of Service</h2>
          <p>TaxEase provides cloud-based tax compliance, reporting, payroll, invoicing, and regulatory technology tools for businesses operating in Nigeria. The platform includes tax calculators, document management, filing preparation, and AI-powered assistance.</p>

          <h2>3. User Accounts</h2>
          <ul>
            <li>You must provide accurate and complete registration information.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You must be at least 18 years old to use the Service.</li>
            <li>One person or entity may not maintain more than one free account.</li>
          </ul>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to misuse the Service. This includes but is not limited to: attempting to gain unauthorised access, submitting fraudulent tax data, reverse-engineering the platform, or using the Service for any unlawful purpose.</p>

          <h2>5. Subscription and Payment</h2>
          <p>Certain features require a paid subscription. Fees are billed in Nigerian Naira (₦) on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change pricing with 30 days' notice.</p>

          <h2>6. Data Ownership</h2>
          <p>You retain ownership of all data you submit to the platform. We do not claim ownership of your tax records, financial documents, or business information. You grant us a limited licence to process this data solely to provide the Service.</p>

          <h2>7. Disclaimer</h2>
          <p>TaxEase provides tools to assist with tax compliance but does not constitute professional tax advice. You are responsible for the accuracy of your filings. We recommend consulting a qualified tax professional for complex matters.</p>

          <h2>8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by Nigerian law, TaxEase shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to penalties assessed by tax authorities.</p>

          <h2>9. Termination</h2>
          <p>We may suspend or terminate your account if you violate these Terms. You may cancel your account at any time through the platform settings. Upon termination, you may request an export of your data within 30 days.</p>

          <h2>10. Governing Law</h2>
          <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved through arbitration in Lagos, Nigeria.</p>

          <h2>11. Contact</h2>
          <p>Questions about these Terms? Contact us at <a href="mailto:legal@taxease.ng" className="text-primary">legal@taxease.ng</a>.</p>
        </main>

        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Peinjo RegTech Solutions. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default TermsOfService;
