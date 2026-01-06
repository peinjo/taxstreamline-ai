import { trackEvent } from './posthog';

// ============================================
// Analytics Event Definitions & Tracking Helpers
// ============================================

// Event categories
export const EventCategory = {
  AUTH: 'auth',
  TAX: 'tax',
  DOCUMENT: 'document',
  COMPLIANCE: 'compliance',
  NOTIFICATION: 'notification',
  SETTINGS: 'settings',
  NAVIGATION: 'navigation',
  HELP: 'help',
  ONBOARDING: 'onboarding',
} as const;

// Event names - structured for analytics clarity
export const AnalyticsEvents = {
  // Authentication events
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  
  // Tax calculation events
  TAX_CALCULATION_STARTED: 'tax_calculation_started',
  TAX_CALCULATION_COMPLETED: 'tax_calculation_completed',
  TAX_TYPE_SELECTED: 'tax_type_selected',
  TAX_RESULT_VIEWED: 'tax_result_viewed',
  TAX_RESULT_EXPORTED: 'tax_result_exported',
  
  // Document events
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_DELETED: 'document_deleted',
  DOCUMENT_VIEWED: 'document_viewed',
  DOCUMENT_SEARCHED: 'document_searched',
  
  // Compliance events
  COMPLIANCE_ITEM_CREATED: 'compliance_item_created',
  COMPLIANCE_ITEM_UPDATED: 'compliance_item_updated',
  COMPLIANCE_STATUS_CHANGED: 'compliance_status_changed',
  COMPLIANCE_DEADLINE_SET: 'compliance_deadline_set',
  
  // Calendar events
  CALENDAR_EVENT_CREATED: 'calendar_event_created',
  CALENDAR_EVENT_UPDATED: 'calendar_event_updated',
  CALENDAR_EVENT_DELETED: 'calendar_event_deleted',
  REMINDER_SET: 'reminder_set',
  
  // Notification events
  NOTIFICATION_CHANNEL_ENABLED: 'notification_channel_enabled',
  NOTIFICATION_CHANNEL_DISABLED: 'notification_channel_disabled',
  NOTIFICATION_PREFERENCES_UPDATED: 'notification_preferences_updated',
  
  // Settings events
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_CHANGED: 'settings_changed',
  THEME_CHANGED: 'theme_changed',
  
  // Navigation events
  PAGE_VIEWED: 'page_viewed',
  FEATURE_ACCESSED: 'feature_accessed',
  SIDEBAR_ITEM_CLICKED: 'sidebar_item_clicked',
  
  // Help & Onboarding events
  TOUR_STARTED: 'tour_started',
  TOUR_COMPLETED: 'tour_completed',
  TOUR_SKIPPED: 'tour_skipped',
  TOUR_STEP_VIEWED: 'tour_step_viewed',
  HELP_OPENED: 'help_opened',
  FAQ_VIEWED: 'faq_viewed',
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  
  // Feature unlock events
  FEATURE_UNLOCKED: 'feature_unlocked',
} as const;

// ============================================
// Tracking Helper Functions
// ============================================

// Auth tracking
export const trackSignUp = (method: string = 'email') => {
  trackEvent(AnalyticsEvents.USER_SIGNED_UP, {
    category: EventCategory.AUTH,
    method,
  });
};

export const trackLogin = (method: string = 'email') => {
  trackEvent(AnalyticsEvents.USER_LOGGED_IN, {
    category: EventCategory.AUTH,
    method,
  });
};

export const trackLogout = () => {
  trackEvent(AnalyticsEvents.USER_LOGGED_OUT, {
    category: EventCategory.AUTH,
  });
};

// Tax tracking
export const trackTaxCalculation = (taxType: string, completed: boolean, result?: number) => {
  const eventName = completed 
    ? AnalyticsEvents.TAX_CALCULATION_COMPLETED 
    : AnalyticsEvents.TAX_CALCULATION_STARTED;
  
  trackEvent(eventName, {
    category: EventCategory.TAX,
    tax_type: taxType,
    result_amount: result,
  });
};

