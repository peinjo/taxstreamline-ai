export * from './auth';
export * from './dashboard';
export * from './documents';
export * from './notification';
export * from './payment';
export * from './tax';
export * from './team';

export interface Comment {
  id: number;
  content: string;
  document_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name?: string;
  };
}

export interface Message {
  id: number;
  content: string;
  team_id: number;
  sender_id?: string;
  created_at: string;
  sender?: {
    full_name?: string;
  };
}