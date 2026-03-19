'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fmt } from '@/lib/format'
import { trackEvent } from '@/lib/analytics'

interface DiagnosticSerre {
  nbAnomalies: number
  scoreGlobal: string
  impactMensuel: { min: number; max: number }
  impactCumulePasseTotal: number
  impactCumuleFuturTotal: { min: number; max: number }
  precisionAudit: number
  seuilGratuit: boolean
  nbParNiveau: Record<string, number>
  typesAnomalies: string[]
  // Post-49 : anomalies detaillees
  anomalies?: Array<{
    id: string; label: string; description: string; detail: string
    confiance: string; impactMensuel: { min: number; max: number }
    organisme: string; faciliteCorrection: string; delaiEstime: string
    score: number; crossSell?: string
  }>
}

const SCORE_CONFIG: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  BRONZE: { color: 'text-red-600', bg: 'bg-red-50', label: 'BRONZE', emoji: '🥉' },
  ARGENT: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'ARGENT', emoji: '🥈' },
  OR: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'OR', emoji: '🥇' },
  PLATINE: { color: 'text-emerald', bg: 'bg-emerald/5', label: 'PLATINE', emoji: '💎' },
}

const CONFIANCE_BADGE: Record<string, { bg: string; label: string }> = {
  CERTAIN: { bg: 'bg-emerald/10 text-emerald', label: '🟢 Verifie' },
  HAUTE_CONFIANCE: { bg: 'bg-blue-50 text-blue-600', label: '🔵 Calcule' },
  ESTIMATION: { bg: 'bg-amber-50 text-amber-600', label: '🟡 Estime' },
}

