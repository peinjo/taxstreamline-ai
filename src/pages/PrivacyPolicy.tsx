import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | TaxEase</title>
        <meta name="description" content="TaxEase privacy policy — how we collect, use, and protect your data." />
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
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 2026</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly when you create an account, use our services, or contact us. This includes your name, email address, business information, and tax-related data you input into the platform.</p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our tax compliance and reporting services</li>
            <li>To process your tax calculations, filings, and generate reports</li>
            <li>To send you important notifications about deadlines and compliance updates</li>
            <li>To improve our platform and develop new features</li>
            <li>To comply with legal obligations under Nigerian law</li>
          </ul>

          <h2>3. Data Security</h2>
          <p>We implement industry-standard security measures including encryption at rest and in transit, row-level security policies, and multi-factor authentication to protect your sensitive financial and tax data.</p>

          <h2>4. Data Retention</h2>
          <p>We retain your data for as long as your account is active or as needed to provide services. Tax records are retained for the minimum period required by the Federal Inland Revenue Service (FIRS) guidelines — typically 6 years.</p>

          <h2>5. Third-Party Services</h2>
          <p>We use select third-party services (hosting, authentication, analytics) that adhere to strict data protection standards. We do not sell your personal data to third parties.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. You may export your data at any time through the platform's settings. To exercise these rights, contact us at <a href="mailto:privacy@taxease.ng" className="text-primary">privacy@taxease.ng</a>.</p>

          <h2>7. Cookies</h2>
          <p>We use essential cookies for authentication and session management. Analytics cookies are used only with your consent to help us understand how the platform is used.</p>

          <h2>8. Changes to This Policy</h2>
          <p>We may update this policy from time to time. We will notify you of material changes via email or an in-app notification.</p>

          <h2>9. Contact Us</h2>
          <p>For questions about this privacy policy, contact us at <a href="mailto:privacy@taxease.ng" className="text-primary">privacy@taxease.ng</a> or write to: Peinjo RegTech Solutions, Lagos, Nigeria.</p>
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

export default PrivacyPolicy;
