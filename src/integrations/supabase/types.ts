export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          action: string
          created_at: string
          document_title: string
          document_type: string
          id: number
        }
        Insert: {
          action: string
          created_at?: string
          document_title: string
          document_type: string
          id?: never
        }
        Update: {
          action?: string
          created_at?: string
          document_title?: string
          document_type?: string
          id?: never
        }
      }
      calendar_events: {
        Row: {
          company: string
          created_at: string
          date: string
          id: number
          title: string
        }
        Insert: {
          company: string
          created_at?: string
          date: string
          id?: never
          title: string
        }
        Update: {
          company?: string
          created_at?: string
          date?: string
          id?: never
          title?: string
        }
      }
      dashboard_metrics: {
        Row: {
          active_clients: number
          compliance_alerts: number
          created_at: string
          documents_pending: number
          id: number
          upcoming_deadlines: number
        }
        Insert: {
          active_clients?: number
          compliance_alerts?: number
          created_at?: string
          documents_pending?: number
          id?: never
          upcoming_deadlines?: number
        }
        Update: {
          active_clients?: number
          compliance_alerts?: number
          created_at?: string
          documents_pending?: number
          id?: never
          upcoming_deadlines?: number
        }
      }
      deadlines: {
        Row: {
          created_at: string
          date: string
          id: number
          text: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: never
          text: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: number
          text?: string
        }
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
      }
      team_members: {
        Row: {
          id: number
          joined_at: string
          role: string
          team_id: number | null
          user_id: string | null
        }
        Insert: {
          id?: never
          joined_at?: string
          role: string
          team_id?: number | null
          user_id?: string | null
        }
        Update: {
          id?: never
          joined_at?: string
          role?: string
          team_id?: number | null
          user_id?: string | null
        }
      }
      user_profiles: {
        Row: {
          address: string
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          date_of_birth: string
          full_name: string
          id: number
          job_title: string | null
          phone_number: string | null
          user_id: string
        }
        Insert: {
          address: string
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          date_of_birth: string
          full_name: string
          id?: never
          job_title?: string | null
          phone_number?: string | null
          user_id: string
        }
        Update: {
          address?: string
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string
          full_name?: string
          id?: never
          job_title?: string | null
          phone_number?: string | null
          user_id?: string
        }
      }
    }
  }
}
