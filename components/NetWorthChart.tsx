'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface DataPoint {
  date: string
  total_aud: number
  indonesian_bank_aud: number
  indonesian_shares_aud: number
  australian_cash_aud: number
  super_aud: number
}

interface Props {
  data: DataPoint[]
}

function formatAUD(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
  return `$${v}`
}

export function NetWorthChart({ data }: Props) {
  const [includeSuper, setIncludeSuper] = useState(false)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data yet — enter your first balances to see the chart.
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    label: format(parseISO(d.date), 'd MMM yy'),
    value: includeSuper ? d.total_aud : d.total_aud - d.super_aud,
  }))

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setIncludeSuper(v => !v)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            includeSuper
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          {includeSuper ? '✓ Super included' : 'Include Super'}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={formatAUD} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <Tooltip
            formatter={(v) =>
              new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(Number(v))
            }
            labelStyle={{ fontWeight: 600 }}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={includeSuper ? 'Net Worth (incl. Super)' : 'Net Worth (excl. Super)'}
            stroke="#4f46e5"
            strokeWidth={2}
            fill="url(#grad)"
            dot={data.length <= 12}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
