export interface Team {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  team_id: number;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  content: string;
  team_id: number;
  sender_id?: string;
  created_at: string;
}

export interface DocumentComment {
  id: number;
  content: string;
  document_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}