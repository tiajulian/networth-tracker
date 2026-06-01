'use client'

import { useState } from 'react'
import { ACCOUNTS, AccountType } from '@/lib/types'
import { format } from 'date-fns'

interface Props {
  dueAccounts: AccountType[]
  latestRaw: Record<string, number>
  onSaved: () => void
}

const ACCOUNT_COLORS: Record<AccountType, string> = {
  indonesian_bank: 'bg-indigo-50 border-indigo-200',
  indonesian_shares: 'bg-purple-50 border-purple-200',
  australian_cash: 'bg-cyan-50 border-cyan-200',
}

export function EntryForm({ dueAccounts, latestRaw, onSaved }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const acc of ACCOUNTS) {
      init[acc.account_type] = latestRaw[acc.account_type] != null
        ? String(latestRaw[acc.account_type])
        : ''
    }
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeAccounts, setActiveAccounts] = useState<AccountType[]>(
    dueAccounts.length > 0 ? dueAccounts : ACCOUNTS.map(a => a.account_type)
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await Promise.all(
        activeAccounts
          .filter(t => values[t] !== '')
          .map(account_type =>
            fetch('/api/entries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ account_type, amount: parseFloat(values[account_type]), date: today }),
            })
          )
      )
      setSaved(true)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  function toggleAccount(type: AccountType) {
    setActiveAccounts(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-sm text-gray-500">Update accounts:</span>
        {ACCOUNTS.map(acc => (
          <button
            key={acc.account_type}
            type="button"
            onClick={() => toggleAccount(acc.account_type)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeAccounts.includes(acc.account_type)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            {acc.name}
          </button>
        ))}
      </div>

      {ACCOUNTS.filter(a => activeAccounts.includes(a.account_type)).map(acc => (
        <div
          key={acc.account_type}
          className={`rounded-xl border p-4 ${ACCOUNT_COLORS[acc.account_type]}`}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {acc.name}
            <span className="ml-2 text-xs text-gray-400">{acc.currency}</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {acc.currency === 'AUD' ? 'A$' : 'Rp'}
            </span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={values[acc.account_type]}
              onChange={e => setValues(v => ({ ...v, [acc.account_type]: e.target.value }))}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={saving || activeAccounts.length === 0}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Balances'}
      </button>
    </form>
  )
}
