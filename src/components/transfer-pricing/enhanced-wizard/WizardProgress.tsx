import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAccessibility } from '@/hooks/useAccessibility';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  title: string;
  description: string;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
  progress,
  title,
  description
}) => {
  const { getAriaProps } = useAccessibility();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          <Badge 
            variant="outline" 
            className="px-3 py-1"
            {...getAriaProps(`Currently on step ${currentStep} of ${totalSteps}`)}
          >
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
            aria-label={`Wizard completion progress: ${Math.round(progress)}%`}
          />
          <div className="sr-only" aria-live="polite">
            Progress: {Math.round(progress)}% complete
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};