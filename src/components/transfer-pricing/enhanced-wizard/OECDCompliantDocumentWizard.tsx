import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WizardNavigation } from './WizardNavigation';
import { WizardProgress } from './WizardProgress';
import { WizardValidationAlerts } from './WizardValidationAlerts';
import { useTransferPricing } from '@/contexts/TransferPricingContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { EntityDetailsStep } from './steps/EntityDetailsStep';
import { ControlledTransactionsStep } from './steps/ControlledTransactionsStep';
import { FunctionalAnalysisStep } from './steps/FunctionalAnalysisStep';
import { EconomicAnalysisStep } from './steps/EconomicAnalysisStep';
import { OECDComplianceStep } from './steps/OECDComplianceStep';
import { ReviewAndValidationStep } from './steps/ReviewAndValidationStep';
import { useOECDValidation } from '../hooks/useOECDValidation';
import type { DocumentWizardData, ValidationResult } from '../types/wizard-types';
import { logger } from '@/lib/logging/logger';

const WIZARD_STEPS = [
  { id: 1, title: 'Entity Details', description: 'Company information and structure' },
  { id: 2, title: 'Controlled Transactions', description: 'Intercompany transactions' },
  { id: 3, title: 'Functional Analysis', description: 'Functions, assets, and risks' },
  { id: 4, title: 'Economic Analysis', description: 'Pricing methods and benchmarking' },
  { id: 5, title: 'OECD Compliance', description: 'BEPS Action 13 requirements' },
  { id: 6, title: 'Review & Validation', description: 'Final review and generation' }
];

export function OECDCompliantDocumentWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const { announce } = useAccessibility({ announceChanges: true });
  const [wizardData, setWizardData] = useState<DocumentWizardData>({
    entityDetails: {
      companyName: '',
      taxId: '',
      jurisdiction: '',
      businessDescription: '',
      fiscalYearEnd: '',
      reportingCurrency: 'USD',
      ultimateParent: '',
      organizationalStructure: ''
    },
    controlledTransactions: [],
    functionalAnalysis: {
      functions: [],
      assets: [],
      risks: []
    },
    economicAnalysis: {
      pricingMethods: {},
      benchmarkingData: [],
      supportingDocuments: []
    },
    oecdCompliance: {
      masterFileRequired: false,
      localFileRequired: false,
      cbcrRequired: false,
      jurisdictionSpecificRequirements: []
    }
  });

  const { createDocument } = useTransferPricing();
  const { validateStep, validateComplete, getValidationErrors } = useOECDValidation();

  const updateWizardData = useCallback((section: keyof DocumentWizardData, data: any) => {
    setWizardData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  }, []);

  const getStepValidation = (stepId: number): ValidationResult => {
    return validateStep(stepId, wizardData);
  };

  const getOverallProgress = (): number => {
    const totalSteps = WIZARD_STEPS.length;
    let completedSteps = 0;
    
    for (let i = 1; i <= totalSteps; i++) {
      const validation = getStepValidation(i);
      if (validation.isValid) completedSteps++;
    }
    
    return (completedSteps / totalSteps) * 100;
  };

  const canProceedToNext = (): boolean => {
    const validation = getStepValidation(currentStep);
    return validation.isValid || validation.warnings.length === 0;
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
      announce(`Moved to step ${currentStep + 1}: ${WIZARD_STEPS[currentStep].title}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      announce(`Moved back to step ${currentStep - 1}: ${WIZARD_STEPS[currentStep - 2].title}`);
    }
  };

  const handleSubmit = async () => {
    const completeValidation = validateComplete(wizardData);
    
    if (!completeValidation.isValid) {
      return;
    }

    try {
      await createDocument({
        title: `Transfer Pricing Documentation - ${wizardData.entityDetails.companyName}`,
        type: 'local',
        content: JSON.stringify(wizardData),
        status: 'draft',
        compliance_status: 'compliant',
        risk_level: completeValidation.riskLevel || 'medium'
      });
    } catch (error) {
      logger.error('Error creating document', error as Error, { component: 'OECDCompliantDocumentWizard' });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <EntityDetailsStep
            data={wizardData.entityDetails}
            onChange={(data) => updateWizardData('entityDetails', data)}
            validation={getStepValidation(1)}
          />
        );
      case 2:
        return (
          <ControlledTransactionsStep
            data={wizardData.controlledTransactions}
            onChange={(data) => updateWizardData('controlledTransactions', data)}
            validation={getStepValidation(2)}
          />
        );
      case 3:
        return (
          <FunctionalAnalysisStep
            data={wizardData.functionalAnalysis}
            onChange={(data) => updateWizardData('functionalAnalysis', data)}
            validation={getStepValidation(3)}
          />
        );
      case 4:
        return (
          <EconomicAnalysisStep
            data={wizardData.economicAnalysis}
            onChange={(data) => updateWizardData('economicAnalysis', data)}
            validation={getStepValidation(4)}
          />
        );
      case 5:
        return (
          <OECDComplianceStep
            data={wizardData.oecdCompliance}
            entityData={wizardData.entityDetails}
            onChange={(data) => updateWizardData('oecdCompliance', data)}
            validation={getStepValidation(5)}
          />
        );
      case 6:
        return (
          <ReviewAndValidationStep
            data={wizardData}
            validation={validateComplete(wizardData)}
          />
        );
      default:
        return null;
    }
  };

  const currentStepValidation = getStepValidation(currentStep);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <WizardProgress
        currentStep={currentStep}
        totalSteps={WIZARD_STEPS.length}
        progress={getOverallProgress()}
        title="OECD Compliant Transfer Pricing Documentation"
        description="Create comprehensive transfer pricing documentation following OECD BEPS Action 13 guidelines"
      />

      <Card>
        <CardContent className="p-6">
          <WizardNavigation
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            getStepValidation={getStepValidation}
          />
        </CardContent>
      </Card>

      <WizardValidationAlerts validation={currentStepValidation} />

      <Card>
        <CardHeader>
          <CardTitle>{WIZARD_STEPS[currentStep - 1].title}</CardTitle>
          <p className="text-muted-foreground">{WIZARD_STEPS[currentStep - 1].description}</p>
        </CardHeader>
        <CardContent>
          <main role="main" aria-label={`Step ${currentStep}: ${WIZARD_STEPS[currentStep - 1].title}`}>
            {renderStepContent()}
          </main>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <nav className="flex justify-between" role="navigation" aria-label="Wizard navigation">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              aria-label={currentStep === 1 ? "Previous step (disabled - first step)" : "Go to previous step"}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep === WIZARD_STEPS.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateComplete(wizardData).isValid}
                  className="min-w-32"
                  aria-label={!validateComplete(wizardData).isValid ? "Generate document (disabled - validation errors)" : "Generate transfer pricing document"}
                >
                  Generate Document
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className="min-w-32"
                  aria-label={!canProceedToNext() ? "Next step (disabled - validation errors)" : "Go to next step"}
                >
                  Next
                </Button>
              )}
            </div>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}