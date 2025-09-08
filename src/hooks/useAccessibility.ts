import { useEffect, useCallback, useRef } from 'react';

export interface AccessibilityOptions {
  trapFocus?: boolean;
  announceChanges?: boolean;
  manageFocus?: boolean;
}

export function useAccessibility(options: AccessibilityOptions = {}) {
  const { trapFocus = false, announceChanges = false, manageFocus = true } = options;
  const previousFocus = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  // Focus management
  const saveFocus = useCallback(() => {
    previousFocus.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocus.current && manageFocus) {
      previousFocus.current.focus();
    }
  }, [manageFocus]);

  const setInitialFocus = useCallback((selector?: string) => {
    if (!containerRef.current) return;
    
    const firstFocusable = selector 
      ? containerRef.current.querySelector(selector) as HTMLElement
      : containerRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
    
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, []);

  // Focus trap for modals/dialogs
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!trapFocus || !containerRef.current) return;

    if (event.key === 'Tab') {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    if (event.key === 'Escape') {
      restoreFocus();
    }
  }, [trapFocus, restoreFocus]);

  // Screen reader announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, [announceChanges]);

  useEffect(() => {
    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, trapFocus]);

  return {
    containerRef,
    saveFocus,
    restoreFocus,
    setInitialFocus,
    announce,
    // Accessibility helpers
    getAriaProps: (label: string, description?: string) => ({
      'aria-label': label,
      'aria-describedby': description,
    }),
    getFocusProps: (index: number, total: number) => ({
      'aria-setsize': total,
      'aria-posinset': index + 1,
    }),
  };
}

// Hook for managing loading states accessibility
export function useLoadingAnnouncement() {
  const announce = useCallback((isLoading: boolean, loadingText = 'Loading', completeText = 'Content loaded') => {
    if (isLoading) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = loadingText;
      document.body.appendChild(announcement);
    } else {
      // Announce completion
      setTimeout(() => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = completeText;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }, 100);
    }
  }, []);

  return { announce };
}