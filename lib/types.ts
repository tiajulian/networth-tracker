export type AccountType = 'indonesian_bank' | 'indonesian_shares' | 'australian_cash'
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

export const ACCOUNTS: { id: string; name: string; account_type: AccountType; currency: Currency }[] = [
  { id: 'indonesian_bank', name: 'Indonesian Bank', account_type: 'indonesian_bank', currency: 'IDR' },
  { id: 'indonesian_shares', name: 'Indonesian Shares', account_type: 'indonesian_shares', currency: 'IDR' },
  { id: 'australian_cash', name: 'Australian Cash', account_type: 'australian_cash', currency: 'AUD' },
]

export function getAccountsDueToday(): AccountType[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const dayOfMonth = today.getDate()

  if (dayOfMonth === 1) {
    return ['indonesian_bank', 'indonesian_shares', 'australian_cash']
  }
  if (dayOfWeek === 1) {
    return ['australian_cash']
  }
  return []
}
