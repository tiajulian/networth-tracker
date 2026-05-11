import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { ACCOUNTS } from '@/lib/types'

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '60')

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()
  const { account_type, amount, date } = body

  const account = ACCOUNTS.find(a => a.account_type === account_type)
  if (!account) return NextResponse.json({ error: 'Invalid account_type' }, { status: 400 })

  const { data, error } = await supabase
    .from('entries')
    .upsert(
      { account_type, amount: Number(amount), currency: account.currency, date },
      { onConflict: 'account_type,date' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
