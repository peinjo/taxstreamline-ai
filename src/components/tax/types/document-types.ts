export type DocumentType = "receipt" | "filing" | "statement" | "report" | "other";

export interface Document {
  id: number;
  file_name: string;
  file_path: string;
  file_type: DocumentType;
  file_size: number;
  tax_year: number;
  description?: string;
  created_at: string;
}