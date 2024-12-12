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
    }
  }
}