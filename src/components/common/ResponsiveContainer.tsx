import React from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClass?: string;
  tabletClass?: string;
  desktopClass?: string;
  breakpoints?: {
    mobile?: React.ReactNode;
    tablet?: React.ReactNode;
    desktop?: React.ReactNode;
  };
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  mobileClass,
  tabletClass,
  desktopClass,
  breakpoints
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsiveLayout();

  // If specific breakpoint content is provided, render it
  if (breakpoints) {
    if (isMobile && breakpoints.mobile) return <>{breakpoints.mobile}</>;
    if (isTablet && breakpoints.tablet) return <>{breakpoints.tablet}</>;
    if (isDesktop && breakpoints.desktop) return <>{breakpoints.desktop}</>;
  }

  // Apply responsive classes
  const responsiveClassName = cn(
    className,
    isMobile && mobileClass,
    isTablet && tabletClass,
    isDesktop && desktopClass
  );

  return (
    <div className={responsiveClassName}>
      {children}
    </div>
  );
};

// Grid layout that adapts to screen size
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}> = ({ 
  children, 
  className,
  columns = { mobile: 1, tablet: 2, desktop: 3 }
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsiveLayout();

  const getGridClass = () => {
    if (isMobile) return `grid-cols-${columns.mobile}`;
    if (isTablet) return `grid-cols-${columns.tablet}`;
    if (isDesktop) return `grid-cols-${columns.desktop}`;
    return 'grid-cols-1';
  };

  return (
    <div className={cn('grid gap-4', getGridClass(), className)}>
      {children}
    </div>
  );
};

// Navigation that collapses on mobile
export const ResponsiveNavigation: React.FC<{
  children: React.ReactNode;
  className?: string;
  mobileMenu?: React.ReactNode;
}> = ({ children, className, mobileMenu }) => {
  const { isMobile } = useResponsiveLayout();

  if (isMobile && mobileMenu) {
    return <>{mobileMenu}</>;
  }

  return (
    <nav className={cn('flex items-center space-x-6', className)}>
      {children}
    </nav>
  );
};

// Data display that stacks on mobile
export const ResponsiveDataDisplay: React.FC<{
  label: string;
  value: React.ReactNode;
  className?: string;
}> = ({ label, value, className }) => {
  const { isMobile } = useResponsiveLayout();

  return (
    <div className={cn(
      isMobile ? 'flex flex-col space-y-1' : 'flex items-center justify-between',
      className
    )}>
      <span className={cn(
        'font-medium',
        isMobile ? 'text-sm text-muted-foreground' : 'text-base'
      )}>
        {label}
      </span>
      <span className={cn(
        isMobile ? 'text-base font-semibold' : 'text-base'
      )}>
        {value}
      </span>
    </div>
  );
};