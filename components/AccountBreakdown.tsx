'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props {
  indonesian_bank_aud: number
  indonesian_shares_aud: number
  australian_cash_aud: number
  super_aud: number
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981']
const LABELS = ['Indonesian Bank', 'Indonesian Shares', 'Aus Cash', 'Super']

export function AccountBreakdown({ indonesian_bank_aud, indonesian_shares_aud, australian_cash_aud, super_aud }: Props) {
  const values = [indonesian_bank_aud, indonesian_shares_aud, australian_cash_aud, super_aud]
  const data = LABELS.map((name, i) => ({ name, value: values[i] })).filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[LABELS.indexOf(data[i].name)]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) =>
            new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(Number(v))
          }
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
