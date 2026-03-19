"use client"
import { useDossier } from '@/lib/retraitia/DossierContext'
import Link from 'next/link'
import { ProgressBar } from '@/components/retraitia/espace/ProgressBar'

const STATUT_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  a_traiter: { icon: '\U0001F534', label: 'A traiter', color: 'text-red-600' },
  message_envoye: { icon: '\U0001F7E1', label: 'Message envoye', color: 'text-amber-600' },
  en_attente_reponse: { icon: '\U0001F7E1', label: 'En attente', color: 'text-amber-600' },
  reponse_recue: { icon: '\U0001F535', label: 'Reponse recue', color: 'text-blue-600' },
  corrige: { icon: '\u2705', label: 'Corrige', color: 'text-emerald' },
  refuse: { icon: '\u274C', label: 'Refuse -> escalade', color: 'text-red-600' },
  non_anomalie: { icon: '\u26AA', label: "Pas d'erreur", color: 'text-slate-400' },
}

export default function DemarchesPage() {
  const { dossier, loading } = useDossier()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <p className="text-sm text-slate-muted">Aucun dossier.</p>
      </div>
    )
  }

  const pack49Paid = dossier.pack49Paid || dossier.seuilGratuit || false

  if (!pack49Paid) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-8 text-center opacity-80">
        <div className="text-4xl mb-4">\U0001F512</div>
        <h1 className="font-heading text-xl font-bold text-slate-text mb-2">Suivi des demarches</h1>
        <p className="text-sm text-slate-muted mb-4">
          Cette section se debloque avec le Pack Action.
          Vous y trouverez vos messages pre-rediges et le suivi de chaque anomalie.
        </p>
      </div>
    )
  }

  const demarches = (dossier.demarches as any[]) || []
  const resolved = demarches.filter(d => d.statut === 'corrige').length

  if (demarches.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">\U0001F4E8</div>
        <h1 className="font-heading text-xl font-bold text-slate-text mb-2">Aucune demarche</h1>
        <p className="text-sm text-slate-muted">
          Les demarches seront creees automatiquement a partir de votre diagnostic.
        </p>
      </div>
    )
  }

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
        {demarches.map((d: any, i: number) => {
          const cfg = STATUT_CONFIG[d.statut] || STATUT_CONFIG.a_traiter

          if (d.crossSell) {
            return (
              <div key={d.anomalyId || i} className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-text">{d.label}</p>
                  <p className="text-xs text-blue-600">Impact ~{d.impactMax}\u20AC/mois</p>
                </div>
                <span className="text-xs text-blue-700 font-medium bg-blue-100 px-3 py-1 rounded-lg">
                  Verifier avec {String(d.crossSell).toUpperCase()}
                </span>
              </div>
            )
          }

          return (
            <Link
              key={d.anomalyId || i}
              href={`/mon-espace/retraitia/demarches/${d.anomalyId}`}
              className="block bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{cfg.icon}</span>
                  <div>
                    <p className="font-medium text-slate-text text-sm">#{i + 1} {d.label}</p>
                    <p className="text-xs text-slate-muted mt-0.5">{d.organisme} \u00B7 {cfg.label}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-600">{d.impactMax}\u20AC/mois</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
