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
      user_profiles: {
        Row: {
          id: number
          user_id: string
          full_name: string
          date_of_birth: string
          address: string
          phone_number?: string
          company?: string
          job_title?: string
          bio?: string
          avatar_url?: string
          created_at: string
        }
        Insert: {
          id?: never
          user_id: string
          full_name: string
          date_of_birth: string
          address: string
          phone_number?: string
          company?: string
          job_title?: string
          bio?: string
          avatar_url?: string
          created_at?: string
        }
        Update: {
          id?: never
          user_id?: string
          full_name?: string
          date_of_birth?: string
          address?: string
          phone_number?: string
          company?: string
          job_title?: string
          bio?: string
          avatar_url?: string
          created_at?: string
        }
      }
    }
  }
}