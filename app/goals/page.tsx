'use client'

import { useEffect, useState } from 'react'
import { differenceInDays, format, parseISO } from 'date-fns'

interface Goal {
  id: string
  name: string
  target_amount_aud: number
  target_date: string | null
}

const fmtAUD = (v: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(v)

function DaysLeftBadge({ targetDate }: { targetDate: string | null }) {
  if (!targetDate) return null
  const days = differenceInDays(parseISO(targetDate), new Date())
  const cls = days < 30 ? 'badge-red' : days < 90 ? 'badge-amber' : 'badge-indigo'
  return <span className={`badge ${cls}`}>{days > 0 ? `${days}d left` : 'Past due'}</span>
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [currentNW, setCurrentNW] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/goals').then(r => r.json()),
      fetch('/api/networth').then(r => r.json()),
    ]).then(([g, nw]) => {
      setGoals(Array.isArray(g) ? g : [])
      setCurrentNW(nw.current?.total_aud ?? 0)
      setLoading(false)
    })
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !amount) return
    setAdding(true)
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, target_amount_aud: parseFloat(amount), target_date: date || null }),
    })
    const goal = await res.json()
    setGoals(g => [...g, goal])
    setName('')
    setAmount('')
    setDate('')
    setShowForm(false)
    setAdding(false)
  }

  async function deleteGoal(id: string) {
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
    setGoals(g => g.filter(x => x.id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Goals 🎯</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn-primary"
          style={{ padding: '10px 20px' }}
        >
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="glass-card">
          <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 20 }}>New Goal</h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                Goal name
              </label>
              <input
                type="text"
                placeholder="e.g. Emergency fund, House deposit"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                Target amount (AUD)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>
                  A$
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="50000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  min="1"
                  className="input-field"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                Target date <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button type="submit" className="btn-primary" disabled={adding}>
                {adding ? 'Adding…' : 'Add Goal'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => (
            <div key={i} className="glass-card" style={{ height: 160, opacity: 0.4 }} />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <div className="glass-card" style={{ textAlign: 'center', maxWidth: 360 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 8 }}>No goals yet</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Add one to start tracking your progress.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {goals.map(goal => {
            const pct = Math.min((currentNW / goal.target_amount_aud) * 100, 100)
            const remaining = Math.max(goal.target_amount_aud - currentNW, 0)
            return (
              <div key={goal.id} className="glass-card" style={{ position: 'relative' }}>
                {/* Delete button */}
                <button
                  onClick={() => deleteGoal(goal.id)}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
                    color: '#ef4444', fontSize: 14, lineHeight: 1,
                  }}
                  title="Delete goal"
                >
                  🗑
                </button>

                {/* Goal name */}
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 17, marginBottom: 12, paddingRight: 48 }}>
                  {goal.name}
                </h3>

                {/* Two-col stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Target</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{fmtAUD(goal.target_amount_aud)}</div>
                  </div>
                  {goal.target_date && (
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Date</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{format(parseISO(goal.target_date), 'MMM yyyy')}</div>
                    </div>
                  )}
                </div>

                {/* Days badge */}
                <div style={{ marginBottom: 12 }}>
                  <DaysLeftBadge targetDate={goal.target_date} />
                </div>

                {/* Completion % */}
                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent-indigo)', marginBottom: 10 }}>
                  {pct.toFixed(0)}%
                </div>

                {/* Progress bar */}
                <div className="progress-bar" style={{ marginBottom: 16 }}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>

                {/* Footer */}
                <div className="goal-footer" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div>Current<br /><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{fmtAUD(currentNW)}</span></div>
                  <div style={{ textAlign: 'center' }}>To go<br /><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{fmtAUD(remaining)}</span></div>
                  <div style={{ textAlign: 'right' }}>Target<br /><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{fmtAUD(goal.target_amount_aud)}</span></div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
