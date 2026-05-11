'use client'

import Link from 'next/link'
import { AccountType, ACCOUNTS } from '@/lib/types'

interface Props {
  dueAccounts: AccountType[]
}

export function DueBanner({ dueAccounts }: Props) {
  if (dueAccounts.length === 0) return null

  const names = dueAccounts.map(t => ACCOUNTS.find(a => a.account_type === t)?.name).filter(Boolean)

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-amber-800 text-sm">Balance update due today</p>
        <p className="text-amber-600 text-xs mt-0.5">{names.join(', ')}</p>
      </div>
      <Link
        href="/entry"
        className="shrink-0 bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
      >
        Enter now
      </Link>
    </div>
  )
}
