'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ProgressBar } from '@/components/retraitia/espace/ProgressBar'

interface DemarcheItem {
  anomalyId: string
  label: string
  impactMax: number
  organisme: string
  statut: string
  confiance: string
  etape: string
  crossSell?: string
}

const STATUT_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  a_traiter: { icon: '🔴', label: 'A traiter', color: 'text-red-600' },
  message_envoye: { icon: '🟡', label: 'Message envoye', color: 'text-amber-600' },
  en_attente_reponse: { icon: '🟡', label: 'En attente', color: 'text-amber-600' },
  reponse_recue: { icon: '🔵', label: 'Reponse recue', color: 'text-blue-600' },
  corrige: { icon: '✅', label: 'Corrige', color: 'text-emerald' },
  refuse: { icon: '❌', label: 'Refuse → escalade', color: 'text-red-600' },
  non_anomalie: { icon: '⚪', label: 'Pas d\'erreur', color: 'text-slate-400' },
}

export default function DemarchesPage() {
  // TODO: fetch from API
  const [demarches] = useState<DemarcheItem[]>([])
  const pack49Paid = false

  if (!pack49Paid) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-8 text-center opacity-80">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="font-heading text-xl font-bold text-slate-text mb-2">Suivi des demarches</h1>
        <p className="text-sm text-slate-muted mb-4">
          Cette section se debloque avec le Pack Action.
          Vous y trouverez vos messages pre-rediges et le suivi de chaque anomalie.
        </p>
      </div>
    )
  }

  const resolved = demarches.filter(d => d.statut === 'corrige').length
  const actionable = demarches.filter(d => d.statut !== 'corrige' && d.statut !== 'non_anomalie' && !d.crossSell)

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-slate-text mb-1">Vos demarches</h1>
      <p className="text-sm text-slate-muted mb-4">Suivez chaque anomalie jusqu'a resolution.</p>

      <ProgressBar
        current={resolved}
        total={demarches.length}
        label="Anomalies resolues"
        sublabel="Objectif : tout passer au vert"
      />

      <div className="space-y-3">
        {demarches.map((d, i) => {
          const cfg = STATUT_CONFIG[d.statut] || STATUT_CONFIG.a_traiter

          if (d.crossSell) {
            return (
              <div key={d.anomalyId} className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-text">💡 {d.label}</p>
                  <p className="text-xs text-blue-600">Impact ~{d.impactMax}EUR/mois</p>
                </div>
                <span className="text-xs text-blue-700 font-medium bg-blue-100 px-3 py-1 rounded-lg">
                  Verifier avec {d.crossSell.toUpperCase()}
                </span>
              </div>
            )
          }

          return (
            <Link
              key={d.anomalyId}
              href={`/mon-espace/retraitia/demarches/${d.anomalyId}`}
              className="block bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{cfg.icon}</span>
                  <div>
                    <p className="font-medium text-slate-text text-sm">#{i + 1} {d.label}</p>
                    <p className="text-xs text-slate-muted mt-0.5">{d.organisme} · {cfg.label}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-600">{d.impactMax}EUR/mois</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
