import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage = '/og-image.png',
  structuredData,
  noIndex = false
}) => {
  const fullTitle = title.includes('TaxEase') ? title : `${title} | TaxEase - Tax Management Platform`;
  const trimmedDescription = description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description;

  return (
    <Helmet>
      {/* Essential Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={trimmedDescription} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={trimmedDescription} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={trimmedDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Theme */}
      <meta name="theme-color" content="#2563eb" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Pre-built SEO configurations for common pages
export const DashboardSEO: React.FC = () => (
  <SEOHead
    title="Tax Dashboard"
    description="Monitor and manage your tax compliance, filings, and payments in one comprehensive dashboard. Track deadlines, view analytics, and stay compliant."
    keywords={['tax dashboard', 'tax management', 'compliance tracking', 'tax analytics']}
    structuredData={{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "TaxEase Dashboard",
      "description": "Comprehensive tax management and compliance platform",
      "applicationCategory": "BusinessApplication"
    }}
  />
);

export const CalculatorSEO: React.FC = () => (
  <SEOHead
    title="Tax Calculator"
    description="Calculate various Nigerian taxes including VAT, Income Tax, Corporate Tax, and Withholding Tax. Get accurate tax computations instantly."
    keywords={['tax calculator', 'VAT calculator', 'income tax calculator', 'Nigeria tax']}
    structuredData={{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "TaxEase Calculator",
      "description": "Nigerian tax calculation tools",
      "applicationCategory": "FinanceApplication"
    }}
  />
);

export const AuditSEO: React.FC = () => (
  <SEOHead
    title="Audit & Reporting"
    description="Comprehensive audit reporting and compliance tracking. Generate audit reports, monitor controls, and ensure regulatory compliance."
    keywords={['audit reporting', 'compliance tracking', 'tax audit', 'regulatory compliance']}
    structuredData={{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "TaxEase Audit & Reporting",
      "description": "Tax audit and compliance reporting platform",
      "applicationCategory": "BusinessApplication"
    }}
  />
);

export const TransferPricingSEO: React.FC = () => (
  <SEOHead
    title="Transfer Pricing"
    description="OECD-compliant transfer pricing documentation and analysis. Create master files, local files, and country-by-country reports."
    keywords={['transfer pricing', 'OECD compliance', 'transfer pricing documentation', 'BEPS']}
    structuredData={{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "TaxEase Transfer Pricing",
      "description": "OECD-compliant transfer pricing documentation platform",
      "applicationCategory": "BusinessApplication"
    }}
  />
);