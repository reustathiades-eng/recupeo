'use client'
import { useEffect } from 'react'
import type { Anomaly, AnomalySeverity } from '@/lib/mapaie/types'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'

export interface MapaiePreDiagResult {
  diagnosticId: string
  anomalies: Anomaly[]
  totalAnomalies: number
  rappelMensuelEstime: number
  rappelTotalBrut: number
  rappelTotalNet: number
  moisConcernes: number
  periodeAudit: 'THREE_MONTHS' | 'TWELVE_MONTHS'
  conventionCollective: string
}

interface Props { result: MapaiePreDiagResult; onContinue: () => void }

const SEV: Record<AnomalySeverity, { bg: string; border: string; icon: string; text: string }> = {
  CRITIQUE: { bg: 'bg-red-50',    border: 'border-red-200',    icon: '🔴', text: 'text-red-700' },
  MAJEURE:  { bg: 'bg-orange-50', border: 'border-orange-200', icon: '🟠', text: 'text-orange-700' },
  MINEURE:  { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '🟡', text: 'text-yellow-700' },
}

function computeScore(anomalies: Anomaly[]): number {
  const pts = anomalies.reduce((s, a) => s + (a.severity === 'CRITIQUE' ? 3 : a.severity === 'MAJEURE' ? 2 : 1), 0)
  return Math.round((pts / Math.max(anomalies.length * 3, 1)) * 100)
}

export function MapaiePreDiag({ result, onContinue }: Props) {
  const { anomalies, totalAnomalies, rappelMensuelEstime, rappelTotalBrut, rappelTotalNet, moisConcernes } = result
  const hasAnomalies = totalAnomalies > 0
  const score = hasAnomalies ? computeScore(anomalies) : 0
  const scoreLabel = score >= 70 ? 'Risque élevé' : score >= 40 ? 'Risque modéré' : 'Risque faible'
  const scoreColor = score >= 70 ? 'text-red-600' : score >= 40 ? 'text-orange-500' : 'text-emerald-500'

  useEffect(() => { track({ event: 'mapaie_paywall_viewed', brique: 'mapaie' }) }, [])

  return (
    <section id="prediag" className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">{hasAnomalies ? '⚠️' : '✅'}</div>
          <h2 className="font-heading text-[clamp(22px,3.5vw,30px)] font-bold text-slate-text">
            {hasAnomalies
              ? `${totalAnomalies} anomalie${totalAnomalies > 1 ? 's' : ''} détectée${totalAnomalies > 1 ? 's' : ''} sur votre paie`
              : 'Aucune anomalie détectée'}
          </h2>
          {hasAnomalies && <p className="text-slate-muted mt-2 text-sm">On a trouvé ce qu&apos;on cherchait. Voici ce que votre employeur vous doit.</p>}
        </div>

        {hasAnomalies && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div><p className="text-xs text-slate-muted mb-1">Par mois</p><p className="text-2xl font-bold text-red-500">+{fmt(rappelMensuelEstime)}€</p></div>
            <div><p className="text-xs text-slate-muted mb-1">Rappel brut</p><p className="text-2xl font-bold text-navy">{fmt(rappelTotalBrut)}€</p></div>
            <div><p className="text-xs text-slate-muted mb-1">Rappel net</p><p className="text-2xl font-bold text-navy">{fmt(rappelTotalNet)}€</p></div>
            <div><p className="text-xs text-slate-muted mb-1">Mois analysés</p><p className="text-2xl font-bold text-slate-text">{moisConcernes}</p></div>
          </div>
        )}

        {hasAnomalies && (
          <div className="flex items-center justify-between bg-navy/[0.04] rounded-xl border border-navy/10 px-5 py-3 mb-5">
            <span className="text-sm font-medium text-slate-text">Score de risque</span>
            <span className={`text-sm font-bold ${scoreColor}`}>{scoreLabel} — {score}/100</span>
          </div>
        )}

        {hasAnomalies && (
          <div className="space-y-3 mb-6">
            {anomalies.map((a, i) => {
              const s = SEV[a.severity]
              return (
                <div key={i} className={`${s.bg} ${s.border} border rounded-xl p-4 flex items-start gap-3`}>
                  <span className="text-sm mt-0.5">{s.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-semibold ${s.text}`}>{a.titre}</h4>
                      {a.calculation?.montantMensuel > 0 && (
                        <span className="text-xs font-bold text-red-500 whitespace-nowrap">+{fmt(a.calculation.montantMensuel)}€/mois</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-muted mt-1 leading-relaxed">{a.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button onClick={onContinue} className="w-full bg-emerald-500 hover:bg-emerald-400 text-navy font-bold py-4 rounded-2xl text-base transition-colors mb-4">
          {hasAnomalies ? 'Voir le rapport complet et réclamer →' : 'Obtenir une analyse approfondie →'}
        </button>
        <p className="text-[10px] text-slate-muted text-center">Estimation indicative, sans valeur juridique.</p>
      </div>
    </section>
  )
}
