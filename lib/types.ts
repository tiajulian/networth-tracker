export type AccountType = 'indonesian_bank' | 'indonesian_shares' | 'australian_cash' | 'super'
export type Currency = 'IDR' | 'AUD'

export interface Account {
  id: string
  name: string
  account_type: AccountType
  currency: Currency
  created_at: string
}

export interface Entry {
  id: string
  account_id: string
  amount: number
  date: string
  created_at: string
  account?: Account
}

export interface Goal {
  id: string
  name: string
  target_amount_aud: number
  target_date: string | null
  created_at: string
}

export interface NetWorthSnapshot {
  date: string
  total_aud: number
  breakdown: {
    indonesian_bank_aud: number
    indonesian_shares_aud: number
    australian_cash_aud: number
    super_aud: number
  }
}

export const ACCOUNTS: { id: string; name: string; account_type: AccountType; currency: Currency }[] = [
  { id: 'indonesian_bank', name: 'Indonesian Bank', account_type: 'indonesian_bank', currency: 'IDR' },
  { id: 'indonesian_shares', name: 'Indonesian Shares', account_type: 'indonesian_shares', currency: 'IDR' },
  { id: 'australian_cash', name: 'Australian Cash', account_type: 'australian_cash', currency: 'AUD' },
  { id: 'super', name: 'Super Account', account_type: 'super', currency: 'AUD' },
]

// Monday = 0 means Australian cash is due; 1st of month = all accounts due
export function getAccountsDueToday(): AccountType[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon
  const dayOfMonth = today.getDate()

  if (dayOfMonth === 1) {
    return ['indonesian_bank', 'indonesian_shares', 'australian_cash', 'super']
  }
  if (dayOfWeek === 1) {
    return ['australian_cash']
  }
  return []
}