export const trackTaxExport = (taxType: string, format: string) => {
  trackEvent(AnalyticsEvents.TAX_RESULT_EXPORTED, {
    category: EventCategory.TAX,
    tax_type: taxType,
    export_format: format,
  });
};

// Document tracking
export const trackDocumentAction = (
  action: 'upload' | 'download' | 'delete' | 'view',
  documentType: string,
  fileSize?: number
) => {
  const eventMap = {
    upload: AnalyticsEvents.DOCUMENT_UPLOADED,
    download: AnalyticsEvents.DOCUMENT_DOWNLOADED,
    delete: AnalyticsEvents.DOCUMENT_DELETED,
    view: AnalyticsEvents.DOCUMENT_VIEWED,
  };
  
  trackEvent(eventMap[action], {
    category: EventCategory.DOCUMENT,
    document_type: documentType,
    file_size: fileSize,
  });
};

// Compliance tracking
export const trackComplianceAction = (
  action: 'create' | 'update' | 'status_change',
  itemType: string,
  status?: string
) => {
  const eventMap = {
    create: AnalyticsEvents.COMPLIANCE_ITEM_CREATED,
    update: AnalyticsEvents.COMPLIANCE_ITEM_UPDATED,
    status_change: AnalyticsEvents.COMPLIANCE_STATUS_CHANGED,
  };
  
  trackEvent(eventMap[action], {
    category: EventCategory.COMPLIANCE,
    item_type: itemType,
    status,
  });
};

// Notification tracking
export const trackNotificationPreferences = (
  channel: 'email' | 'sms' | 'whatsapp' | 'push',
  enabled: boolean
) => {
  const eventName = enabled 
    ? AnalyticsEvents.NOTIFICATION_CHANNEL_ENABLED 
    : AnalyticsEvents.NOTIFICATION_CHANNEL_DISABLED;
  
  trackEvent(eventName, {
    category: EventCategory.NOTIFICATION,
    channel,
  });
};

// Navigation tracking
export const trackPageView = (pageName: string, path: string) => {
  trackEvent(AnalyticsEvents.PAGE_VIEWED, {
    category: EventCategory.NAVIGATION,
    page_name: pageName,
    path,
  });
};

export const trackFeatureAccess = (featureName: string) => {
  trackEvent(AnalyticsEvents.FEATURE_ACCESSED, {
    category: EventCategory.NAVIGATION,
    feature_name: featureName,
  });
};

// Help & Tour tracking
export const trackTourAction = (
  action: 'start' | 'complete' | 'skip' | 'step',
  tourId: string,
  stepIndex?: number
) => {
  const eventMap = {
    start: AnalyticsEvents.TOUR_STARTED,
    complete: AnalyticsEvents.TOUR_COMPLETED,
    skip: AnalyticsEvents.TOUR_SKIPPED,
    step: AnalyticsEvents.TOUR_STEP_VIEWED,
  };
  
  trackEvent(eventMap[action], {
    category: EventCategory.HELP,
    tour_id: tourId,
    step_index: stepIndex,
  });
};

export const trackHelpAction = (action: 'open' | 'faq_view', articleId?: string) => {
  const eventName = action === 'open' 
    ? AnalyticsEvents.HELP_OPENED 
    : AnalyticsEvents.FAQ_VIEWED;
  
  trackEvent(eventName, {
    category: EventCategory.HELP,
    article_id: articleId,
  });
};

// Onboarding tracking
export const trackOnboardingAction = (
  action: 'start' | 'complete' | 'skip' | 'step',
  step?: number
) => {
  const eventMap = {
    start: AnalyticsEvents.ONBOARDING_STARTED,
    complete: AnalyticsEvents.ONBOARDING_COMPLETED,
    skip: AnalyticsEvents.ONBOARDING_SKIPPED,
    step: AnalyticsEvents.ONBOARDING_STEP_COMPLETED,
  };
  
  trackEvent(eventMap[action], {
    category: EventCategory.ONBOARDING,
    step,
  });
};

// Settings tracking
export const trackSettingsChange = (settingName: string, value?: any) => {
  trackEvent(AnalyticsEvents.SETTINGS_CHANGED, {
    category: EventCategory.SETTINGS,
    setting_name: settingName,
    value,
  });
};
