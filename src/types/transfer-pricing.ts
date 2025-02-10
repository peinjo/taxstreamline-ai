
export type UserRole = 'admin' | 'consultant' | 'client';
export type DocumentType = 'master' | 'local' | 'supporting';
export type DocumentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type PricingMethod = 'CUP' | 'TNMM' | 'CPM' | 'PSM' | 'OTHER';

export interface TPDocument {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  companyId: string;
  createdBy: string;
  approvedBy?: string;
  content: any;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TPTransaction {
  id: string;
  documentId: string;
  transactionType: string;
  description: string;
  amount: number;
  currency: string;
  pricingMethod: PricingMethod;
  supportingDocs: any;
  createdAt: string;
}

export interface TPBenchmark {
  id: string;
  transactionId: string;
  datasetSource: string;
  comparables: any;
  analysisResults: any;
  createdAt: string;
}

export interface EntityDetails {
  companyName: string;
  structure: string;
  ownership: string;
  functions: string[];
  risks: string[];
  assets: string[];
}

export interface ControlledTransaction {
  type: string;
  parties: string[];
  amount: number;
  currency: string;
  pricingMethod: PricingMethod;
  description: string;
}
