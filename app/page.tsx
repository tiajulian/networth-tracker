'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { format, parseISO, differenceInDays } from 'date-fns'

interface Snapshot {
  date: string
  total_aud: number
  indonesian_bank_aud: number
  indonesian_shares_aud: number
  australian_cash_aud: number
}
interface Goal {
  id: string
  name: string
  target_amount_aud: number
  target_date: string | null
}
interface NWData {
  timeline: Snapshot[]
  current: Snapshot | null
  latestRaw: Record<string, number>
  idrToAud: number
}

const fmtAUD = (v: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(v)

const fmtIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

const fmtYAxis = (v: number) =>
  v >= 1_000_000 ? `A$${(v / 1_000_000).toFixed(2)}M` : `A$${Math.round(v / 1000)}k`

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      <div className="value">{fmtAUD(payload[0].value)}</div>
    </div>
  )
}

function DaysLeftBadge({ targetDate }: { targetDate: string | null }) {
  if (!targetDate) return null
  const days = differenceInDays(parseISO(targetDate), new Date())
  const cls = days < 30 ? 'badge-red' : days < 90 ? 'badge-amber' : 'badge-indigo'
  return <span className={`badge ${cls}`}>{days > 0 ? `${days}d left` : 'Past due'}</span>
}

export default function Dashboard() {
  const [nw, setNw] = useState<NWData | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

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

  const timeline = nw?.timeline ?? []
  const cur = nw?.current
  const prev = timeline.at(-2)
  const first = timeline.at(0)

  const change = cur && prev ? cur.total_aud - prev.total_aud : null
  const changePct = change && prev ? (change / prev.total_aud) * 100 : null
  const ath = timeline.length ? Math.max(...timeline.map(t => t.total_aud)) : 0
  const totalGrowth = cur && first && first.total_aud > 0
    ? ((cur.total_aud - first.total_aud) / first.total_aud) * 100 : null
  const primaryGoal = goals[0] ?? null

  const daysSinceUpdate = cur ? differenceInDays(new Date(), parseISO(cur.date)) : 999
  const updateDue = daysSinceUpdate >= 14

  const chartData = timeline.map(t => ({
    date: format(parseISO(t.date), 'd MMM'),
    total_aud: t.total_aud,
  }))

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: '16px' }}>
        {[1,2,3].map(i => (
          <div key={i} className="glass-card" style={{ height: 80, opacity: 0.4, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 8 }}>No data yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
            Enter your first balances to start tracking your net worth.
          </p>
          <Link href="/entry" className="btn-primary" style={{ textDecoration: 'none' }}>
            Enter Balances →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Alert banner */}
      {updateDue && (
        <div className="alert-banner">
          <span style={{ color: 'var(--accent-amber)', fontWeight: 600, fontSize: 14 }}>
            ⏰ Balance update due — last updated {daysSinceUpdate}d ago
          </span>
          <Link href="/entry" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: 13 }}>
            Enter now →
          </Link>
        </div>
      )}

      {/* Page title */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Dashboard</h1>
        {cur && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Last updated {format(parseISO(cur.date), 'd MMM yyyy')}
            {' · '}1 AUD ≈ Rp {Math.round(1 / (nw?.idrToAud ?? 0.000094)).toLocaleString('id-ID')}
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>

        {/* Net Worth */}
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Current Net Worth
          </div>
          <div style={{ fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            {cur ? fmtAUD(cur.total_aud) : '—'}
          </div>
          {change !== null && (
            <span className={`badge ${change >= 0 ? 'badge-green' : 'badge-red'}`}>
              {change >= 0 ? '+' : ''}{fmtAUD(change)} ({changePct?.toFixed(1)}%)
            </span>
          )}
        </div>

        {/* ATH */}
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            All-Time High 🏆
          </div>
          <div style={{ fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            {fmtAUD(ath)}
          </div>
          {cur && cur.total_aud >= ath && (
            <span className="badge badge-green">New ATH! 🎉</span>
          )}
        </div>

        {/* Total Growth */}
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Total Growth
          </div>
          <div style={{
            fontSize: 26, fontWeight: 800, marginBottom: 8,
            color: totalGrowth !== null && totalGrowth >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
          }}>
            {totalGrowth !== null ? `${totalGrowth >= 0 ? '+' : ''}${totalGrowth.toFixed(1)}%` : '—'}
          </div>
          {first && (
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              from {fmtAUD(first.total_aud)}
            </div>
          )}
        </div>

        {/* Primary Goal */}
        {primaryGoal ? (
          <div className="stat-card">
            <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              🎯 {primaryGoal.name}
            </div>
            <div style={{ fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              {cur ? Math.min((cur.total_aud / primaryGoal.target_amount_aud) * 100, 100).toFixed(0) : 0}%
            </div>
            <div className="progress-bar" style={{ marginBottom: 8 }}>
              <div className="progress-bar-fill" style={{
                width: `${cur ? Math.min((cur.total_aud / primaryGoal.target_amount_aud) * 100, 100) : 0}%`
              }} />
            </div>
            <DaysLeftBadge targetDate={primaryGoal.target_date} />
          </div>
        ) : (
          <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>No goals yet</div>
            <Link href="/goals" style={{ color: 'var(--accent-indigo)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              Add a goal →
            </Link>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="glass-card">
        <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 20 }}>
          Net Worth Growth
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtYAxis} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={64} />
            <Tooltip content={<CustomTooltip />} />
            {primaryGoal && (
              <ReferenceLine
                y={primaryGoal.target_amount_aud}
                stroke="#f59e0b"
                strokeDasharray="6 3"
                label={{ value: `Goal: ${fmtAUD(primaryGoal.target_amount_aud)}`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 11 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="total_aud"
              name="Net Worth"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#indigoGrad)"
              dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#818cf8', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Portfolio breakdown */}
      {cur && (
        <div className="glass-card">
          <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 20 }}>
            Portfolio Breakdown
          </h2>
          {[
            { label: 'Indonesian Bank', value: cur.indonesian_bank_aud, color: '#6366f1', rawKey: 'indonesian_bank', isIDR: true },
            { label: 'Indonesian Shares', value: cur.indonesian_shares_aud, color: '#8b5cf6', rawKey: 'indonesian_shares', isIDR: true },
            { label: 'Australian Cash', value: cur.australian_cash_aud, color: '#10b981', rawKey: 'australian_cash', isIDR: false },
          ].map(acc => {
            const pct = cur.total_aud > 0 ? (acc.value / cur.total_aud) * 100 : 0
            return (
              <div key={acc.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: acc.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{acc.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
                      {fmtAUD(acc.value)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div style={{
                    height: '100%', borderRadius: 999, transition: 'width 0.5s ease',
                    width: `${pct}%`, background: acc.color,
                  }} />
                </div>
                {acc.isIDR && nw?.latestRaw[acc.rawKey] != null && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>
                    {fmtIDR(nw.latestRaw[acc.rawKey])}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Goals progress */}
      {goals.length > 0 && cur && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>🎯 Goals Progress</h2>
            <Link href="/goals" style={{ color: 'var(--accent-indigo)', fontSize: 13, textDecoration: 'none' }}>
              Manage goals →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {goals.map(goal => {
              const pct = Math.min((cur.total_aud / goal.target_amount_aud) * 100, 100)
              const remaining = Math.max(goal.target_amount_aud - cur.total_aud, 0)
              return (
                <div key={goal.id} className="glass-card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{goal.name}</div>
                    <DaysLeftBadge targetDate={goal.target_date} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-indigo)', marginBottom: 10 }}>
                    {pct.toFixed(0)}%
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 12 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    <div>Current<br /><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{fmtAUD(cur.total_aud)}</span></div>
                    <div style={{ textAlign: 'center' }}>To go<br /><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{fmtAUD(remaining)}</span></div>
                    <div style={{ textAlign: 'right' }}>Target<br /><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{fmtAUD(goal.target_amount_aud)}</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent entries */}
      {timeline.length > 0 && (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>Recent Entries</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...timeline].reverse().slice(0, 6).map((entry, i, arr) => {
              const prevEntry = arr[i + 1]
              const delta = prevEntry ? entry.total_aud - prevEntry.total_aud : null
              return (
                <div key={entry.date} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '14px 18px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    {format(parseISO(entry.date), 'd MMM yyyy')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {delta !== null && (
                      <span style={{ fontSize: 13, color: delta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {delta >= 0 ? '+' : ''}{fmtAUD(delta)}
                      </span>
                    )}
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fmtAUD(entry.total_aud)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
