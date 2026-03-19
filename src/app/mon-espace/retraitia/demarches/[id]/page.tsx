"use client"
import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useDossier } from '@/lib/retraitia/DossierContext'
import { TimelineAnomalie } from '@/components/retraitia/espace/TimelineAnomalie'
import { MessageCopiable } from '@/components/retraitia/espace/MessageCopiable'
import { CheckInteractif } from '@/components/retraitia/espace/CheckInteractif'
import { CompteurDelai } from '@/components/retraitia/espace/CompteurDelai'
import Link from 'next/link'

const CONFIANCE: Record<string, { bg: string; label: string }> = {
  CERTAIN: { bg: 'bg-emerald/10 text-emerald', label: '\U0001F7E2 Verifie' },
  HAUTE_CONFIANCE: { bg: 'bg-blue-50 text-blue-600', label: '\U0001F535 Calcule' },
  ESTIMATION: { bg: 'bg-amber-50 text-amber-600', label: '\U0001F7E1 Estime' },
}

export default function DemarcheDetailPage() {
  const params = useParams()
  const anomalyId = params?.id as string
  const { dossier, loading, refetch } = useDossier()
  const [saving, setSaving] = useState(false)

  const demarche = useMemo(() => {
    if (!dossier?.demarches) return null
    return (dossier.demarches as any[]).find((d: any) => d.anomalyId === anomalyId) || null
  }, [dossier, anomalyId])

  const message = useMemo(() => {
    if (!dossier?.messages) return null
    return (dossier.messages as any[]).find((m: any) => m.anomalyId === anomalyId) || null
  }, [dossier, anomalyId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    )
  }

  if (!dossier || !demarche) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-muted mb-4">Demarche introuvable.</p>
        <Link href="/mon-espace/retraitia/demarches" className="text-sm text-emerald hover:underline">
          \u2190 Retour aux demarches
        </Link>
      </div>
    )
  }

  const updateCheck = async (field: string, value: boolean) => {
    setSaving(true)
    try {
      // TODO: POST to /api/retraitia/demarche-check to update status
      // For now just refetch
      await refetch()
    } finally {
      setSaving(false)
    }
  }

  const statut = demarche.statut || 'a_traiter'
  const historique = demarche.historique || []
  const conf = CONFIANCE[demarche.confiance] || {}

  return (
    <div>
      <Link href="/mon-espace/retraitia/demarches" className="text-sm text-emerald hover:underline mb-4 inline-block">
        \u2190 Retour aux demarches
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-slate-text">{demarche.label}</h1>
          <p className="text-sm text-slate-muted">{demarche.organisme}</p>
        </div>
        {conf.bg && (
          <span className={`text-xs px-2.5 py-1 rounded-full ${conf.bg}`}>
            {conf.label}
          </span>
        )}
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-red-800">
          Impact : <strong>{demarche.impactMin || 0}-{demarche.impactMax || 0}\u20AC/mois</strong>
          {demarche.faciliteCorrection ? ` \u00B7 ${demarche.faciliteCorrection}` : ''}
          {demarche.delaiEstime ? ` \u00B7 ${demarche.delaiEstime}` : ''}
        </p>
      </div>

      {demarche.detail && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-text">{demarche.detail}</p>
        </div>
      )}

      {historique.length > 0 && (
        <div className="mb-6">
          <h2 className="font-heading font-bold text-slate-text text-sm mb-3">Progression</h2>
          <TimelineAnomalie
            etapeActuelle={demarche.etapeActuelle || 'message_en_ligne'}
            statut={statut}
            historique={historique}
          />
        </div>
      )}

      {statut === 'en_attente_reponse' && historique.length > 0 && (
        <div className="mb-6">
          <CompteurDelai
            dateDebut={historique[historique.length - 1].date}
            delaiJours={60}
            label="Delai de reponse"
          />
        </div>
      )}

      {message && (statut === 'a_traiter' || statut === 'message_envoye') && (
        <div className="mb-6">
          <h2 className="font-heading font-bold text-slate-text text-sm mb-3">Message a envoyer</h2>
          <MessageCopiable
            objet={message.objet || message.subject || ''}
            corps={message.corps || message.body || ''}
            organisme={message.organisme || demarche.organisme || ''}
            guideEnvoi={message.guideEnvoi || message.guide || ''}
          />
        </div>
      )}

      <div className="space-y-2 mb-6">
        <h2 className="font-heading font-bold text-slate-text text-sm mb-3">Actions</h2>
        <CheckInteractif
          label="J'ai copie et envoye le message"
          checked={statut !== 'a_traiter'}
          onCheck={() => updateCheck('sent', true)}
        />
        <CheckInteractif
          label="J'ai recu une reponse"
          sublabel="Positive ou negative"
          checked={statut === 'reponse_recue' || statut === 'corrige' || statut === 'refuse'}
          onCheck={() => updateCheck('response', true)}
          disabled={statut === 'a_traiter'}
        />
        <CheckInteractif
          label="L'anomalie est corrigee"
          sublabel="Votre pension a ete rectifiee"
          checked={statut === 'corrige'}
          onCheck={() => updateCheck('resolved', true)}
          disabled={statut !== 'reponse_recue' && statut !== 'corrige'}
        />
      </div>
    </div>
  )
}
