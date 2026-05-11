import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getIDRtoAUD } from '@/lib/currency'
import { AccountType } from '@/lib/types'

export async function GET() {
  const supabase = createServiceClient()
  const idrToAud = await getIDRtoAUD()

  // Get all entries ordered by date
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by date — for each date, get the latest known value for each account
  // Build a running "last known value" map
  const accountTypes: AccountType[] = ['indonesian_bank', 'indonesian_shares', 'australian_cash', 'super']
  const lastKnown: Record<string, number> = {}
  const snapshots: Record<string, Record<string, number>> = {}

  for (const entry of entries ?? []) {
    lastKnown[entry.account_type] = entry.amount
    snapshots[entry.date] = { ...lastKnown }
  }

  const timeline = Object.entries(snapshots).map(([date, values]) => {
    const indonesian_bank_aud = (values['indonesian_bank'] ?? 0) * idrToAud
    const indonesian_shares_aud = (values['indonesian_shares'] ?? 0) * idrToAud
    const australian_cash_aud = values['australian_cash'] ?? 0
    const super_aud = values['super'] ?? 0
    const total_aud = indonesian_bank_aud + indonesian_shares_aud + australian_cash_aud + super_aud

    return {
      date,
      total_aud: Math.round(total_aud),
      indonesian_bank_aud: Math.round(indonesian_bank_aud),
      indonesian_shares_aud: Math.round(indonesian_shares_aud),
      australian_cash_aud: Math.round(australian_cash_aud),
      super_aud: Math.round(super_aud),
    }
  })

  // Current net worth = last snapshot
  const current = timeline.at(-1) ?? null

  // Raw latest values per account (in native currency)
  const latestRaw: Record<string, number> = {}
  for (const t of accountTypes) {
    const latest = entries?.filter(e => e.account_type === t).at(-1)
    if (latest) latestRaw[t] = latest.amount
  }

  return NextResponse.json({ timeline, current, latestRaw, idrToAud })
}
