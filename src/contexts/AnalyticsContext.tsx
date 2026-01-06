import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initPostHog, identifyUser, resetUser, trackPageView } from '@/lib/analytics/posthog';
import { useAuth } from './AuthContext';

interface AnalyticsContextType {
  identifyUser: (userId: string, traits?: Record<string, any>) => void;
  resetUser: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Identify user when auth state changes
  useEffect(() => {
    if (user) {
      identifyUser(user.id, {
        email: user.email,
        created_at: user.created_at,
      });
    } else {
      resetUser();
    }
  }, [user]);

  // Track page views on route change
  useEffect(() => {
    const pageName = getPageNameFromPath(location.pathname);
    trackPageView(pageName, { path: location.pathname });
  }, [location.pathname]);

  const value: AnalyticsContextType = {
    identifyUser,
    resetUser,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Helper to extract readable page names from paths
function getPageNameFromPath(path: string): string {
  const pathMap: Record<string, string> = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/auth/login': 'Login',
    '/auth/register': 'Register',
    '/tax-web-app': 'Tax Calculator',
    '/documents': 'Document Vault',
    '/calendar': 'Calendar',
    '/compliance': 'Compliance Tracker',
    '/settings': 'Settings',
    '/audit-reporting': 'Audit & Reporting',
    '/global-tax': 'Global Tax',
    '/notifications': 'Notifications',
    '/filing-packs': 'Filing Packs',
    '/ai-assistant': 'AI Assistant',
  };

  return pathMap[path] || path.split('/').pop() || 'Unknown';
}
