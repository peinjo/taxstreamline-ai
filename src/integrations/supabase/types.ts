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
      compliance_rules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          frequency: string
          id: number
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          frequency: string
          id?: never
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          frequency?: string
          id?: never
          is_active?: boolean | null
          title?: string
          updated_at?: string
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
      document_comments: {
        Row: {
          content: string
          created_at: string
          document_id: string
          id: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          id?: never
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          id?: never
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      document_metadata: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: Database["public"]["Enums"]["document_type"]
          id: number
          tax_year: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: Database["public"]["Enums"]["document_type"]
          id?: number
          tax_year: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: Database["public"]["Enums"]["document_type"]
          id?: number
          tax_year?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: number
          sender_id: string | null
          team_id: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: never
          sender_id?: string | null
          team_id?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: never
          sender_id?: string | null
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          due_date: string | null
          id: number
          message: string
          status: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: never
          message: string
          status?: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: never
          message?: string
          status?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: number
          metadata: Json | null
          payment_reference: string
          provider: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: never
          metadata?: Json | null
          payment_reference: string
          provider: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: never
          metadata?: Json | null
          payment_reference?: string
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: number
          priority: string
          status: string
          team_id: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: never
          priority?: string
          status?: string
          team_id?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: never
          priority?: string
          status?: string
          team_id?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_calculations: {
        Row: {
          calculation_details: Json | null
          created_at: string
          id: number
          income: number
          input_data: Json | null
          tax_amount: number
          tax_type: string
          user_id: string | null
        }
        Insert: {
          calculation_details?: Json | null
          created_at?: string
          id?: number
          income: number
          input_data?: Json | null
          tax_amount: number
          tax_type: string
          user_id?: string | null
        }
        Update: {
          calculation_details?: Json | null
          created_at?: string
          id?: number
          income?: number
          input_data?: Json | null
          tax_amount?: number
          tax_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tax_documents: {
        Row: {
          content_type: string
          created_at: string
          file_path: string
          filename: string
          id: number
          size: number
          user_id: string | null
        }
        Insert: {
          content_type: string
          created_at?: string
          file_path: string
          filename: string
          id?: number
          size: number
          user_id?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string
          file_path?: string
          filename?: string
          id?: number
          size?: number
          user_id?: string | null
        }
        Relationships: []
      }
      tax_filings: {
        Row: {
          created_at: string
          filing_data: Json
          filing_type: string
          firs_reference: string | null
          id: number
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          filing_data?: Json
          filing_type: string
          firs_reference?: string | null
          id?: never
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          filing_data?: Json
          filing_type?: string
          firs_reference?: string | null
          id?: never
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tax_guides: {
        Row: {
          category: string
          content: string
          created_at: string
          id: number
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tax_rates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: number
          rate: number
          subcategory: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: number
          rate: number
          subcategory?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: number
          rate?: number
          subcategory?: string | null
        }
        Relationships: []
      }
      tax_reports: {
        Row: {
          amount: number
          created_at: string
          id: number
          status: string
          tax_type: string
          tax_year: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: never
          status: string
          tax_type: string
          tax_year: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: never
          status?: string
          tax_type?: string
          tax_year?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tax_templates: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          file_type: string
          id: number
          template_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          file_type: string
          id?: never
          template_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          file_type?: string
          id?: never
          template_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          role?: string
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
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
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
          id?: never
          name?: string
        }
        Relationships: []
      }
      transfer_pricing_documents: {
        Row: {
          company_id: string | null
          content: Json | null
          created_at: string
          created_by: string | null
          id: string
          status: Database["public"]["Enums"]["tp_document_status"]
          title: string
          type: Database["public"]["Enums"]["tp_document_type"]
          updated_at: string
          version: number
        }
        Insert: {
          company_id?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["tp_document_status"]
          title: string
          type: Database["public"]["Enums"]["tp_document_type"]
          updated_at?: string
          version?: number
        }
        Update: {
          company_id?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["tp_document_status"]
          title?: string
          type?: Database["public"]["Enums"]["tp_document_type"]
          updated_at?: string
          version?: number
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
      user_roles: {
        Row: {
          created_at: string
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          required_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      log_organization_activity: {
        Args: {
          org_id: number
          action: string
          details?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      document_type: "receipt" | "filing" | "statement" | "report" | "other"
      tp_document_status: "draft" | "published"
      tp_document_type: "master" | "local"
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
