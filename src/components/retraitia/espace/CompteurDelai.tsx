'use client'

interface CompteurDelaiProps {
  dateDebut: string  // ISO date
  delaiJours: number // delai attendu en jours
  label?: string
}

export function CompteurDelai({ dateDebut, delaiJours, label }: CompteurDelaiProps) {
  const debut = new Date(dateDebut)
  const now = new Date()
  const joursEcoules = Math.floor((now.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24))
  const joursRestants = delaiJours - joursEcoules
  const pct = Math.min(100, Math.round((joursEcoules / delaiJours) * 100))

  let colorBar = 'bg-emerald'
  let colorText = 'text-slate-muted'
  if (joursRestants <= 5 && joursRestants > 0) { colorBar = 'bg-amber-400'; colorText = 'text-amber-600' }
  if (joursRestants <= 0) { colorBar = 'bg-red-500'; colorText = 'text-red-600' }

  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-xs text-slate-muted whitespace-nowrap">{label}</span>}
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorBar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium whitespace-nowrap ${colorText}`}>
        {joursRestants > 0 ? `J+${joursEcoules} / ${delaiJours}j` : `Delai depasse (J+${joursEcoules})`}
      </span>
    </div>
  )
}
