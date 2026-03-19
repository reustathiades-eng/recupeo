'use client'

import type { EscaladeStep, AnomalyTrackingStatus } from '@/lib/retraitia/types'

interface TimelineProps {
  etapeActuelle: EscaladeStep
  statut: AnomalyTrackingStatus
  historique: Array<{ etape: EscaladeStep; date: string; action: string; note?: string }>
}

const STEPS: Array<{ key: EscaladeStep; label: string; delai: string }> = [
  { key: 'message_en_ligne', label: 'Message en ligne', delai: '' },
  { key: 'relance', label: 'Relance', delai: '2 mois' },
  { key: 'lrar', label: 'LRAR', delai: '1 mois' },
  { key: 'cra', label: 'Saisine CRA', delai: '2 mois' },
  { key: 'mediateur', label: 'Mediateur', delai: '3 mois' },
  { key: 'tribunal', label: 'Tribunal', delai: '' },
]

function getStepIndex(step: EscaladeStep): number {
  return STEPS.findIndex(s => s.key === step)
}

export function TimelineAnomalie({ etapeActuelle, statut, historique }: TimelineProps) {
  const currentIdx = getStepIndex(etapeActuelle)

  return (
    <div className="relative">
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const isDone = i < currentIdx || (i === currentIdx && (statut === 'corrige' || statut === 'message_envoye'))
          const isCurrent = i === currentIdx && statut !== 'corrige'
          const isFuture = i > currentIdx
          const histEntry = historique.find(h => h.etape === step.key)

          return (
            <div key={step.key} className="flex items-start flex-shrink-0" style={{ minWidth: 100 }}>
              {/* Connector line */}
              {i > 0 && (
                <div className={`h-0.5 w-6 mt-3.5 flex-shrink-0 ${isDone ? 'bg-emerald' : 'bg-slate-200'}`} />
              )}
              <div className="text-center">
                {/* Circle */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto ${
                  isDone ? 'bg-emerald text-white' :
                  isCurrent ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {isDone ? '✓' : i + 1}
                </div>
                {/* Label */}
                <p className={`text-[10px] mt-1 whitespace-nowrap ${isCurrent ? 'font-bold text-slate-text' : 'text-slate-muted'}`}>
                  {step.label}
                </p>
                {/* Date */}
                {histEntry && (
                  <p className="text-[9px] text-slate-muted">{new Date(histEntry.date).toLocaleDateString('fr-FR')}</p>
                )}
                {/* Delai */}
                {isFuture && step.delai && (
                  <p className="text-[9px] text-slate-muted/50">{step.delai}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
