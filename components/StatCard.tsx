interface Props {
  label: string
  value: string
  sub?: string
  color?: string
}

export function StatCard({ label, value, sub, color = 'bg-white' }: Props) {
  return (
    <div className={`${color} rounded-2xl border border-gray-100 p-5 shadow-sm`}>
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
