'use client'
import { fmt } from '@/lib/format'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'
import type { PreDiagnosticResponse } from '@/lib/macaution/types'

interface MacautionPreDiagProps {
  result: PreDiagnosticResponse
}

const severityIcon = (severity: string) => severity === 'confirmed' ? '✅' : '⚠️'
const riskColors = {
  low: { bg: 'bg-emerald/10', text: 'text-emerald-dark', label: 'Faible' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Moyen' },
  high: { bg: 'bg-red-50', text: 'text-red-700', label: 'Élevé' },
}

export function MacautionPreDiag({ result }: MacautionPreDiagProps) {
  useEffect(() => { track({ event: 'prediag_generated', brique: 'macaution', anomalies: result.anomaliesCount, amount: result.estimatedAmount }) }, [])
  const risk = riskColors[result.riskLevel]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        {/* Titre résultat */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/10 text-emerald text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-emerald rounded-full animate-pulse-dot" />
            Pré-diagnostic terminé
          </div>
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text">
            Résultat de votre analyse
          </h2>
        </div>

        {/* Card principale */}
        <div className="bg-slate-bg rounded-2xl border border-slate-border p-8 mb-6">
          {/* Stats en haut */}
          <div className="flex items-center justify-between gap-6 flex-wrap mb-8">
            <div>
              <div className="text-sm text-slate-muted font-medium mb-1">Anomalies détectées</div>
              <div className="font-heading text-[48px] font-extrabold text-slate-text leading-none">
                {result.anomaliesCount}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-muted font-medium mb-1">Montant potentiellement récupérable</div>
              <div className="font-heading text-[48px] font-extrabold text-emerald leading-none">
                ~{fmt(result.estimatedAmount)}€
              </div>
            </div>
          </div>

          {/* Niveau de risque */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${risk.bg} ${risk.text} text-sm font-semibold mb-6`}>
            Niveau d&apos;abus : {risk.label}
          </div>

          {/* Liste anomalies (teaser) */}
          <div className="space-y-3">
            {result.anomalies.map((anomaly, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-border">
                <span className="text-lg mt-0.5">{severityIcon(anomaly.severity)}</span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-text text-sm">{anomaly.title}</div>
                  <div className="text-slate-muted text-sm mt-1">{anomaly.summary}</div>
                </div>
                {anomaly.amount > 0 && (
                  <div className="font-heading font-bold text-emerald text-sm whitespace-nowrap">
                    +{fmt(anomaly.amount)}€
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ce que le rapport complet ajoute */}
        <div className="bg-navy/[0.03] rounded-2xl border border-navy/10 p-6 mb-6">
          <h3 className="font-heading font-bold text-slate-text text-base mb-4">
            🔒 Dans le rapport complet, vous obtiendrez :
          </h3>
          <ul className="space-y-2">
            {[
              'Le calcul détaillé de chaque anomalie',
              'La grille de vétusté appliquée poste par poste',
              'Les montants précis par poste de retenue',
              'Les références juridiques exactes (articles de loi)',
              'Le guide de procédure étape par étape',
              'Les courriers pré-remplis prêts à envoyer (offre 49€)',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-muted">
                <svg className="w-4 h-4 text-emerald flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommandation */}
        <div className="bg-emerald/5 border border-emerald/20 rounded-2xl p-6">
          <h3 className="font-heading font-bold text-slate-text text-base mb-2">💡 Notre recommandation</h3>
          <p className="text-sm text-slate-muted leading-relaxed">{result.recommendation}</p>
        </div>
      </div>
    </section>
  )
}