export default function DiagnosticPage() {
  const [data, setData] = useState<DiagnosticSerre | null>(null)
  const [loading, setLoading] = useState(true)
  const [pack49Paid, setPack49Paid] = useState(false)

  useEffect(() => {
    // TODO: fetch from /api/retraitia/diagnostic-serre/:dossierId
    // For now, show placeholder
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="font-heading text-xl font-bold text-slate-text mb-2">Diagnostic en attente</h1>
        <p className="text-sm text-slate-muted mb-4">
          Votre diagnostic se genere automatiquement des que vos documents obligatoires sont uploades
          et votre formulaire complete.
        </p>
        <Link href="/mon-espace/retraitia/documents" className="text-emerald text-sm font-medium hover:underline">
          Voir mes documents →
        </Link>
      </div>
    )
  }

  const score = SCORE_CONFIG[data.scoreGlobal] || SCORE_CONFIG.OR

  // ── Seuil gratuit : rapport offert ──
  if (data.seuilGratuit) {
    return (
      <div>
        <div className="bg-emerald/5 border border-emerald/20 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">✅</span>
            <h2 className="font-heading text-lg font-bold text-slate-text">Bonne nouvelle</h2>
          </div>
          <p className="text-sm text-slate-muted mb-4">
            Votre pension semble globalement correcte. Nous avons detecte {data.nbAnomalies} point(s) mineur(s)
            avec un impact estime a moins de 30EUR/mois. <strong>Votre rapport est offert.</strong>
          </p>
          {/* Afficher le rapport complet gratuitement */}
          {data.anomalies && data.anomalies.map(a => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-lg p-4 mb-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-slate-text text-sm">{a.label}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${CONFIANCE_BADGE[a.confiance]?.bg || ''}`}>
                  {CONFIANCE_BADGE[a.confiance]?.label || a.confiance}
                </span>
              </div>
              <p className="text-xs text-slate-muted">{a.detail}</p>
              <p className="text-xs text-emerald font-medium mt-1">
                Impact : {a.impactMensuel.min}-{a.impactMensuel.max}EUR/mois · {a.organisme}
              </p>
            </div>
          ))}
        </div>
        {/* Cross-sell */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <p className="text-sm font-medium text-slate-text mb-2">💡 Opportunites detectees</p>
          <p className="text-xs text-slate-muted">
            Verifiez votre taxe fonciere avec MATAXE et optimisez votre declaration avec MONIMPOT.
          </p>
        </div>
      </div>
    )
  }

  // ── Diagnostic serre (pre-49EUR) ──
  if (!pack49Paid) {
    return (
      <div>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Header score */}
          <div className={`${score.bg} px-6 py-5 text-center`}>
            <p className="text-xs text-slate-muted mb-1 uppercase tracking-wider">Score de fiabilite de votre dossier</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{score.emoji}</span>
              <span className={`font-heading text-3xl font-extrabold ${score.color}`}>{score.label}</span>
            </div>
            <p className="text-sm text-slate-muted mt-1">
              {data.nbAnomalies} anomalies detectees
            </p>
          </div>

          <div className="p-6">
            {/* Precision */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-slate-muted">Precision de l'audit</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald rounded-full" style={{ width: `${data.precisionAudit}%` }} />
                </div>
                <span className="text-xs font-medium text-slate-text">{data.precisionAudit}%</span>
              </div>
            </div>

            {/* Impact */}
            <div className="bg-slate-50 rounded-xl p-5 mb-6">
              <h3 className="text-xs text-slate-muted uppercase tracking-wider mb-3">💰 Impact estime</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-muted">Manque a gagner mensuel</p>
                  <p className="font-heading text-xl font-bold text-red-600">
                    entre {fmt(data.impactMensuel.min)} et {fmt(data.impactMensuel.max)}EUR/mois
                  </p>
                </div>
                {data.impactCumulePasseTotal > 0 && (
                  <div>
                    <p className="text-xs text-slate-muted">Deja perdu depuis votre depart</p>
                    <p className="font-heading text-lg font-bold text-slate-text">
                      ~{fmt(data.impactCumulePasseTotal)}EUR
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-muted">Manque a gagner futur si rien ne change</p>
                  <p className="font-heading text-lg font-bold text-slate-text">
                    entre {fmt(data.impactCumuleFuturTotal.min)} et {fmt(data.impactCumuleFuturTotal.max)}EUR
                  </p>
                </div>
              </div>
            </div>

            {/* Types d'anomalies (sans detail) */}
            <div className="mb-6">
              <h3 className="text-xs text-slate-muted uppercase tracking-wider mb-3">📋 Anomalies detectees</h3>
              <div className="space-y-2">
                {data.typesAnomalies.map((label, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-text">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    {label}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-muted mt-3 italic">
                → Montants exacts et details reserves au rapport complet
              </p>
            </div>

            {/* CTA 49EUR */}
            <div className="bg-[#060D1B] rounded-xl p-5 text-center">
              <button
                onClick={() => {
                  trackEvent('retraitia_diagnostic_to_49', { nbAnomalies: data.nbAnomalies, scoreGlobal: data.scoreGlobal })
                  // TODO: redirect to checkout
                }}
                className="w-full bg-emerald text-[#060D1B] font-bold text-base py-4 rounded-xl hover:bg-emerald-light transition-colors"
              >
                🔓 Obtenir mon rapport complet — 40EUR
              </button>
              <p className="text-white/40 text-xs mt-2">9EUR deja deduits de votre Pack Dossier</p>
              <div className="mt-4 text-left text-white/60 text-xs space-y-1">
                <p>✓ Montant exact de chaque anomalie</p>
                <p>✓ Recalcul detaille de votre pension</p>
                <p>✓ Messages prets a envoyer a chaque organisme</p>
                <p>✓ Suivi complet de vos demarches</p>
                <p>✓ 1er envoi recommande inclus si necessaire</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Rapport interactif (post-49EUR) ──
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-xl font-bold text-slate-text">Votre rapport detaille</h1>
        <Link
          href="/mon-espace/retraitia/rapport"
          className="text-sm text-emerald font-medium hover:underline"
        >
          📄 Telecharger le PDF
        </Link>
      </div>

      {/* Resume executif */}
      <div className={`${score.bg} border ${score.color.replace('text-', 'border-')}/20 rounded-xl p-5 mb-6`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{score.emoji}</span>
          <div>
            <p className="font-heading font-bold text-slate-text">Score {score.label}</p>
            <p className="text-sm text-slate-muted">{data.nbAnomalies} anomalies · Precision {data.precisionAudit}%</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-center">
          <div className="bg-white/80 rounded-lg p-3">
            <p className="text-xs text-slate-muted">Impact mensuel</p>
            <p className="font-heading font-bold text-red-600">{fmt(data.impactMensuel.min)}-{fmt(data.impactMensuel.max)}EUR</p>
          </div>
          <div className="bg-white/80 rounded-lg p-3">
            <p className="text-xs text-slate-muted">Deja perdu</p>
            <p className="font-heading font-bold text-slate-text">~{fmt(data.impactCumulePasseTotal)}EUR</p>
          </div>
          <div className="bg-white/80 rounded-lg p-3">
            <p className="text-xs text-slate-muted">Impact futur</p>
            <p className="font-heading font-bold text-slate-text">~{fmt(data.impactCumuleFuturTotal.max)}EUR</p>
          </div>
        </div>
      </div>

      {/* Anomalies detaillees */}
      <h2 className="font-heading font-bold text-slate-text mb-3">Anomalies detectees</h2>
      <div className="space-y-3 mb-6">
        {data.anomalies?.map((a, i) => (
          <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-muted">#{i + 1}</span>
                <h3 className="font-medium text-slate-text">{a.label}</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${CONFIANCE_BADGE[a.confiance]?.bg || ''}`}>
                {CONFIANCE_BADGE[a.confiance]?.label || a.confiance}
              </span>
            </div>
            <p className="text-sm text-slate-muted mb-2">{a.detail}</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="text-red-600 font-semibold">
                {a.impactMensuel.min}-{a.impactMensuel.max}EUR/mois
              </span>
              <span className="text-slate-muted">→ {a.organisme}</span>
              <span className="text-slate-muted">⏱ {a.delaiEstime}</span>
            </div>
            {a.crossSell && (
              <div className="mt-2 bg-blue-50 text-blue-700 text-xs rounded-lg px-3 py-1.5 inline-block">
                💡 Verifier avec {a.crossSell.toUpperCase()}
              </div>
            )}
          </div>
        ))}
      </div>

      <Link
        href="/mon-espace/retraitia/demarches"
        className="cta-primary !py-3 !px-8 inline-block"
      >
        Commencer mes demarches →
      </Link>
    </div>
  )
}
