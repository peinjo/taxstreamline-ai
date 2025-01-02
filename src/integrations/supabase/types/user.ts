export interface UserProfile {
  id: number
  user_id: string
  full_name: string
  date_of_birth: string
  address: string
  created_at: string
  phone_number: string | null
  company: string | null
  job_title: string | null
  bio: string | null
  avatar_url: string | null
}

export interface UserProfileInsert {
  user_id: string
  full_name: string
  date_of_birth: string
  address: string
  created_at?: string
  phone_number?: string | null
  company?: string | null
  job_title?: string | null
  bio?: string | null
  avatar_url?: string | null
}

export interface UserProfileUpdate {
  user_id?: string
  full_name?: string
  date_of_birth?: string
  address?: string
  created_at?: string
  phone_number?: string | null
  company?: string | null
  job_title?: string | null
  bio?: string | null
  avatar_url?: string | null
}