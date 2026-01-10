import posthog from 'posthog-js';

// PostHog configuration - read from environment variable with fallback
const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY || '';
const POSTHOG_HOST = 'https://app.posthog.com';

let isInitialized = false;

export const initPostHog = () => {
  // Only initialize if not already done or if API key is not configured
  if (isInitialized || !POSTHOG_API_KEY) {
    if (!POSTHOG_API_KEY && import.meta.env.DEV) {
      console.warn('[PostHog] API key not configured - analytics disabled');
    }
    return;
  }

  posthog.init(POSTHOG_API_KEY, {
    api_host: POSTHOG_HOST,
    // Capture page views automatically
    capture_pageview: true,
    // Capture page leaves automatically
    capture_pageleave: true,
    // Session recording settings
    disable_session_recording: import.meta.env.DEV,
    // Respect Do Not Track
    respect_dnt: true,
    // Persistence
    persistence: 'localStorage+cookie',
    // Autocapture settings
    autocapture: {
      dom_event_allowlist: ['click', 'submit', 'change'],
      element_allowlist: ['button', 'a', 'input', 'select', 'textarea'],
    },
    // Loaded callback
    loaded: () => {
      if (import.meta.env.DEV) {
        console.log('[PostHog] Initialized successfully');
      }
      isInitialized = true;
    },
  });
};

export const identifyUser = (userId: string, traits?: Record<string, unknown>) => {
  if (!isInitialized) return;
  
  posthog.identify(userId, traits);
  
  if (import.meta.env.DEV) {
    console.log('[PostHog] User identified:', userId);
  }
};

export const resetUser = () => {
  if (!isInitialized) return;
  
  posthog.reset();
  
  if (import.meta.env.DEV) {
    console.log('[PostHog] User reset');
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (!isInitialized) {
    if (import.meta.env.DEV) {
      console.log('[PostHog] Event (dev mode):', eventName, properties);
    }
    return;
  }
  
  posthog.capture(eventName, properties);
};

export const setUserProperties = (properties: Record<string, unknown>) => {
  if (!isInitialized) return;
  
  posthog.setPersonProperties(properties);
};

export const trackPageView = (pageName?: string, properties?: Record<string, unknown>) => {
  if (!isInitialized) return;
  
  posthog.capture('$pageview', {
    $current_url: window.location.href,
    page_name: pageName,
    ...properties,
  });
};

// Feature flags
export const isFeatureEnabled = (flagKey: string): boolean => {
  if (!isInitialized) return false;
  
  return posthog.isFeatureEnabled(flagKey) || false;
};

export const getFeatureFlag = (flagKey: string): string | boolean | undefined => {
  if (!isInitialized) return undefined;
  
  return posthog.getFeatureFlag(flagKey);
};

export { posthog };
