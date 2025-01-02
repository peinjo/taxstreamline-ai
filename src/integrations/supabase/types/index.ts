import type { Activity, ActivityInsert, ActivityUpdate } from './activity'
import type { Team, TeamMember, TeamInsert, TeamUpdate, TeamMemberInsert, TeamMemberUpdate } from './team'
import type { UserProfile, UserProfileInsert, UserProfileUpdate } from './user'
import type { TaxCalculation, TaxCalculationInsert, TaxCalculationUpdate } from './tax'

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
        Row: Activity
        Insert: ActivityInsert
        Update: ActivityUpdate
        Relationships: []
      }
      teams: {
        Row: Team
        Insert: TeamInsert
        Update: TeamUpdate
        Relationships: []
      }
      team_members: {
        Row: TeamMember
        Insert: TeamMemberInsert
        Update: TeamMemberUpdate
        Relationships: []
      }
      user_profiles: {
        Row: UserProfile
        Insert: UserProfileInsert
        Update: UserProfileUpdate
        Relationships: []
      }
      tax_calculations: {
        Row: TaxCalculation
        Insert: TaxCalculationInsert
        Update: TaxCalculationUpdate
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']