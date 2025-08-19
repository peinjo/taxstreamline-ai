export interface BaseFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ReportFilters extends BaseFilters {
  year?: string;
  taxType?: string;
  complianceStatus?: string;
}

export interface CalendarFilters extends BaseFilters {
  category?: string;
  priority?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
}

export interface DocumentFilters extends BaseFilters {
  fileType?: string;
  taxYear?: string;
  tags?: string[];
}

export interface ComplianceFilters extends BaseFilters {
  country?: string;
  requirementType?: string;
  frequency?: string;
  priority?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterState {
  [key: string]: string | string[] | number | boolean | undefined;
}