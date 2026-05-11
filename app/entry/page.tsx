'use client'

import { useEffect, useState } from 'react'
import { EntryForm } from '@/components/EntryForm'
import { getAccountsDueToday } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function EntryPage() {
  const [latestRaw, setLatestRaw] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const dueAccounts = getAccountsDueToday()

  useEffect(() => {
    fetch('/api/networth')
      .then(r => r.json())
      .then(d => {
        setLatestRaw(d.latestRaw ?? {})
        setLoading(false)
      })
  }, [])

  function handleSaved() {
    setSaved(true)
    setTimeout(() => router.push('/'), 1500)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enter Balances</h1>
        {dueAccounts.length > 0 ? (
          <p className="text-sm text-amber-600 mt-0.5">
            {dueAccounts.length === 4 ? 'Monthly check-in' : 'Weekly check-in'} — please update your balances below.
          </p>
        ) : (
          <p className="text-sm text-gray-400 mt-0.5">
            You can update any account balance at any time.
          </p>
        )}
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-green-700 font-medium text-sm">
          Saved! Redirecting to dashboard…
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <EntryForm dueAccounts={dueAccounts} latestRaw={latestRaw} onSaved={handleSaved} />
      )}
    </div>
  )
}
