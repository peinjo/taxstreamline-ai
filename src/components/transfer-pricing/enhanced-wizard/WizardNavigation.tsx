import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useAccessibility } from '@/hooks/useAccessibility';
import type { ValidationResult } from '../types/wizard-types';

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

interface WizardNavigationProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  getStepValidation: (stepId: number) => ValidationResult;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  steps,
  currentStep,
  onStepClick,
  getStepValidation
}) => {
  const { getAriaProps, getFocusProps } = useAccessibility();

  return (
    <nav 
      className="flex items-center justify-between space-x-4 overflow-x-auto"
      role="navigation"
      {...getAriaProps("Wizard step navigation")}
    >
      {steps.map((step, index) => {
        const validation = getStepValidation(step.id);
        const isActive = currentStep === step.id;
        const isCompleted = validation.isValid;
        const hasWarnings = validation.warnings.length > 0;
        const isClickable = onStepClick && (isCompleted || isActive);

        const StepComponent = isClickable ? 'button' : 'div';

        return (
          <StepComponent
            key={step.id}
            className={`flex flex-col items-center space-y-2 min-w-0 flex-1 ${
              isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
            } ${isClickable ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-2' : ''}`}
            onClick={isClickable ? () => onStepClick(step.id) : undefined}
            {...(isClickable && {
              'aria-label': `Go to step ${step.id}: ${step.title}`,
              'aria-current': isActive ? 'step' : undefined,
              ...getFocusProps(index, steps.length)
            })}
            {...(!isClickable && {
              'aria-label': `Step ${step.id}: ${step.title} - ${isCompleted ? 'completed' : hasWarnings ? 'has warnings' : 'not completed'}`,
              'aria-current': isActive ? 'step' : undefined
            })}
          >
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              isActive 
                ? 'border-primary bg-primary text-primary-foreground' 
                : isCompleted 
                  ? 'border-green-600 bg-green-600 text-white'
                  : hasWarnings
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-muted-foreground bg-background'
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
              ) : hasWarnings ? (
                <AlertTriangle className="h-4 w-4 text-yellow-600" aria-hidden="true" />
              ) : (
                <span className="text-sm font-medium" aria-hidden="true">{step.id}</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium truncate">{step.title}</p>
              <p className="text-xs text-muted-foreground truncate">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div 
                className="absolute top-5 left-full w-full h-0.5 bg-border transform translate-x-2" 
                aria-hidden="true"
              />
            )}
          </StepComponent>
        );
      })}
    </nav>
  );
};