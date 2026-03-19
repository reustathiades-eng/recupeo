"use client"
import { useDossier } from '@/lib/retraitia/DossierContext'
import Link from 'next/link'
import { fmt } from '@/lib/format'
import { trackEvent } from '@/lib/analytics'

const SCORE_CONFIG: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  BRONZE: { color: 'text-red-600', bg: 'bg-red-50', label: 'BRONZE', emoji: '\U0001F949' },
  ARGENT: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'ARGENT', emoji: '\U0001F948' },
  OR: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'OR', emoji: '\U0001F947' },
  PLATINE: { color: 'text-emerald', bg: 'bg-emerald/5', label: 'PLATINE', emoji: '\U0001F48E' },
}

const CONFIANCE_BADGE: Record<string, { bg: string; label: string }> = {
  CERTAIN: { bg: 'bg-emerald/10 text-emerald', label: '\U0001F7E2 Verifie' },
  HAUTE_CONFIANCE: { bg: 'bg-blue-50 text-blue-600', label: '\U0001F535 Calcule' },
  ESTIMATION: { bg: 'bg-amber-50 text-amber-600', label: '\U0001F7E1 Estime' },
}

export default function DiagnosticPage() {
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

  const diag = dossier.diagnostic as any
  if (!diag) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">\U0001F50D</div>
        <h1 className="font-heading text-xl font-bold text-slate-text mb-2">Diagnostic en attente</h1>
        <p className="text-sm text-slate-muted mb-4">
          Votre diagnostic se genere automatiquement des que vos documents obligatoires sont uploades et votre formulaire complete.
        </p>
        <Link href="/mon-espace/retraitia/documents" className="text-emerald text-sm font-medium hover:underline">
          Voir mes documents \u2192
        </Link>
      </div>
    )
  }

  const nbAnomalies = dossier.nbAnomalies || diag.anomalies?.length || 0
  const scoreGlobal = dossier.scoreGlobal || diag.scoreGlobal || 'OR'
  const score = SCORE_CONFIG[scoreGlobal] || SCORE_CONFIG.OR
  const impactMin = dossier.impactMensuelMin || diag.impactCumule?.mensuelMin || 0
  const impactMax = dossier.impactMensuelMax || diag.impactCumule?.mensuelMax || 0
  const impactPasseTotal = diag.impactCumule?.passeTotal || 0
  const impactFuturMin = diag.impactCumule?.futurMin || 0
  const impactFuturMax = diag.impactCumule?.futurMax || 0
  const precisionAudit = dossier.precisionAudit || diag.precisionAudit || 70
  const seuilGratuit = dossier.seuilGratuit || false
  const anomalies = diag.anomalies || []
  const typesAnomalies = anomalies.map((a: any) => a.label || a.id)
  const pack49Paid = dossier.pack49Paid || false

  // Seuil gratuit : rapport offert
  if (seuilGratuit) {
    return (
      <div>
        <div className="bg-emerald/5 border border-emerald/20 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">\u2705</span>
            <h2 className="font-heading text-lg font-bold text-slate-text">Bonne nouvelle</h2>
          </div>
          <p className="text-sm text-slate-muted mb-4">
            Votre pension semble globalement correcte. Nous avons detecte {nbAnomalies} point(s) mineur(s)
            avec un impact estime a moins de 30\u20AC/mois. <strong>Votre rapport est offert.</strong>
          </p>
          {anomalies.map((a: any) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-lg p-4 mb-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-slate-text text-sm">{a.label}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${CONFIANCE_BADGE[a.confidence || a.confiance]?.bg || ''}`}>
                  {CONFIANCE_BADGE[a.confidence || a.confiance]?.label || a.confidence || a.confiance}
                </span>
              </div>
              <p className="text-xs text-slate-muted">{a.detail}</p>
              <p className="text-xs text-emerald font-medium mt-1">
                Impact : {a.impact?.mensuelMin || 0}-{a.impact?.mensuelMax || 0}\u20AC/mois \u00B7 {a.organisme}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Diagnostic serre (pre-49)
  if (!pack49Paid) {
    return (
      <div>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className={`${score.bg} px-6 py-5 text-center`}>
            <p className="text-xs text-slate-muted mb-1 uppercase tracking-wider">Score de fiabilite de votre dossier</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{score.emoji}</span>
              <span className={`font-heading text-3xl font-extrabold ${score.color}`}>{score.label}</span>
            </div>
            <p className="text-sm text-slate-muted mt-1">{nbAnomalies} anomalies detectees</p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-slate-muted">Precision de l'audit</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald rounded-full" style={{ width: `${precisionAudit}%` }} />
                </div>
                <span className="text-xs font-medium text-slate-text">{precisionAudit}%</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 mb-6">
              <h3 className="text-xs text-slate-muted uppercase tracking-wider mb-3">Impact estime</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-muted">Manque a gagner mensuel</p>
                  <p className="font-heading text-xl font-bold text-red-600">
                    entre {fmt(impactMin)} et {fmt(impactMax)}\u20AC/mois
                  </p>
                </div>
                {impactPasseTotal > 0 && (
                  <div>
                    <p className="text-xs text-slate-muted">Deja perdu depuis votre depart</p>
                    <p className="font-heading text-lg font-bold text-slate-text">~{fmt(impactPasseTotal)}\u20AC</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-muted">Manque a gagner futur si rien ne change</p>
                  <p className="font-heading text-lg font-bold text-slate-text">
                    entre {fmt(impactFuturMin)} et {fmt(impactFuturMax)}\u20AC
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs text-slate-muted uppercase tracking-wider mb-3">Anomalies detectees</h3>
              <div className="space-y-2">
                {typesAnomalies.map((label: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-text">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    {label}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-muted mt-3 italic">
                \u2192 Montants exacts et details reserves au rapport complet
              </p>
            </div>

            <div className="bg-[#060D1B] rounded-xl p-5 text-center">
              <button
                onClick={() => {
                  trackEvent('retraitia_diagnostic_to_49', { nbAnomalies, scoreGlobal })
                  window.location.href = `/retraitia/checkout?pack=action_49&dossierId=${dossier.id}`
                }}
                className="w-full bg-emerald text-[#060D1B] font-bold text-base py-4 rounded-xl hover:bg-emerald-light transition-colors"
              >
                Obtenir mon rapport complet \u2014 40\u20AC
              </button>
              <p className="text-white/40 text-xs mt-2">9\u20AC deja deduits de votre Pack Dossier</p>
              <div className="mt-4 text-left text-white/60 text-xs space-y-1">
                <p>\u2713 Montant exact de chaque anomalie</p>
                <p>\u2713 Recalcul detaille de votre pension</p>
                <p>\u2713 Messages prets a envoyer a chaque organisme</p>
                <p>\u2713 Suivi complet de vos demarches</p>
                <p>\u2713 1er envoi recommande inclus si necessaire</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Rapport interactif (post-49)
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-xl font-bold text-slate-text">Votre rapport detaille</h1>
        <Link href="/mon-espace/retraitia/rapport" className="text-sm text-emerald font-medium hover:underline">
          Telecharger le PDF
        </Link>
      </div>

      <div className={`${score.bg} border ${score.color.replace('text-', 'border-')}/20 rounded-xl p-5 mb-6`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{score.emoji}</span>
          <div>
            <p className="font-heading font-bold text-slate-text">Score {score.label}</p>
            <p className="text-sm text-slate-muted">{nbAnomalies} anomalies \u00B7 Precision {precisionAudit}%</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-center">
          <div className="bg-white/80 rounded-lg p-3">
            <p className="text-xs text-slate-muted">Impact mensuel</p>
            <p className="font-heading font-bold text-red-600">{fmt(impactMin)}-{fmt(impactMax)}\u20AC</p>
          </div>
          <div className="bg-white/80 rounded-lg p-3">
            <p className="text-xs text-slate-muted">Deja perdu</p>
            <p className="font-heading font-bold text-slate-text">~{fmt(impactPasseTotal)}\u20AC</p>
          </div>
          <div className="bg-white/80 rounded-lg p-3">
            <p className="text-xs text-slate-muted">Impact futur</p>
            <p className="font-heading font-bold text-slate-text">~{fmt(impactFuturMax)}\u20AC</p>
          </div>
        </div>
      </div>

      <h2 className="font-heading font-bold text-slate-text mb-3">Anomalies detectees</h2>
      <div className="space-y-3 mb-6">
        {anomalies.map((a: any, i: number) => (
          <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-muted">#{i + 1}</span>
                <h3 className="font-medium text-slate-text">{a.label}</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${CONFIANCE_BADGE[a.confidence || a.confiance]?.bg || ''}`}>
                {CONFIANCE_BADGE[a.confidence || a.confiance]?.label || a.confidence || a.confiance}
              </span>
            </div>
            <p className="text-sm text-slate-muted mb-2">{a.detail}</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="text-red-600 font-semibold">
                {a.impact?.mensuelMin || 0}-{a.impact?.mensuelMax || 0}\u20AC/mois
              </span>
              <span className="text-slate-muted">\u2192 {a.organisme}</span>
              <span className="text-slate-muted">{a.delaiEstime}</span>
            </div>
            {a.crossSell && (
              <div className="mt-2 bg-blue-50 text-blue-700 text-xs rounded-lg px-3 py-1.5 inline-block">
                Verifier avec {String(a.crossSell).toUpperCase()}
              </div>
            )}
          </div>
        ))}
      </div>

      <Link href="/mon-espace/retraitia/demarches" className="cta-primary !py-3 !px-8 inline-block">
        Commencer mes demarches \u2192
      </Link>
    </div>
  )
}
