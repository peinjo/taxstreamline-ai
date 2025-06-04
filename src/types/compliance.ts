
export interface ComplianceItem {
  id: string;
  user_id?: string;
  country: string;
  requirement_type: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  status: 'pending' | 'compliant' | 'attention' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  next_due_date?: string;
  last_completed_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceHistory {
  id: string;
  compliance_item_id: string;
  user_id?: string;
  action: string;
  old_status?: string;
  new_status?: string;
  notes?: string;
  created_at: string;
}

export interface ComplianceAttachment {
  id: string;
  compliance_item_id: string;
  user_id?: string;
  filename: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_at: string;
}

export interface ComplianceFilters {
  status: string;
  priority: string;
  country: string;
  requirement_type: string;
  frequency: string;
}
