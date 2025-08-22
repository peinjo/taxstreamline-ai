import { useMemo } from 'react';
import type { DocumentWizardData, ValidationResult, StepValidation, ValidationRule } from '../types/wizard-types';

const STEP_VALIDATIONS: Record<number, StepValidation> = {
  1: {
    stepId: 1,
    requiredFields: ['companyName', 'taxId', 'jurisdiction', 'businessDescription', 'fiscalYearEnd'],
    optionalFields: ['reportingCurrency', 'ultimateParent', 'organizationalStructure'],
    validationRules: [
      {
        field: 'companyName',
        rule: 'minLength',
        value: 2,
        message: 'Company name must be at least 2 characters long'
      },
      {
        field: 'taxId',
        rule: 'pattern',
        value: /^[A-Za-z0-9\-\/]+$/,
        message: 'Tax ID format is invalid'
      },
      {
        field: 'businessDescription',
        rule: 'minLength',
        value: 20,
        message: 'Business description should be at least 20 characters for OECD compliance'
      }
    ]
  },
  2: {
    stepId: 2,
    requiredFields: ['controlledTransactions'],
    optionalFields: [],
    validationRules: [
      {
        field: 'controlledTransactions',
        rule: 'custom',
        message: 'At least one controlled transaction is required',
        validator: (value: unknown[]) => value && value.length > 0
      }
    ]
  },
  3: {
    stepId: 3,
    requiredFields: ['functions', 'assets', 'risks'],
    optionalFields: [],
    validationRules: [
      {
        field: 'functions',
        rule: 'custom',
        message: 'At least two significant functions must be documented for OECD compliance',
        validator: (value: unknown[]) => value && value.length >= 2
      },
      {
        field: 'assets',
        rule: 'custom',
        message: 'Key assets should be documented',
        validator: (value: unknown[]) => value && value.length >= 1
      },
      {
        field: 'risks',
        rule: 'custom',
        message: 'Risk analysis is required for OECD BEPS Action 13',
        validator: (value: unknown[]) => value && value.length >= 1
      }
    ]
  },
  4: {
    stepId: 4,
    requiredFields: ['pricingMethods'],
    optionalFields: ['benchmarkingData', 'supportingDocuments'],
    validationRules: [
      {
        field: 'pricingMethods',
        rule: 'custom',
        message: 'At least one pricing method analysis is required',
        validator: (value: unknown) => value && typeof value === 'object' && value !== null && Object.keys(value).length > 0
      }
    ]
  },
  5: {
    stepId: 5,
    requiredFields: ['jurisdictionSpecificRequirements'],
    optionalFields: ['masterFileRequired', 'localFileRequired', 'cbcrRequired'],
    validationRules: []
  },
  6: {
    stepId: 6,
    requiredFields: [],
    optionalFields: [],
    validationRules: []
  }
};

const OECD_THRESHOLDS = {
  MULTINATIONAL_REVENUE: 750_000_000, // EUR 750 million for CbCR
  LOCAL_FILE_THRESHOLD: 50_000_000,   // Common threshold for local file
  MASTER_FILE_THRESHOLD: 50_000_000   // Common threshold for master file
};

