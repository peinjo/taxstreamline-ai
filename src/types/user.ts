export interface UserProfile {
  id: number;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  address: string;
  phone_number?: string;
  company?: string;
  job_title?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}