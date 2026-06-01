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

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function getAccountsDueToday(): AccountType[] {
  const today = new Date()
  const dayOfWeek = today.getDay()

  if (dayOfWeek !== 1) return []

  const weekNumber = getISOWeekNumber(today)
  if (weekNumber % 2 === 0) {
    return ['indonesian_bank', 'indonesian_shares', 'australian_cash']
  }
  return ['australian_cash']
}
