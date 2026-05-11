'use client'

import { format, parseISO, differenceInDays } from 'date-fns'

interface Goal {
  id: string
  name: string
  target_amount_aud: number
  target_date: string | null
}

interface Props {
  goal: Goal
  currentNetWorthAUD: number
  onDelete: (id: string) => void
}

export function GoalCard({ goal, currentNetWorthAUD, onDelete }: Props) {
  const progress = Math.min((currentNetWorthAUD / goal.target_amount_aud) * 100, 100)
  const remaining = Math.max(goal.target_amount_aud - currentNetWorthAUD, 0)
  const daysLeft = goal.target_date
    ? differenceInDays(parseISO(goal.target_date), new Date())
    : null

  const progressColor = progress >= 100 ? 'bg-green-500' : progress >= 60 ? 'bg-indigo-500' : 'bg-amber-400'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{goal.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Target:{' '}
            {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(
              goal.target_amount_aud
            )}
            {goal.target_date && ` · ${format(parseISO(goal.target_date), 'MMM yyyy')}`}
          </p>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
          title="Delete goal"
        >
          ×
        </button>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{progress.toFixed(0)}% there</span>
        {progress < 100 ? (
          <span className="text-gray-400">
            {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(
              remaining
            )}{' '}
            to go
            {daysLeft !== null && daysLeft > 0 && ` · ${daysLeft}d left`}
          </span>
        ) : (
          <span className="text-green-600 font-medium">Goal reached! 🎉</span>
        )}
      </div>
    </div>
  )
}
