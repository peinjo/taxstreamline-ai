import { ImportError, ImportType, ImportValidationResult } from '@/types/import';

// Validation schemas for different import types
const VALIDATION_SCHEMAS = {
  tax_reports: {
    requiredFields: ['tax_type', 'tax_year', 'amount', 'status'],
    validators: {
      tax_type: (value: any) => {
        const validTypes = ['income_tax', 'vat', 'withholding_tax', 'capital_gains'];
        return validTypes.includes(value?.toLowerCase()) || 'Invalid tax type';
      },
      tax_year: (value: any) => {
        const year = parseInt(value);
        return (!isNaN(year) && year >= 2000 && year <= 2100) || 'Invalid year';
      },
      amount: (value: any) => {
        const amount = parseFloat(value);
        return (!isNaN(amount) && amount >= 0) || 'Invalid amount';
      },
      status: (value: any) => {
        const validStatuses = ['draft', 'submitted', 'approved', 'rejected'];
        return validStatuses.includes(value?.toLowerCase()) || 'Invalid status';
      },
    },
  },
  compliance_items: {
    requiredFields: ['title', 'country', 'requirement_type', 'frequency', 'priority'],
    validators: {
      frequency: (value: any) => {
        const validFreqs = ['annual', 'quarterly', 'monthly', 'once'];
        return validFreqs.includes(value?.toLowerCase()) || 'Invalid frequency';
      },
      priority: (value: any) => {
        const validPriorities = ['low', 'medium', 'high'];
        return validPriorities.includes(value?.toLowerCase()) || 'Invalid priority';
      },
    },
  },
  calendar_events: {
    requiredFields: ['title', 'date', 'category'],
    validators: {
      date: (value: any) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) || 'Invalid date';
      },
      category: (value: any) => {
        const validCategories = ['meeting', 'deadline', 'filing', 'reminder'];
        return validCategories.includes(value?.toLowerCase()) || 'Invalid category';
      },
    },
  },
  tax_calculations: {
    requiredFields: ['tax_type', 'income'],
    validators: {
      income: (value: any) => {
        const income = parseFloat(value);
        return (!isNaN(income) && income >= 0) || 'Invalid income';
      },
    },
  },
};

export const validateImportData = (
  data: any[],
  importType: ImportType
): ImportValidationResult => {
  const errors: ImportError[] = [];
  const validData: any[] = [];
  
  const schema = VALIDATION_SCHEMAS[importType];
  if (!schema) {
    return {
      valid: false,
      errors: [{ row: 0, message: `Unknown import type: ${importType}` }],
      data: [],
    };
  }

  data.forEach((row, index) => {
    const rowErrors: ImportError[] = [];
    const rowNum = index + 2; // +2 because index is 0-based and row 1 is headers

    // Check required fields
    schema.requiredFields.forEach((field) => {
      if (!row[field] || row[field].toString().trim() === '') {
        rowErrors.push({
          row: rowNum,
          field,
          message: `Missing required field: ${field}`,
        });
      }
    });

    // Run field validators
    Object.entries(schema.validators || {}).forEach(([field, validator]) => {
      if (row[field]) {
        const result = validator(row[field]);
        if (result !== true) {
          rowErrors.push({
            row: rowNum,
            field,
            message: result as string,
            data: row[field],
          });
        }
      }
    });

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      validData.push(row);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    data: validData,
  };
};

export const normalizeHeaders = (headers: string[]): string[] => {
  return headers.map(h => 
    h.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
  );
};
