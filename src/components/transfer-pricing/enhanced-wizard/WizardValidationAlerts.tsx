import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import type { ValidationResult } from '../types/wizard-types';

interface WizardValidationAlertsProps {
  validation: ValidationResult;
}

export const WizardValidationAlerts: React.FC<WizardValidationAlertsProps> = ({
  validation
}) => {
  return (
    <>
      {validation.errors.length > 0 && (
        <Alert variant="destructive" role="alert">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            <strong>Please fix the following errors before proceeding:</strong>
            <ul 
              className="list-disc list-inside mt-2 space-y-1"
              role="list"
              aria-label="Validation errors"
            >
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm" role="listitem">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert role="alert">
          <Info className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            <strong>Recommendations:</strong>
            <ul 
              className="list-disc list-inside mt-2 space-y-1"
              role="list"
              aria-label="Validation warnings"
            >
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-sm" role="listitem">
                  {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};