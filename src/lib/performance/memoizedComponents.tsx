import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Memoized metric card component
export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MetricCard = memo<MetricCardProps>(({ 
  title, 
  value, 
  icon, 
  className,
  onClick 
}) => (
  <Card className={className} onClick={onClick}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </CardContent>
  </Card>
));

MetricCard.displayName = 'MetricCard';

// Memoized list item component
export interface ListItemProps {
  title: string;
  subtitle: string;
  status?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: React.ReactNode;
}

export const ListItem = memo<ListItemProps>(({ 
  title, 
  subtitle, 
  status,
  badge,
  actions 
}) => (
  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      {status && (
        <p className="text-xs text-muted-foreground mt-1">{status}</p>
      )}
    </div>
    <div className="flex items-center gap-2">
      {badge && (
        <Badge variant={badge.variant || 'default'}>
          {badge.text}
        </Badge>
      )}
      {actions}
    </div>
  </div>
));

ListItem.displayName = 'ListItem';

// Memoized loading skeleton
export interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton = memo<LoadingSkeletonProps>(({ 
  rows = 3, 
  className 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Memoized empty state component
export interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export const EmptyState = memo<EmptyStateProps>(({ 
  title, 
  description, 
  action,
  icon 
}) => (
  <div className="text-center py-8">
    {icon && (
      <div className="mx-auto mb-4 text-muted-foreground">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    {action && (
      <Button onClick={action.onClick} variant="outline">
        {action.text}
      </Button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';