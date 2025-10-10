import React from 'react';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FEATURE_CONFIGS, type FeatureKey } from '@/hooks/useFeatureUnlock';

interface LockedFeatureBadgeProps {
  featureKey: FeatureKey;
  progress: number;
  variant?: 'default' | 'compact';
}

export const LockedFeatureBadge: React.FC<LockedFeatureBadgeProps> = ({
  featureKey,
  progress,
  variant = 'default',
}) => {
  const config = FEATURE_CONFIGS[featureKey];

  if (!config) return null;

  const getRemainingText = () => {
    const { metrics } = config.unlockCriteria;
    const firstMetric = Object.entries(metrics)[0];
    
    if (!firstMetric) return '';

    const [key, required] = firstMetric;
    const metricLabels: Record<string, string> = {
      tax_reports: 'tax reports',
      documents: 'documents',
      transactions: 'transactions',
      days_active: 'days',
    };

    return `${metricLabels[key] || key}`;
  };

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 border-muted-foreground/30">
              <Lock className="h-3 w-3" />
              <span className="text-xs">{progress}%</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">{config.name}</p>
              <p className="text-sm text-muted-foreground">{config.description}</p>
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {progress}% complete - {getRemainingText()}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2 rounded-lg border border-muted bg-muted/20 px-3 py-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium truncate">{config.name}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-base">{config.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Benefits when unlocked:
              </p>
              <ul className="space-y-0.5">
                {config.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Keep using the platform to unlock this feature!
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
