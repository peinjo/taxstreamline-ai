export interface EntityDetails {
  companyName: string;
  taxId: string;
  jurisdiction: string;
  businessDescription: string;
  fiscalYearEnd: string;
  reportingCurrency: string;
  ultimateParent: string;
  organizationalStructure: string;
}

export interface ControlledTransaction {
  id: string;
  type: 'tangible_goods' | 'intangible_property' | 'services' | 'financial_transactions' | 'other';
  description: string;
  relatedParties: string[];
  amount: number;
  currency: string;
  pricingMethod: 'CUP' | 'TNMM' | 'CPM' | 'PSM' | 'OTHER';
  jurisdiction: string;
  taxYear: string;
  supportingDocuments: string[];
}

export interface FunctionalAnalysis {
  functions: FunctionItem[];
  assets: AssetItem[];
  risks: RiskItem[];
}

export interface FunctionItem {
  id: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
  relatedTransactions: string[];
}

export interface AssetItem {
  id: string;
  type: 'tangible' | 'intangible' | 'financial';
  description: string;
  value: number;
  currency: string;
  significance: 'high' | 'medium' | 'low';
}

export interface RiskItem {
  id: string;
  type: 'market' | 'credit' | 'operational' | 'regulatory' | 'other';
  description: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface EconomicAnalysis {
  pricingMethods: Record<string, PricingMethodAnalysis>;
  benchmarkingData: BenchmarkData[];
  supportingDocuments: string[];
}

export interface PricingMethodAnalysis {
  method: 'CUP' | 'TNMM' | 'CPM' | 'PSM' | 'OTHER';
  rationale: string;
  testedParty: string;
  profitLevelIndicator?: string;
  armLengthRange: {
    min: number;
    max: number;
    median: number;
    interquartileRange: [number, number];
  };
}

export interface BenchmarkData {
  id: string;
  source: string;
  comparableName: string;
  industry: string;
  geography: string;
  financialData: Record<string, number>;
  rejectionReason?: string;
  reliability: 'high' | 'medium' | 'low';
}

export interface OECDCompliance {
  masterFileRequired: boolean;
  localFileRequired: boolean;
  cbcrRequired: boolean;
  jurisdictionSpecificRequirements: JurisdictionRequirement[];
}

export interface JurisdictionRequirement {
  jurisdiction: string;
  requirement: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  documentation: string[];
}

export interface DocumentWizardData {
  entityDetails: EntityDetails;
  controlledTransactions: ControlledTransaction[];
  functionalAnalysis: FunctionalAnalysis;
  economicAnalysis: EconomicAnalysis;
  oecdCompliance: OECDCompliance;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface StepValidation {
  stepId: number;
  requiredFields: string[];
  optionalFields: string[];
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any, data: any) => boolean;
}