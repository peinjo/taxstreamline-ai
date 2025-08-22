import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useTransferPricing } from '@/contexts/TransferPricingContext';
import { EntityDetailsStep } from './steps/EntityDetailsStep';
import { ControlledTransactionsStep } from './steps/ControlledTransactionsStep';
import { FunctionalAnalysisStep } from './steps/FunctionalAnalysisStep';
import { EconomicAnalysisStep } from './steps/EconomicAnalysisStep';
import { OECDComplianceStep } from './steps/OECDComplianceStep';
import { ReviewAndValidationStep } from './steps/ReviewAndValidationStep';
import { useOECDValidation } from '../hooks/useOECDValidation';
import type { DocumentWizardData, ValidationResult } from '../types/wizard-types';

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
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
      console.error('Error creating document:', error);
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
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">OECD Compliant Transfer Pricing Documentation</CardTitle>
              <p className="text-muted-foreground mt-1">
                Create comprehensive transfer pricing documentation following OECD BEPS Action 13 guidelines
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Step {currentStep} of {WIZARD_STEPS.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(getOverallProgress())}%</span>
            </div>
            <Progress value={getOverallProgress()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4 overflow-x-auto">
            {WIZARD_STEPS.map((step, index) => {
              const validation = getStepValidation(step.id);
              const isActive = currentStep === step.id;
              const isCompleted = validation.isValid;
              const hasWarnings = validation.warnings.length > 0;

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 min-w-0 flex-1 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}
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
                      <CheckCircle className="h-5 w-5" />
                    ) : hasWarnings ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium truncate">{step.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="absolute top-5 left-full w-full h-0.5 bg-border transform translate-x-2" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Validation Alerts */}
      {currentStepValidation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors before proceeding:
            <ul className="list-disc list-inside mt-2 space-y-1">
              {currentStepValidation.errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {currentStepValidation.warnings.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Recommendations:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {currentStepValidation.warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{WIZARD_STEPS[currentStep - 1].title}</CardTitle>
          <p className="text-muted-foreground">{WIZARD_STEPS[currentStep - 1].description}</p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep === WIZARD_STEPS.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateComplete(wizardData).isValid}
                  className="min-w-32"
                >
                  Generate Document
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className="min-w-32"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}