export function useOECDValidation() {
  const validateField = (field: string, value: unknown, rules: ValidationRule[]): string[] => {
    const errors: string[] = [];
    
    const fieldRules = rules.filter(rule => rule.field === field);
    
    for (const rule of fieldRules) {
      switch (rule.rule) {
        case 'required':
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(rule.message);
          }
          break;
        case 'minLength':
          if (typeof value === 'string' && typeof rule.value === 'number' && value.length < rule.value) {
            errors.push(rule.message);
          }
          break;
        case 'maxLength':
          if (typeof value === 'string' && typeof rule.value === 'number' && value.length > rule.value) {
            errors.push(rule.message);
          }
          break;
        case 'pattern':
          if (typeof value === 'string' && rule.value instanceof RegExp && !rule.value.test(value)) {
            errors.push(rule.message);
          }
          break;
        case 'custom':
          if (rule.validator && !rule.validator(value, null)) {
            errors.push(rule.message);
          }
          break;
      }
    }
    
    return errors;
  };

  const validateStep = (stepId: number, data: DocumentWizardData): ValidationResult => {
    const stepValidation = STEP_VALIDATIONS[stepId];
    if (!stepValidation) {
      return { isValid: true, errors: [], warnings: [], completeness: 100 };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    let stepData: Record<string, unknown>;
    switch (stepId) {
      case 1:
        stepData = data.entityDetails as unknown as Record<string, unknown>;
        break;
      case 2:
        stepData = { controlledTransactions: data.controlledTransactions };
        break;
      case 3:
        stepData = data.functionalAnalysis as unknown as Record<string, unknown>;
        break;
      case 4:
        stepData = data.economicAnalysis as unknown as Record<string, unknown>;
        break;
      case 5:
        stepData = data.oecdCompliance as unknown as Record<string, unknown>;
        break;
      case 6:
        stepData = data as unknown as Record<string, unknown>;
        break;
      default:
        stepData = {};
    }

    // Validate required fields
    for (const field of stepValidation.requiredFields) {
      const value = stepData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
      
      // Apply field-specific validation rules
      const fieldErrors = validateField(field, value, stepValidation.validationRules);
      errors.push(...fieldErrors);
    }

    // Apply custom validation rules
    for (const rule of stepValidation.validationRules) {
      if (rule.rule === 'custom' && rule.validator) {
        const value = stepData[rule.field];
        if (!rule.validator(value, stepData)) {
          errors.push(rule.message);
        }
      }
    }

    // Step-specific warnings
    if (stepId === 1) {
      if (!stepData.ultimateParent) {
        warnings.push('Ultimate parent entity information is recommended for comprehensive documentation');
      }
      if (!stepData.organizationalStructure) {
        warnings.push('Organizational structure diagram would enhance OECD compliance');
      }
    }

    if (stepId === 2 && data.controlledTransactions.length < 3) {
      warnings.push('Consider documenting all material intercompany transactions for complete OECD compliance');
    }

    if (stepId === 4) {
      const hasAdvancedMethods = Object.values(data.economicAnalysis.pricingMethods).some(
        method => ['TNMM', 'CPM', 'PSM'].includes(method.method)
      );
      if (!hasAdvancedMethods) {
        warnings.push('Advanced pricing methods (TNMM, CPM, PSM) may provide better documentation support');
      }
    }

    const totalFields = stepValidation.requiredFields.length + stepValidation.optionalFields.length;
    const completedFields = stepValidation.requiredFields.filter(field => 
      stepData[field] && (typeof stepData[field] !== 'string' || stepData[field].trim() !== '')
    ).length + stepValidation.optionalFields.filter(field => 
      stepData[field] && (typeof stepData[field] !== 'string' || stepData[field].trim() !== '')
    ).length;

    const completeness = totalFields > 0 ? (completedFields / totalFields) * 100 : 100;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness
    };
  };

  const validateComplete = (data: DocumentWizardData): ValidationResult => {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    let totalCompleteness = 0;

    // Validate all steps
    for (let stepId = 1; stepId <= 6; stepId++) {
      const stepResult = validateStep(stepId, data);
      allErrors.push(...stepResult.errors);
      allWarnings.push(...stepResult.warnings);
      totalCompleteness += stepResult.completeness;
    }

    const overallCompleteness = totalCompleteness / 6;

    // Determine risk level based on OECD compliance
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    const totalTransactionValue = data.controlledTransactions.reduce(
      (sum, transaction) => sum + transaction.amount, 0
    );

    if (allErrors.length > 5) {
      riskLevel = 'critical';
    } else if (allErrors.length > 2 || totalTransactionValue > OECD_THRESHOLDS.LOCAL_FILE_THRESHOLD) {
      riskLevel = 'high';
    } else if (allWarnings.length > 3) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    // OECD-specific validations
    if (totalTransactionValue > OECD_THRESHOLDS.MULTINATIONAL_REVENUE && !data.oecdCompliance.cbcrRequired) {
      allWarnings.push('Consider Country-by-Country Reporting requirements for large multinationals');
    }

    if (data.controlledTransactions.some(t => t.type === 'intangible_property') && 
        !data.economicAnalysis.pricingMethods['intangibles']) {
      allWarnings.push('Intangible property transactions require special OECD DEMPE analysis');
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      completeness: overallCompleteness,
      riskLevel
    };
  };

  const getValidationErrors = (data: DocumentWizardData): string[] => {
    const result = validateComplete(data);
    return result.errors;
  };

  return {
    validateStep,
    validateComplete,
    getValidationErrors
  };
}