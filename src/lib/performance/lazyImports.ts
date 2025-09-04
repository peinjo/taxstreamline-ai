import { lazy } from 'react';

// Lazy load heavy pages for better performance
export const TransferPricingPage = lazy(() => import('@/pages/TransferPricing'));
export const AuditReportingPage = lazy(() => import('@/pages/AuditReporting'));
export const TaxWebAppPage = lazy(() => import('@/pages/TaxWebApp'));
export const GlobalReportingPage = lazy(() => import('@/pages/GlobalReporting'));
export const CalendarPage = lazy(() => import('@/pages/Calendar'));
export const CompliancePage = lazy(() => import('@/pages/Compliance'));
export const AIAssistantPage = lazy(() => import('@/pages/AIAssistant'));

// Lazy load heavy components within modules
export const SmartDocumentGenerator = lazy(() => import('@/components/transfer-pricing/ai/SmartDocumentGenerator').then(m => ({ default: m.SmartDocumentGenerator })));
export const OECDCompliantDocumentWizard = lazy(() => import('@/components/transfer-pricing/enhanced-wizard/OECDCompliantDocumentWizard').then(m => ({ default: m.OECDCompliantDocumentWizard })));