'use client'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  sublabel?: string
}

export function ProgressBar({ current, total, label, sublabel }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="mb-6">
      {(label || sublabel) && (
        <div className="flex items-baseline justify-between mb-2">
          {label && (
            <p className="text-sm font-medium text-slate-text">
              {label} <span className="text-emerald font-bold">{current}/{total} ✅</span>
            </p>
          )}
          {sublabel && <p className="text-xs text-slate-muted">{sublabel}</p>}
        </div>
      )}
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald to-emerald-light rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
