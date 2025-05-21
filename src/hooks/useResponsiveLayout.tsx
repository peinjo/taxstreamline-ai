
import { useState, useEffect } from 'react';

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type Breakpoints = {
  [key in BreakpointKey]: number;
};

export const breakpoints: Breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

type CurrentBreakpoint = {
  breakpoint: BreakpointKey;
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

export function useResponsiveLayout(): CurrentBreakpoint {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<CurrentBreakpoint>({
    breakpoint: 'lg',
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let breakpoint: BreakpointKey = 'xs';
      
      if (width >= breakpoints['2xl']) {
        breakpoint = '2xl';
      } else if (width >= breakpoints.xl) {
        breakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        breakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        breakpoint = 'md';
      } else if (width >= breakpoints.sm) {
        breakpoint = 'sm';
      }

      setCurrentBreakpoint({
        breakpoint,
        width,
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg
      });
    };

    // Initialize on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return currentBreakpoint;
}
