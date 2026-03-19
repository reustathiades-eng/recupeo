'use client'

export type StatusState = 'todo' | 'waiting' | 'done' | 'optional' | 'locked'

interface StatusCardProps {
  state: StatusState
  title: string
  subtitle?: string
  timeEstimate?: string
  required?: boolean
  actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' }>
  onClick?: () => void
  children?: React.ReactNode
}

const STATE_CONFIG: Record<StatusState, { bg: string; border: string; icon: string; iconBg: string }> = {
  todo:     { bg: 'bg-red-50', border: 'border-red-200', icon: '🔴', iconBg: 'bg-red-100' },
  waiting:  { bg: 'bg-amber-50', border: 'border-amber-200', icon: '🟡', iconBg: 'bg-amber-100' },
  done:     { bg: 'bg-emerald/5', border: 'border-emerald/20', icon: '✅', iconBg: 'bg-emerald/10' },
  optional: { bg: 'bg-slate-50', border: 'border-slate-200', icon: '⚪', iconBg: 'bg-slate-100' },
  locked:   { bg: 'bg-slate-100', border: 'border-slate-200', icon: '🔒', iconBg: 'bg-slate-200' },
}

export function StatusCard({ state, title, subtitle, timeEstimate, required, actions, onClick, children }: StatusCardProps) {
  const cfg = STATE_CONFIG[state]
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      onClick={onClick}
      className={`w-full ${cfg.bg} border ${cfg.border} rounded-xl p-4 text-left transition-all ${onClick ? 'hover:shadow-md cursor-pointer' : ''} ${state === 'locked' ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center text-sm flex-shrink-0 mt-0.5`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-text text-[15px] truncate">{title}</h3>
            {required && state === 'todo' && (
              <span className="text-[10px] font-semibold text-red-500 bg-red-100 px-1.5 py-0.5 rounded">REQUIS</span>
            )}
            {timeEstimate && state === 'todo' && (
              <span className="text-xs text-slate-muted">⏱ {timeEstimate}</span>
            )}
          </div>
          {subtitle && <p className="text-sm text-slate-muted mt-0.5">{subtitle}</p>}
          {children && <div className="mt-2">{children}</div>}
          {actions && actions.length > 0 && state !== 'locked' && (
            <div className="flex gap-2 mt-3">
              {actions.map((a, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); a.onClick() }}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    a.variant === 'primary'
                      ? 'bg-emerald text-[#060D1B] hover:bg-emerald-light'
                      : 'bg-white border border-slate-200 text-slate-text hover:bg-slate-50'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  )
}
