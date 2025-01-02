export interface Activity {
  id: number
  action: string
  document_title: string
  document_type: string
  created_at: string
}

export interface ActivityInsert {
  action: string
  created_at?: string
  document_title: string
  document_type: string
}

export interface ActivityUpdate {
  action?: string
  created_at?: string
  document_title?: string
  document_type?: string
}