'use client'

import { useEffect, useState } from 'react'
import { GoalCard } from '@/components/GoalCard'

interface Goal {
  id: string
  name: string
  target_amount_aud: number
  target_date: string | null
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [currentNW, setCurrentNW] = useState(0)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4"
        >
          <h2 className="font-semibold text-gray-800">New Goal</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal name</label>
            <input
              type="text"
              placeholder="e.g. Emergency fund, House deposit"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target amount (AUD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">A$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="50000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                min="1"
                className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="month"
              value={date}
              onChange={e => setDate(e.target.value ? e.target.value + '-01' : '')}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={adding}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors text-sm"
          >
            {adding ? 'Adding…' : 'Add Goal'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No goals yet. Add one to start tracking your progress.
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              currentNetWorthAUD={currentNW}
              onDelete={deleteGoal}
            />
          ))}
        </div>
      )}
    </div>
  )
}
