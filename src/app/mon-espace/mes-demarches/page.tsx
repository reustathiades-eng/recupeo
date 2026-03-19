'use client'
// ============================================================
// /mon-espace/mes-demarches — Suivi des démarches (timeline)
// ============================================================

import { useState, useEffect } from 'react'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'

interface Demarche {
  id: string
  brique: string
  createdAt: string
  estimatedAmount?: number
  paid: boolean
  status: string
  demarche?: {
    letterSentAt?: string
    responseReceivedAt?: string
    responseType?: string
    montantRecupere?: number
    notes?: string
  }
}

const BRIQUE_LABELS: Record<string, string> = {
  macaution: 'MACAUTION', monloyer: 'MONLOYER', retraitia: 'RETRAITIA',
  mataxe: 'MATAXE', mapension: 'MAPENSION', mabanque: 'MABANQUE', monchomage: 'MONCHOMAGE',
}

const BRIQUE_COLORS: Record<string, string> = {
  macaution: 'bg-blue-100 text-blue-700', monloyer: 'bg-green-100 text-green-700',
  retraitia: 'bg-purple-100 text-purple-700', mataxe: 'bg-amber-100 text-amber-700',
  mapension: 'bg-pink-100 text-pink-700', mabanque: 'bg-cyan-100 text-cyan-700',
  monchomage: 'bg-orange-100 text-orange-700',
}

const RESPONSE_LABELS: Record<string, string> = {
  accepted_full: 'Acceptation totale',
  accepted_partial: 'Acceptation partielle',
  refused: 'Refus',
  no_response: 'Pas de réponse',
}

export default function MesDemarchesPage() {
  const [demarches, setDemarches] = useState<Demarche[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    track({ event: 'mes_demarches_viewed', brique: 'mon-espace' })
    fetchDemarches()
  }, [])

  async function fetchDemarches() {
    try {
      const res = await fetch('/api/auth/diagnostics')
      if (res.ok) {
        const json = await res.json()
        // Seuls les diagnostics payés ont des démarches
        setDemarches((json.diagnostics || []).filter((d: Demarche) => d.paid))
      }
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }

  async function updateDemarche(diagId: string, field: string, value: string) {
    setUpdating(diagId)
    try {
      const res = await fetch('/api/auth/demarche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosticId: diagId, field, value }),
      })
      if (res.ok) {
        track({ event: 'demarche_updated', brique: 'mon-espace' })
        await fetchDemarches()
      }
    } catch { /* silencieux */ }
    finally { setUpdating(null) }
  }

  function getTimelineSteps(d: Demarche) {
    const steps = [
      { label: 'Rapport généré', done: true, date: d.createdAt },
      { label: 'Courrier envoyé', done: !!d.demarche?.letterSentAt, date: d.demarche?.letterSentAt },
      { label: 'Réponse reçue', done: !!d.demarche?.responseReceivedAt, date: d.demarche?.responseReceivedAt },
      { label: 'Montant récupéré', done: !!d.demarche?.montantRecupere, date: null },
    ]
    return steps
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-2">Mes démarches</h1>
      <p className="text-slate-muted text-sm mb-6">Suivez l'avancement de vos réclamations.</p>

      {loading ? (
        <div className="text-center py-12 text-slate-muted">Chargement...</div>
      ) : demarches.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">📬</div>
          <p className="text-slate-muted">Aucune démarche en cours.</p>
          <p className="text-sm text-slate-muted mt-1">Vos réclamations apparaîtront ici après un achat de rapport.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {demarches.map(d => {
            const steps = getTimelineSteps(d)
            return (
              <div key={d.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${BRIQUE_COLORS[d.brique] || 'bg-slate-100 text-slate-600'}`}>
                      {BRIQUE_LABELS[d.brique] || d.brique}
                    </span>
                    {d.estimatedAmount ? (
                      <span className="text-sm font-semibold text-navy">{fmt(d.estimatedAmount)} € détectés</span>
                    ) : null}
                  </div>
                  {d.demarche?.montantRecupere ? (
                    <span className="text-sm font-bold text-emerald">✅ {fmt(d.demarche.montantRecupere)} € récupérés</span>
                  ) : null}
                </div>

                {/* Timeline */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-6">
                    {steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${step.done ? 'bg-emerald text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {step.done ? '✓' : i + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-medium ${step.done ? 'text-navy' : 'text-slate-muted'}`}>{step.label}</p>
                          {step.date && (
                            <p className="text-[10px] text-slate-muted">
                              {new Date(step.date).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`h-0.5 flex-1 ${step.done ? 'bg-emerald' : 'bg-slate-100'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {!d.demarche?.letterSentAt && (
                      <button
                        onClick={() => updateDemarche(d.id, 'letterSentAt', new Date().toISOString())}
                        disabled={updating === d.id}
                        className="px-4 py-2 bg-navy text-white text-xs font-medium rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
                      >
                        J'ai envoyé le courrier
                      </button>
                    )}
                    {d.demarche?.letterSentAt && !d.demarche?.responseReceivedAt && (
                      <button
                        onClick={() => updateDemarche(d.id, 'responseReceivedAt', new Date().toISOString())}
                        disabled={updating === d.id}
                        className="px-4 py-2 bg-navy text-white text-xs font-medium rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
                      >
                        J'ai reçu une réponse
                      </button>
                    )}
                    {d.demarche?.responseReceivedAt && !d.demarche?.montantRecupere && (
                      <button
                        onClick={() => {
                          const montant = prompt('Montant récupéré (€) :')
                          if (montant && !isNaN(Number(montant))) {
                            updateDemarche(d.id, 'montantRecupere', montant)
                          }
                        }}
                        disabled={updating === d.id}
                        className="px-4 py-2 bg-emerald text-navy text-xs font-bold rounded-lg hover:bg-emerald/90 transition-colors disabled:opacity-50"
                      >
                        💰 Déclarer le montant récupéré
                      </button>
                    )}
                  </div>

                  {/* Réponse */}
                  {d.demarche?.responseType && (
                    <p className="mt-3 text-xs text-slate-muted">
                      Réponse : <strong>{RESPONSE_LABELS[d.demarche.responseType] || d.demarche.responseType}</strong>
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
