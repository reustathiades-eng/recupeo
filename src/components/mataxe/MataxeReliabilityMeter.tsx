'use client'

interface ReliabilityMeterProps {
  score: number
  level: 'bronze' | 'argent' | 'or' | 'platine'
  label: string
  nextStep?: string | null
  nextStepGain?: number | null
  compact?: boolean
}

const LEVELS = [
  { key: 'bronze', label: 'Indicatif', score: 40, icon: '🥉', color: 'bg-amber-400' },
  { key: 'argent', label: 'Raisonnable', score: 60, icon: '🥈', color: 'bg-slate-400' },
  { key: 'or', label: 'Précis', score: 80, icon: '🥇', color: 'bg-yellow-400' },
  { key: 'platine', label: 'Quasi-exact', score: 95, icon: '💎', color: 'bg-emerald' },
]

export function MataxeReliabilityMeter({ score, level, label, nextStep, nextStepGain, compact }: ReliabilityMeterProps) {
  const currentIdx = LEVELS.findIndex(l => l.key === level)

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-bg rounded-xl border border-slate-border">
        <span className="text-lg">{LEVELS[currentIdx]?.icon || '🎯'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-text">Fiabilité : {label}</span>
            <span className="text-xs font-bold text-emerald">{score}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-border rounded-full mt-1 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎯</span>
        <h3 className="font-heading font-bold text-slate-text text-base">Fiabilité de votre diagnostic</h3>
      </div>

      {/* Barre de progression */}
      <div className="relative mb-6">
        <div className="w-full h-3 bg-slate-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald"
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Marqueurs des niveaux */}
        <div className="flex justify-between mt-2">
          {LEVELS.map((l, i) => {
            const active = i <= currentIdx
            const isCurrent = l.key === level
            return (
              <div key={l.key} className="flex flex-col items-center" style={{ width: '24%' }}>
                <span className={`text-sm ${isCurrent ? '' : 'grayscale opacity-40'}`}>{l.icon}</span>
                <span className={`text-[10px] font-medium mt-0.5 ${isCurrent ? 'text-slate-text font-bold' : active ? 'text-slate-muted' : 'text-slate-muted/50'}`}>
                  {l.label}
                </span>
                <span className={`text-[10px] ${isCurrent ? 'text-emerald font-bold' : 'text-slate-muted/50'}`}>
                  {l.score}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Niveau actuel */}
      <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 ${
        level === 'platine' ? 'bg-emerald/10 border border-emerald/20' :
        level === 'or' ? 'bg-yellow-50 border border-yellow-200' :
        level === 'argent' ? 'bg-slate-bg border border-slate-border' :
        'bg-amber-50 border border-amber-200'
      }`}>
        <span className="text-2xl">{LEVELS[currentIdx]?.icon}</span>
        <div>
          <div className="font-semibold text-sm text-slate-text">
            Vous êtes au niveau {LEVELS[currentIdx]?.label} — {score}%
          </div>
          <div className="text-xs text-slate-muted">{label}</div>
        </div>
      </div>

      {/* Prochaine étape */}
      {nextStep && (
        <div className="p-3 bg-navy/[0.03] rounded-xl border border-dashed border-slate-border">
          <div className="flex items-start gap-2">
            <span className="text-sm mt-0.5">💡</span>
            <div>
              <p className="text-sm text-slate-text">{nextStep}</p>
              {nextStepGain && (
                <p className="text-xs text-emerald font-semibold mt-1">
                  → Fiabilité passera à ~{nextStepGain}%
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
