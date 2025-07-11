export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
          category: string | null
          color: string | null
          company: string
          created_at: string
          date: string
          description: string | null
          end_time: string | null
          id: number
          is_all_day: boolean | null
          parent_event_id: number | null
          priority: string | null
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          reminder_minutes: number | null
          start_time: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          company: string
          created_at?: string
          date: string
          description?: string | null
          end_time?: string | null
          id?: never
          is_all_day?: boolean | null
          parent_event_id?: number | null
          priority?: string | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          reminder_minutes?: number | null
          start_time?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          color?: string | null
          company?: string
          created_at?: string
          date?: string
          description?: string | null
          end_time?: string | null
          id?: never
          is_all_day?: boolean | null
          parent_event_id?: number | null
          priority?: string | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          reminder_minutes?: number | null
          start_time?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_attachments: {
        Row: {
          compliance_item_id: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          uploaded_at: string
          user_id: string | null
        }
        Insert: {
          compliance_item_id?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          uploaded_at?: string
          user_id?: string | null
        }
        Update: {
          compliance_item_id?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          uploaded_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_attachments_compliance_item_id_fkey"
            columns: ["compliance_item_id"]
            isOneToOne: false
            referencedRelation: "compliance_items"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_history: {
        Row: {
          action: string
          compliance_item_id: string | null
          created_at: string
          id: string
          new_status: string | null
          notes: string | null
          old_status: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          compliance_item_id?: string | null
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          compliance_item_id?: string | null
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_history_compliance_item_id_fkey"
            columns: ["compliance_item_id"]
            isOneToOne: false
            referencedRelation: "compliance_items"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_items: {
        Row: {
          country: string
          created_at: string
          description: string | null
          frequency: string
          id: string
          last_completed_date: string | null
          next_due_date: string | null
          priority: string
          requirement_type: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          country: string
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          last_completed_date?: string | null
          next_due_date?: string | null
          priority?: string
          requirement_type: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          last_completed_date?: string | null
          next_due_date?: string | null
          priority?: string
          requirement_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
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
      confirmation_requests: {
        Row: {
          amount: number | null
          contact_email: string
          created_at: string | null
          date_requested: string | null
          date_responded: string | null
          entity_name: string
          id: string
          request_type: string
          response: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          contact_email: string
          created_at?: string | null
          date_requested?: string | null
          date_responded?: string | null
          entity_name: string
          id?: string
          request_type: string
          response?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          contact_email?: string
          created_at?: string | null
          date_requested?: string | null
          date_responded?: string | null
          entity_name?: string
          id?: string
          request_type?: string
          response?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
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
      global_compliance: {
        Row: {
          country: string
          created_at: string
          description: string | null
          frequency: string
          id: number
          next_due_date: string | null
          requirement_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description?: string | null
          frequency: string
          id?: number
          next_due_date?: string | null
          requirement_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          frequency?: string
          id?: number
          next_due_date?: string | null
          requirement_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      global_deadlines: {
        Row: {
          country: string
          created_at: string
          description: string | null
          due_date: string
          id: number
          priority: string
          status: string
          tax_type: string
          title: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: number
          priority?: string
          status?: string
          tax_type: string
          title: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: number
          priority?: string
          status?: string
          tax_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_controls: {
        Row: {
          control_description: string
          control_name: string
          created_at: string | null
          id: string
          last_tested: string | null
          risk_level: string
          status: string
          test_result: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          control_description: string
          control_name: string
          created_at?: string | null
          id?: string
          last_tested?: string | null
          risk_level: string
          status?: string
          test_result?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          control_description?: string
          control_name?: string
          created_at?: string | null
          id?: string
          last_tested?: string | null
          risk_level?: string
          status?: string
          test_result?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      materiality_calculations: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          materiality_percentage: number
          materiality_threshold: number
          notes: string | null
          performance_materiality: number
          performance_materiality_percentage: number
          pre_tax_income: number
          user_id: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          materiality_percentage: number
          materiality_threshold: number
          notes?: string | null
          performance_materiality: number
          performance_materiality_percentage: number
          pre_tax_income: number
          user_id?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          materiality_percentage?: number
          materiality_threshold?: number
          notes?: string | null
          performance_materiality?: number
          performance_materiality_percentage?: number
          pre_tax_income?: number
          user_id?: string | null
          year?: number
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
          country: string | null
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
          country?: string | null
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
          country?: string | null
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
      tp_advanced_benchmarks: {
        Row: {
          comparable_data: Json
          confidence_level: number | null
          created_at: string | null
          database_source: string
          final_arm_length_range: Json | null
          id: string
          rejection_reasons: string[] | null
          search_strategy: Json
          statistical_analysis: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comparable_data: Json
          confidence_level?: number | null
          created_at?: string | null
          database_source: string
          final_arm_length_range?: Json | null
          id?: string
          rejection_reasons?: string[] | null
          search_strategy: Json
          statistical_analysis?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comparable_data?: Json
          confidence_level?: number | null
          created_at?: string | null
          database_source?: string
          final_arm_length_range?: Json | null
          id?: string
          rejection_reasons?: string[] | null
          search_strategy?: Json
          statistical_analysis?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tp_analytics_data: {
        Row: {
          created_at: string | null
          data_type: string
          entity_id: string | null
          id: string
          insights: Json | null
          metrics: Json
          time_period: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_type: string
          entity_id?: string | null
          id?: string
          insights?: Json | null
          metrics: Json
          time_period: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_type?: string
          entity_id?: string | null
          id?: string
          insights?: Json | null
          metrics?: Json
          time_period?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tp_analytics_data_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "tp_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      tp_approval_steps: {
        Row: {
          approved_at: string | null
          approver_role: string | null
          approver_user_id: string | null
          comments: string | null
          id: string
          status: string | null
          step_number: number
          workflow_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_role?: string | null
          approver_user_id?: string | null
          comments?: string | null
          id?: string
          status?: string | null
          step_number: number
          workflow_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_role?: string | null
          approver_user_id?: string | null
          comments?: string | null
          id?: string
          status?: string | null
          step_number?: number
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tp_approval_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "tp_approval_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      tp_approval_workflows: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_step: number | null
          document_id: string
          id: string
          status: string | null
          total_steps: number
          workflow_name: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number | null
          document_id: string
          id?: string
          status?: string | null
          total_steps: number
          workflow_name: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number | null
          document_id?: string
          id?: string
          status?: string | null
          total_steps?: number
          workflow_name?: string
        }
        Relationships: []
      }
      tp_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tp_audit_trail: {
        Row: {
          assigned_to: string | null
          audit_phase: string
          audit_type: string
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          entity_id: string | null
          findings: Json | null
          id: string
          recommendations: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          audit_phase: string
          audit_type: string
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          entity_id?: string | null
          findings?: Json | null
          id?: string
          recommendations?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          audit_phase?: string
          audit_type?: string
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          entity_id?: string | null
          findings?: Json | null
          id?: string
          recommendations?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tp_audit_trail_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "tp_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      tp_benchmarks: {
        Row: {
          comparable_name: string
          country: string
          created_at: string | null
          financial_data: Json
          id: string
          industry: string | null
          reliability_score: number | null
          search_criteria: Json | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          comparable_name: string
          country: string
          created_at?: string | null
          financial_data: Json
          id?: string
          industry?: string | null
          reliability_score?: number | null
          search_criteria?: Json | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          comparable_name?: string
          country?: string
          created_at?: string | null
          financial_data?: Json
          id?: string
          industry?: string | null
          reliability_score?: number | null
          search_criteria?: Json | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tp_benchmarks_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "tp_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      tp_client_access: {
        Row: {
          access_level: string | null
          client_user_id: string | null
          created_at: string | null
          document_id: string
          expires_at: string | null
          granted_by: string | null
          id: string
        }
        Insert: {
          access_level?: string | null
          client_user_id?: string | null
          created_at?: string | null
          document_id: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
        }
        Update: {
          access_level?: string | null
          client_user_id?: string | null
          created_at?: string | null
          document_id?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
        }
        Relationships: []
      }
      tp_deadlines: {
        Row: {
          country_code: string
          created_at: string | null
          deadline_type: string
          description: string | null
          due_date: string
          id: string
          notification_sent: boolean | null
          status: Database["public"]["Enums"]["tp_compliance_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          country_code: string
          created_at?: string | null
          deadline_type: string
          description?: string | null
          due_date: string
          id?: string
          notification_sent?: boolean | null
          status?: Database["public"]["Enums"]["tp_compliance_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          country_code?: string
          created_at?: string | null
          deadline_type?: string
          description?: string | null
          due_date?: string
          id?: string
          notification_sent?: boolean | null
          status?: Database["public"]["Enums"]["tp_compliance_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tp_document_comments: {
        Row: {
          comment_type: string | null
          content: string
          created_at: string | null
          document_id: string
          id: string
          metadata: Json | null
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment_type?: string | null
          content: string
          created_at?: string | null
          document_id: string
          id?: string
          metadata?: Json | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment_type?: string | null
          content?: string
          created_at?: string | null
          document_id?: string
          id?: string
          metadata?: Json | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tp_document_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "tp_document_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      tp_document_shares: {
        Row: {
          access_level: string | null
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          document_id: string
          expires_at: string | null
          id: string
          max_uses: number | null
          password_hash: string | null
          share_token: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          document_id: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          password_hash?: string | null
          share_token?: string
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          document_id?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          password_hash?: string | null
          share_token?: string
        }
        Relationships: []
      }
      tp_document_teams: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          document_id: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          document_id: string
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          document_id?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tp_economic_substance: {
        Row: {
          assessment_date: string | null
          compliance_score: number | null
          created_at: string | null
          deficiencies: string[] | null
          entity_id: string | null
          id: string
          next_review_date: string | null
          remediation_plan: string | null
          substance_test: string
          test_results: Json
          user_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          compliance_score?: number | null
          created_at?: string | null
          deficiencies?: string[] | null
          entity_id?: string | null
          id?: string
          next_review_date?: string | null
          remediation_plan?: string | null
          substance_test: string
          test_results: Json
          user_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          compliance_score?: number | null
          created_at?: string | null
          deficiencies?: string[] | null
          entity_id?: string | null
          id?: string
          next_review_date?: string | null
          remediation_plan?: string | null
          substance_test?: string
          test_results?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tp_economic_substance_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "tp_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      tp_entities: {
        Row: {
          business_description: string | null
          country_code: string
          created_at: string | null
          entity_type: Database["public"]["Enums"]["tp_entity_type"]
          financial_data: Json | null
          functional_analysis: Json | null
          id: string
          name: string
          tax_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_description?: string | null
          country_code: string
          created_at?: string | null
          entity_type: Database["public"]["Enums"]["tp_entity_type"]
          financial_data?: Json | null
          functional_analysis?: Json | null
          id?: string
          name: string
          tax_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_description?: string | null
          country_code?: string
          created_at?: string | null
          entity_type?: Database["public"]["Enums"]["tp_entity_type"]
          financial_data?: Json | null
          functional_analysis?: Json | null
          id?: string
          name?: string
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tp_erp_integrations: {
        Row: {
          connection_config: Json
          created_at: string | null
          erp_system: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          mapping_rules: Json | null
          sync_frequency: string | null
          user_id: string | null
        }
        Insert: {
          connection_config: Json
          created_at?: string | null
          erp_system: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          mapping_rules?: Json | null
          sync_frequency?: string | null
          user_id?: string | null
        }
        Update: {
          connection_config?: Json
          created_at?: string | null
          erp_system?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          mapping_rules?: Json | null
          sync_frequency?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tp_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          difficulty_level: string | null
          id: string
          is_published: boolean | null
          jurisdiction: string
          last_updated_at: string | null
          metadata: Json | null
          rating: number | null
          tags: string[] | null
          title: string
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          id?: string
          is_published?: boolean | null
          jurisdiction: string
          last_updated_at?: string | null
          metadata?: Json | null
          rating?: number | null
          tags?: string[] | null
          title: string
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          id?: string
          is_published?: boolean | null
          jurisdiction?: string
          last_updated_at?: string | null
          metadata?: Json | null
          rating?: number | null
          tags?: string[] | null
          title?: string
          view_count?: number | null
        }
        Relationships: []
      }
      tp_risk_assessments: {
        Row: {
          assessment_date: string | null
          created_at: string | null
          entity_id: string | null
          id: string
          recommendations: string | null
          risk_factors: Json | null
          risk_level: Database["public"]["Enums"]["tp_risk_level"]
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          assessment_date?: string | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          recommendations?: string | null
          risk_factors?: Json | null
          risk_level: Database["public"]["Enums"]["tp_risk_level"]
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          assessment_date?: string | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          recommendations?: string | null
          risk_factors?: Json | null
          risk_level?: Database["public"]["Enums"]["tp_risk_level"]
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tp_risk_assessments_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "tp_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tp_risk_assessments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "tp_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      tp_templates: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          jurisdiction: string
          name: string
          template_type: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction: string
          name: string
          template_type: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string
          name?: string
          template_type?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      tp_transactions: {
        Row: {
          amount: number | null
          arm_length_range: Json | null
          created_at: string | null
          currency: string | null
          description: string
          documentation_status: string | null
          entity_id: string | null
          id: string
          pricing_method:
            | Database["public"]["Enums"]["tp_pricing_method"]
            | null
          transaction_type: Database["public"]["Enums"]["tp_transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          arm_length_range?: Json | null
          created_at?: string | null
          currency?: string | null
          description: string
          documentation_status?: string | null
          entity_id?: string | null
          id?: string
          pricing_method?:
            | Database["public"]["Enums"]["tp_pricing_method"]
            | null
          transaction_type: Database["public"]["Enums"]["tp_transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          arm_length_range?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string
          documentation_status?: string | null
          entity_id?: string | null
          id?: string
          pricing_method?:
            | Database["public"]["Enums"]["tp_pricing_method"]
            | null
          transaction_type?: Database["public"]["Enums"]["tp_transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tp_transactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "tp_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      tp_user_roles: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      transfer_pricing_documents: {
        Row: {
          company_id: string | null
          compliance_status:
            | Database["public"]["Enums"]["tp_compliance_status"]
            | null
          content: Json | null
          created_at: string
          created_by: string | null
          entity_id: string | null
          id: string
          jurisdiction: string | null
          last_reviewed_at: string | null
          risk_level: Database["public"]["Enums"]["tp_risk_level"] | null
          status: Database["public"]["Enums"]["tp_document_status"]
          template_id: string | null
          title: string
          type: Database["public"]["Enums"]["tp_document_type"]
          updated_at: string
          version: number
        }
        Insert: {
          company_id?: string | null
          compliance_status?:
            | Database["public"]["Enums"]["tp_compliance_status"]
            | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          id?: string
          jurisdiction?: string | null
          last_reviewed_at?: string | null
          risk_level?: Database["public"]["Enums"]["tp_risk_level"] | null
          status?: Database["public"]["Enums"]["tp_document_status"]
          template_id?: string | null
          title: string
          type: Database["public"]["Enums"]["tp_document_type"]
          updated_at?: string
          version?: number
        }
        Update: {
          company_id?: string | null
          compliance_status?:
            | Database["public"]["Enums"]["tp_compliance_status"]
            | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          id?: string
          jurisdiction?: string | null
          last_reviewed_at?: string | null
          risk_level?: Database["public"]["Enums"]["tp_risk_level"] | null
          status?: Database["public"]["Enums"]["tp_document_status"]
          template_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["tp_document_type"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "transfer_pricing_documents_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "tp_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_pricing_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "tp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          date_of_birth: string | null
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
          date_of_birth?: string | null
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
          date_of_birth?: string | null
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
      calculate_risk_trends: {
        Args: { p_user_id: string; p_period?: string }
        Returns: Json
      }
      check_tp_permission: {
        Args: {
          p_user_id: string
          p_permission: string
          p_document_id?: string
        }
        Returns: boolean
      }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      increment_kb_view_count: {
        Args: { article_id: string }
        Returns: undefined
      }
      log_organization_activity: {
        Args: { org_id: number; action: string; details?: Json }
        Returns: undefined
      }
      log_tp_audit_event: {
        Args: {
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_old_values?: Json
          p_new_values?: Json
          p_metadata?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      document_type: "receipt" | "filing" | "statement" | "report" | "other"
      tp_compliance_status:
        | "compliant"
        | "pending"
        | "overdue"
        | "not_applicable"
      tp_document_status: "draft" | "published"
      tp_document_type: "master" | "local"
      tp_entity_type:
        | "parent"
        | "subsidiary"
        | "branch"
        | "partnership"
        | "other"
      tp_pricing_method: "CUP" | "TNMM" | "RPM" | "PSM" | "OTHER"
      tp_risk_level: "low" | "medium" | "high" | "critical"
      tp_transaction_type:
        | "tangible_goods"
        | "intangible_property"
        | "services"
        | "financial_transactions"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      document_type: ["receipt", "filing", "statement", "report", "other"],
      tp_compliance_status: [
        "compliant",
        "pending",
        "overdue",
        "not_applicable",
      ],
      tp_document_status: ["draft", "published"],
      tp_document_type: ["master", "local"],
      tp_entity_type: [
        "parent",
        "subsidiary",
        "branch",
        "partnership",
        "other",
      ],
      tp_pricing_method: ["CUP", "TNMM", "RPM", "PSM", "OTHER"],
      tp_risk_level: ["low", "medium", "high", "critical"],
      tp_transaction_type: [
        "tangible_goods",
        "intangible_property",
        "services",
        "financial_transactions",
        "other",
      ],
    },
  },
} as const
