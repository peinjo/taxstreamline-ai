
export interface DocumentMetadata {
  id: number;
  file_name: string;
  file_path: string;
  file_type: DocumentType;
  file_size: number;
  tax_year: number;
  description?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export type DocumentType = 'receipt' | 'filing' | 'statement' | 'report' | 'other';

export interface DocumentComment {
  id: number;
  content: string;
  document_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}
