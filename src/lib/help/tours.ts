import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

// Tour definitions
export interface TourConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: DriveStep[];
  path?: string; // Page where this tour should run
}

export const tours: TourConfig[] = [
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'Learn how to navigate and use your dashboard effectively',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    steps: [
      {
        element: '[data-tour="sidebar"]',
        popover: {
          title: 'Navigation Sidebar',
          description: 'Use the sidebar to navigate between different sections of the app. Click any item to access that feature.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="metrics-cards"]',
        popover: {
          title: 'Quick Metrics',
          description: 'These cards show your key metrics at a glance - active clients, upcoming deadlines, pending documents, and compliance alerts.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[data-tour="recent-activity"]',
        popover: {
          title: 'Recent Activity',
          description: 'Track all your recent actions and document changes here. Stay updated on what\'s happening in your account.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '[data-tour="upcoming-deadlines"]',
        popover: {
          title: 'Upcoming Deadlines',
          description: 'Never miss a deadline! This section shows your upcoming tax filing and compliance deadlines.',
          side: 'top',
          align: 'center',
        },
      },
    ],
  },
  {
    id: 'tax-calculator',
    title: 'Tax Calculator',
    description: 'Master the tax calculation tools and learn to compute different tax types',
    icon: 'Calculator',
    path: '/tax-web-app',
    steps: [
      {
        element: '[data-tour="tax-type-selector"]',
        popover: {
          title: 'Select Tax Type',
          description: 'Choose the type of tax you want to calculate - Income Tax, VAT, Withholding Tax, and more.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[data-tour="tax-input-form"]',
        popover: {
          title: 'Enter Your Details',
          description: 'Fill in the required information for your tax calculation. Each tax type has specific fields.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="calculate-button"]',
        popover: {
          title: 'Calculate',
          description: 'Click here to compute your tax. The results will appear immediately.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '[data-tour="tax-results"]',
        popover: {
          title: 'View Results',
          description: 'Your tax calculation results appear here with a detailed breakdown. You can export these results as PDF.',
          side: 'left',
          align: 'start',
        },
      },
    ],
  },
  {
    id: 'document-vault',
    title: 'Document Vault',
    description: 'Organize and manage your tax documents securely',
    icon: 'FileText',
    path: '/documents',
    steps: [
      {
        element: '[data-tour="upload-button"]',
        popover: {
          title: 'Upload Documents',
          description: 'Click here to upload new documents. We support PDF, images, and common document formats.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[data-tour="document-filters"]',
        popover: {
          title: 'Filter Documents',
          description: 'Use these filters to find documents by type, date, or tax year quickly.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="document-list"]',
        popover: {
          title: 'Your Documents',
          description: 'All your uploaded documents appear here. Click any document to view, download, or manage it.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '[data-tour="document-search"]',
        popover: {
          title: 'Search Documents',
          description: 'Use the search bar to quickly find documents by name or content.',
          side: 'bottom',
          align: 'center',
        },
      },
    ],
  },
  {
    id: 'compliance-tracker',
    title: 'Compliance Tracker',
    description: 'Stay on top of your regulatory compliance requirements',
    icon: 'ShieldCheck',
    path: '/compliance',
    steps: [
      {
        element: '[data-tour="compliance-overview"]',
        popover: {
          title: 'Compliance Overview',
          description: 'See your overall compliance status at a glance. Green means compliant, yellow needs attention, red is overdue.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[data-tour="compliance-items"]',
        popover: {
          title: 'Compliance Items',
          description: 'View all your compliance requirements here. Click any item to see details and update its status.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="add-compliance"]',
        popover: {
          title: 'Add New Requirement',
          description: 'Track new compliance requirements by clicking here. Set deadlines and reminders.',
          side: 'left',
          align: 'center',
        },
      },
    ],
  },
  {
    id: 'calendar-reminders',
    title: 'Calendar & Reminders',
    description: 'Manage your tax calendar and never miss important dates',
    icon: 'Calendar',
    path: '/calendar',
    steps: [
      {
        element: '[data-tour="calendar-view"]',
        popover: {
          title: 'Calendar View',
          description: 'View all your tax deadlines and events on the calendar. Click any date to see or add events.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="add-event"]',
        popover: {
          title: 'Add Event',
          description: 'Create new events and reminders for tax deadlines, meetings, or any important dates.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[data-tour="event-list"]',
        popover: {
          title: 'Upcoming Events',
          description: 'See all your upcoming events and deadlines in a list view for easy reference.',
          side: 'left',
          align: 'start',
        },
      },
    ],
  },
  {
    id: 'notifications-settings',
    title: 'Notification Settings',
    description: 'Configure how and when you receive alerts and reminders',
    icon: 'Bell',
    path: '/settings',
    steps: [
      {
        element: '[data-tour="notification-channels"]',
        popover: {
          title: 'Notification Channels',
          description: 'Choose how you want to receive notifications - Email, SMS, WhatsApp, or all of them.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="email-preferences"]',
        popover: {
          title: 'Email Preferences',
          description: 'Customize your email notification settings. Choose what types of emails you want to receive.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '[data-tour="reminder-settings"]',
        popover: {
          title: 'Reminder Settings',
          description: 'Set how many days before deadlines you want to be reminded.',
          side: 'left',
          align: 'center',
        },
      },
    ],
  },
];

// Create a driver instance for a specific tour
export const createTourDriver = (tourConfig: TourConfig, onComplete?: () => void, onSkip?: () => void) => {
  const driverInstance = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    stagePadding: 8,
    stageRadius: 8,
    popoverClass: 'tour-popover',
    progressText: '{{current}} of {{total}}',
    nextBtnText: 'Next →',
    prevBtnText: '← Previous',
    doneBtnText: 'Done!',
    onDestroyStarted: () => {
      if (driverInstance.hasNextStep()) {
        onSkip?.();
      } else {
        onComplete?.();
      }
      driverInstance.destroy();
    },
    steps: tourConfig.steps,
  });

  return driverInstance;
};

// Get tour by ID
export const getTourById = (tourId: string): TourConfig | undefined => {
  return tours.find(tour => tour.id === tourId);
};

// Get tours for a specific page
export const getToursForPage = (path: string): TourConfig[] => {
  return tours.filter(tour => tour.path === path);
};
