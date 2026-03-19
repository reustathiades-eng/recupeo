'use client'
import { useState } from 'react'
import { TimelineAnomalie } from '@/components/retraitia/espace/TimelineAnomalie'
import { MessageCopiable } from '@/components/retraitia/espace/MessageCopiable'
import { CheckInteractif } from '@/components/retraitia/espace/CheckInteractif'
import { CompteurDelai } from '@/components/retraitia/espace/CompteurDelai'
import type { EscaladeStep, AnomalyTrackingStatus } from '@/lib/retraitia/types'
import Link from 'next/link'

// Stub data — sera remplace par fetch API
interface DemarcheDetail {
  anomalyId: string
  label: string
  description: string
  detail: string
  confiance: string
  impactMensuel: { min: number; max: number }
  organisme: string
  faciliteCorrection: string
  delaiEstime: string
  etapeActuelle: EscaladeStep
  statut: AnomalyTrackingStatus
  historique: Array<{ etape: EscaladeStep; date: string; action: string }>
  message?: { objet: string; corps: string; organisme: string; guideEnvoi: string }
}

const CONFIANCE: Record<string, { bg: string; label: string }> = {
  CERTAIN: { bg: 'bg-emerald/10 text-emerald', label: '🟢 Verifie' },
  HAUTE_CONFIANCE: { bg: 'bg-blue-50 text-blue-600', label: '🔵 Calcule' },
  ESTIMATION: { bg: 'bg-amber-50 text-amber-600', label: '🟡 Estime' },
}

export default function DemarcheDetailPage() {
  const [data] = useState<DemarcheDetail | null>(null)
  const [checks, setChecks] = useState<Record<string, boolean>>({})

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-muted">Chargement...</p>
      </div>
    )
  }

  return (
    <div>
      <Link href="/mon-espace/retraitia/demarches" className="text-sm text-emerald hover:underline mb-4 inline-block">
        ← Retour aux demarches
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-slate-text">{data.label}</h1>
          <p className="text-sm text-slate-muted">{data.organisme}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full ${CONFIANCE[data.confiance]?.bg || ''}`}>
          {CONFIANCE[data.confiance]?.label || data.confiance}
        </span>
      </div>

      {/* Impact */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-red-800">
          Impact : <strong>{data.impactMensuel.min}-{data.impactMensuel.max}EUR/mois</strong>
          {' · '}{data.faciliteCorrection} · {data.delaiEstime}
        </p>
      </div>

      {/* Detail */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-slate-text">{data.detail}</p>
      </div>

      {/* Timeline d'escalade */}
      <div className="mb-6">
        <h2 className="font-heading font-bold text-slate-text text-sm mb-3">Progression</h2>
        <TimelineAnomalie
          etapeActuelle={data.etapeActuelle}
          statut={data.statut}
          historique={data.historique}
        />
      </div>

      {/* Compteur delai si en attente */}
      {data.statut === 'en_attente_reponse' && data.historique.length > 0 && (
        <div className="mb-6">
          <CompteurDelai
            dateDebut={data.historique[data.historique.length - 1].date}
            delaiJours={60}
            label="Delai de reponse"
          />
        </div>
      )}

      {/* Message a copier-coller */}
      {data.message && data.statut === 'a_traiter' && (
        <div className="mb-6">
          <h2 className="font-heading font-bold text-slate-text text-sm mb-3">Message a envoyer</h2>
          <MessageCopiable
            objet={data.message.objet}
            corps={data.message.corps}
            organisme={data.message.organisme}
            guideEnvoi={data.message.guideEnvoi}
          />
        </div>
      )}

      {/* Checks interactifs */}
      <div className="space-y-2 mb-6">
        <h2 className="font-heading font-bold text-slate-text text-sm mb-3">Actions</h2>
        <CheckInteractif
          label="J'ai copie et envoye le message"
          checked={checks['sent'] || false}
          onCheck={() => setChecks(c => ({ ...c, sent: true }))}
        />
        <CheckInteractif
          label="J'ai recu une reponse"
          sublabel="Positive ou negative — cochez quand vous avez des nouvelles"
          checked={checks['response'] || false}
          onCheck={() => setChecks(c => ({ ...c, response: true }))}
          disabled={!checks['sent']}
        />
        <CheckInteractif
          label="L'anomalie est corrigee"
          sublabel="Votre pension a ete rectifiee"
          checked={checks['resolved'] || false}
          onCheck={() => setChecks(c => ({ ...c, resolved: true }))}
          disabled={!checks['response']}
        />
      </div>
    </div>
  )
}
