import { lazy } from 'react';

// Lazy load heavy components for better performance
export const TransferPricingPage = lazy(() => import('@/pages/TransferPricing'));
export const AuditReportingPage = lazy(() => import('@/pages/AuditReporting'));
export const TaxWebAppPage = lazy(() => import('@/pages/TaxWebApp'));
export const GlobalReportingPage = lazy(() => import('@/pages/GlobalReporting'));
export const CalendarPage = lazy(() => import('@/pages/Calendar'));
export const CompliancePage = lazy(() => import('@/pages/Compliance'));
export const AIAssistantPage = lazy(() => import('@/pages/AIAssistant'));

// Heavy components within modules - using direct imports since these don't have default exports
// These would be used with Suspense wrapper for lazy loading
export { default as TPDashboard } from '@/components/transfer-pricing/TPDashboard';

// Note: For proper lazy loading, these components would need to be wrapped in Suspense
// and ideally have default exports. For now, direct imports are used.