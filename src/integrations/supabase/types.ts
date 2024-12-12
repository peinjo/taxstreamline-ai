export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        Relationships: []
      }
      Activities: {
        Row: {
          created_at: string
          id: number
          text: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          text?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          text?: number | null
        }
        Relationships: []
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
        Relationships: []
      }
      "Dashboard Metrics": {
        Row: {
          "Active clients": number
          "Compliance Alert": number | null
          "Document Pending": number | null
          "Upcoming Deadline": number
        }
        Insert: {
          "Active clients": number
          "Compliance Alert"?: number | null
          "Document Pending"?: number | null
          "Upcoming Deadline": number
        }
        Update: {
          "Active clients"?: number
          "Compliance Alert"?: number | null
          "Document Pending"?: number | null
          "Upcoming Deadline"?: number
        }
        Relationships: []
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
        Relationships: []
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
          id?: never
          text?: string
        }
        Relationships: []
      }
      Deadlines: {
        Row: {
          Date: string
          ID: number
          Text: number | null
        }
        Insert: {
          Date?: string
          ID?: number
          Text?: number | null
        }
        Update: {
          Date?: string
          ID?: number
          Text?: number | null
        }
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never