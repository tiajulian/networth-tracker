'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

const IDR_TO_AUD = 1 / 10400

const ACCOUNTS = [
  { key: 'indonesian_bank', label: 'Indonesian Bank', currency: 'IDR', color: '#6366f1', symbol: 'Rp' },
  { key: 'indonesian_shares', label: 'Indonesian Shares', currency: 'IDR', color: '#8b5cf6', symbol: 'Rp' },
  { key: 'australian_cash', label: 'Australian Cash', currency: 'AUD', color: '#10b981', symbol: 'A$' },
  { key: 'australian_shares', label: 'Australian Shares', currency: 'AUD', color: '#06b6d4', symbol: 'A$' },
]

const fmtAUD = (v: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(v)

export default function EntryPage() {
  const [values, setValues] = useState<Record<string, string>>({
    indonesian_bank: '',
    indonesian_shares: '',
    australian_cash: '',
    australian_shares: '',
  })
  const [latestRaw, setLatestRaw] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/networth').then(r => r.json()).then(d => {
      const raw = d.latestRaw ?? {}
      setLatestRaw(raw)
      setValues({
        indonesian_bank: raw['indonesian_bank'] != null ? String(raw['indonesian_bank']) : '',
        indonesian_shares: raw['indonesian_shares'] != null ? String(raw['indonesian_shares']) : '',
        australian_cash: raw['australian_cash'] != null ? String(raw['australian_cash']) : '',
        australian_shares: raw['australian_shares'] != null ? String(raw['australian_shares']) : '',
      })
    })
  }, [])

  const toAUD = (key: string, val: string) => {
    const n = parseFloat(val) || 0
    if (key === 'australian_cash' || key === 'australian_shares') return n
    return n * IDR_TO_AUD
  }

  const totalAUD = ACCOUNTS.reduce((sum, acc) => sum + toAUD(acc.key, values[acc.key] ?? ''), 0)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const today = format(new Date(), 'yyyy-MM-dd')
    try {
      await Promise.all(
        ACCOUNTS.filter(acc => values[acc.key] !== '').map(acc =>
          fetch('/api/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              account_type: acc.key,
              amount: parseFloat(values[acc.key]),
              date: today,
            }),
          })
        )
      )
      setSaved(true)
      setTimeout(() => router.push('/'), 1500)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent-green)', marginBottom: 8 }}>
            Balances saved!
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Redirecting to dashboard…</div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Enter Balances</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
          📅 Bi-weekly check-in — update your balances below
        </p>
      </div>

      {/* Live total preview */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 16, padding: 'clamp(16px, 5vw, 20px) clamp(16px, 5vw, 24px)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ fontSize: 28 }}>💰</span>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>TOTAL NET WORTH</div>
          <div style={{ fontSize: 'clamp(22px, 6vw, 32px)', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {fmtAUD(totalAUD)}
          </div>
        </div>
      </div>

      {/* Account inputs */}
      {ACCOUNTS.map(acc => {
        const audEquiv = toAUD(acc.key, values[acc.key] ?? '')
        return (
          <div key={acc.key} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderLeft: `4px solid ${acc.color}`,
            borderRadius: 16, padding: 'clamp(16px, 5vw, 20px) clamp(16px, 5vw, 24px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{acc.label}</span>
              <span style={{
                background: `${acc.color}22`, color: acc.color,
                borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700,
              }}>
                {acc.currency}
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontSize: 14, pointerEvents: 'none',
              }}>
                {acc.symbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={values[acc.key]}
                onChange={e => setValues(v => ({ ...v, [acc.key]: e.target.value }))}
                className="input-field"
                style={{ paddingLeft: acc.symbol.length > 2 ? 44 : 36, fontSize: 18, fontWeight: 600 }}
              />
            </div>
            {acc.currency === 'IDR' && audEquiv > 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                ≈ {fmtAUD(audEquiv)}
              </div>
            )}
          </div>
        )
      })}

      <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
        {saving ? 'Saving…' : 'Save Balances →'}
      </button>
    </form>
  )
}
