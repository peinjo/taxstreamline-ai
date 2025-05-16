
import { TaxReport } from "@/types";

export interface TaxSummaryProps {
  data: TaxReport[];
  isLoading: boolean;
}

export interface TaxReportFilterState {
  searchTerm: string;
  sortField: keyof TaxReport;
  sortDirection: "asc" | "desc";
  currentPage: number;
  pageSize: number;
}

export interface ScheduleConfigState {
  frequency: string;
  recipients: string;
  format: string;
}
