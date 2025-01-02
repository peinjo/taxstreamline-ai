export interface TaxCalculation {
  id: number
  tax_type: string
  income: number
  tax_amount: number
  user_id: string | null
  created_at: string
}

export interface TaxCalculationInsert {
  tax_type: string
  income: number
  tax_amount: number
  user_id?: string | null
  created_at?: string
}

export interface TaxCalculationUpdate {
  tax_type?: string
  income?: number
  tax_amount?: number
  user_id?: string | null
  created_at?: string
}