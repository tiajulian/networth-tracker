'use client'

import { useEffect, useState } from 'react'
import { NetWorthChart } from '@/components/NetWorthChart'
import { AccountBreakdown } from '@/components/AccountBreakdown'
import { StatCard } from '@/components/StatCard'
import { DueBanner } from '@/components/DueBanner'
import { GoalCard } from '@/components/GoalCard'
import { getAccountsDueToday } from '@/lib/types'
import { format, parseISO } from 'date-fns'

interface NetWorthData {
  timeline: {
    date: string
    total_aud: number
    indonesian_bank_aud: number
    indonesian_shares_aud: number
    australian_cash_aud: number
  }[]
  current: {
    date: string
    total_aud: number
    indonesian_bank_aud: number
    indonesian_shares_aud: number
    australian_cash_aud: number
  } | null
  latestRaw: Record<string, number>
  idrToAud: number
}

interface Goal {
  id: string
  name: string
  target_amount_aud: number
  target_date: string | null
}

function fmtAUD(v: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(v)
}

function fmtIDR(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
}

export default function Dashboard() {
  const [nw, setNw] = useState<NetWorthData | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const dueAccounts = getAccountsDueToday()

  useEffect(() => {
    Promise.all([
      fetch('/api/networth').then(r => r.json()),
      fetch('/api/goals').then(r => r.json()),
    ]).then(([nwData, goalsData]) => {
      setNw(nwData)
      setGoals(Array.isArray(goalsData) ? goalsData : [])
      setLoading(false)
    })
  }, [])

  async function deleteGoal(id: string) {
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
    setGoals(g => g.filter(x => x.id !== id))
  }

  const cur = nw?.current
  const prev = nw?.timeline?.at(-2)
  const change = cur && prev ? cur.total_aud - prev.total_aud : null

  return (
    <div className="space-y-5">
      <DueBanner dueAccounts={dueAccounts} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {cur && (
          <p className="text-sm text-gray-400 mt-0.5">
            Last updated {format(parseISO(cur.date), 'd MMM yyyy')}
            {' · '}1 AUD = Rp {Math.round(1 / (nw?.idrToAud ?? 0.000094)).toLocaleString('id-ID')}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <StatCard
                label="Total Net Worth"
                value={cur ? fmtAUD(cur.total_aud) : 'No data yet'}
                sub={change !== null ? `${change >= 0 ? '+' : ''}${fmtAUD(change)} since last entry` : undefined}
                color={change !== null && change >= 0 ? 'bg-indigo-50' : 'bg-white'}
              />
            </div>
            <StatCard
              label="Indonesian Bank"
              value={nw?.latestRaw['indonesian_bank'] != null ? fmtIDR(nw.latestRaw['indonesian_bank']) : '—'}
              sub={cur?.indonesian_bank_aud ? `≈ ${fmtAUD(cur.indonesian_bank_aud)}` : undefined}
            />
            <StatCard
              label="Indonesian Shares"
              value={nw?.latestRaw['indonesian_shares'] != null ? fmtIDR(nw.latestRaw['indonesian_shares']) : '—'}
              sub={cur?.indonesian_shares_aud ? `≈ ${fmtAUD(cur.indonesian_shares_aud)}` : undefined}
            />
            <div className="col-span-2">
              <StatCard
                label="Australian Cash"
                value={nw?.latestRaw['australian_cash'] != null ? fmtAUD(nw.latestRaw['australian_cash']) : '—'}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Net Worth Over Time (AUD)</h2>
            <NetWorthChart data={nw?.timeline ?? []} />
          </div>

          {cur && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-2">Allocation</h2>
              <AccountBreakdown
                indonesian_bank_aud={cur.indonesian_bank_aud}
                indonesian_shares_aud={cur.indonesian_shares_aud}
                australian_cash_aud={cur.australian_cash_aud}
              />
            </div>
          )}

          {goals.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-800 mb-3">Goals</h2>
              <div className="space-y-3">
                {goals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    currentNetWorthAUD={cur?.total_aud ?? 0}
                    onDelete={deleteGoal}
                  />
                ))}
              </div>
            </div>
          )}

          {goals.length === 0 && !loading && (
            <div className="text-center py-4 text-gray-400 text-sm">
              No goals yet.{' '}
              <a href="/goals" className="text-indigo-500 hover:underline">Add one →</a>
            </div>
          )}
        </>
      )}
    </div>
  )
}
