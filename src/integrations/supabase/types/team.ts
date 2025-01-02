export interface Team {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface TeamMember {
  id: number
  team_id: number | null
  user_id: string | null
  role: string
  joined_at: string
}

export interface TeamInsert {
  name: string
  description?: string | null
  created_at?: string
}

export interface TeamUpdate {
  name?: string
  description?: string | null
  created_at?: string
}

export interface TeamMemberInsert {
  team_id?: number | null
  user_id?: string | null
  role?: string
  joined_at?: string
}

export interface TeamMemberUpdate {
  team_id?: number | null
  user_id?: string | null
  role?: string
  joined_at?: string
}