'use client'
import { useEffect } from 'react'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'
import type { MataxePreDiagResponse } from '@/lib/mataxe/types'
import { MataxeReliabilityMeter } from './MataxeReliabilityMeter'
import { MataxeTransparency } from './MataxeTransparency'

interface MataxePreDiagProps {
  result: MataxePreDiagResponse
}

const severityIcon = (severity: string) => {
  switch (severity) {
    case 'confirmed': return '✅'
    case 'probable': return '⚠️'
    default: return '🔍'
  }
}

const severityLabel = (severity: string) => {
  switch (severity) {
    case 'confirmed': return 'Confirmée'
    case 'probable': return 'Probable'
    default: return 'À vérifier'
  }
}

const confidenceColor = (c: number) => {
  if (c >= 80) return 'bg-emerald'
  if (c >= 60) return 'bg-yellow-400'
  if (c >= 40) return 'bg-amber-400'
  return 'bg-red-400'
}

const riskColors = {
  low: { bg: 'bg-emerald/10', text: 'text-emerald-dark', label: 'Faible' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Moyen' },
  high: { bg: 'bg-red-50', text: 'text-red-700', label: 'Élevé' },
}

export function MataxePreDiag({ result }: MataxePreDiagProps) {
  const risk = riskColors[result.riskLevel]
  const calc = result.calculations
  const rel = result.reliability

  useEffect(() => {
    track({
      event: 'prediag_generated',
      brique: 'mataxe',
      anomalies_count: result.anomaliesCount,
      impact_4years: result.impact4Years,
      reliability_level: rel?.level || 'unknown',
      reliability_score: rel?.score || 0,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePrint = () => {
    track({ event: 'prediag_printed', brique: 'mataxe' })
    window.print()
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[700px] mx-auto px-6">
        {/* Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/10 text-emerald text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-emerald rounded-full animate-pulse-dot" />
            Pré-diagnostic terminé
          </div>
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text">
            Résultat de votre analyse
          </h2>
        </div>

        {/* BAROMÈTRE DE FIABILITÉ — en premier */}
        {rel && (
          <div className="mb-6">
            <MataxeReliabilityMeter
              score={rel.score}
              level={rel.level}
              label={rel.label}
              nextStep={rel.nextStep}
              nextStepGain={rel.nextStepGain}
            />
          </div>
        )}

        {/* Card principale */}
        <div className="bg-slate-bg rounded-2xl border border-slate-border p-8 mb-6">
          {/* Stats en haut */}
          <div className="flex items-center justify-between gap-6 flex-wrap mb-6">
            <div>
              <div className="text-sm text-slate-muted font-medium mb-1">Anomalies détectées</div>
              <div className="font-heading text-[48px] font-extrabold text-slate-text leading-none">
                {result.anomaliesCount}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-muted font-medium mb-1">Impact annuel estimé</div>
              <div className="font-heading text-[36px] font-extrabold text-emerald leading-none">
                {result.impactAnnualMin === result.impactAnnualMax
                  ? `~${fmt(result.impactAnnualMax)}€/an`
                  : `${fmt(result.impactAnnualMin)}–${fmt(result.impactAnnualMax)}€/an`
                }
              </div>
            </div>
          </div>

          {/* Impact 4 ans */}
          <div className="bg-navy/[0.04] rounded-xl p-6 mb-6 text-center">
            <div className="text-sm text-slate-muted font-medium mb-2">Remboursement potentiel sur 4 ans (rétroactif)</div>
            <div className="font-heading text-[56px] font-extrabold text-emerald leading-none mb-2">
              ~{fmt(result.impact4Years)}€
            </div>
            {rel && (
              <div className="text-xs text-slate-muted mt-1">
                Estimation à {rel.score}% de fiabilité ({rel.label.toLowerCase()})
              </div>
            )}
          </div>

          {/* Taux réel si disponible */}
          {calc.baseNetteDisponible && calc.tauxReelCommune && (
            <div className="bg-emerald/5 rounded-xl p-4 border border-emerald/20 mb-6">
              <div className="text-xs font-semibold text-emerald uppercase tracking-wider mb-2">Données confirmées grâce à votre base nette</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-slate-muted text-xs">Taux réel commune</div>
                  <div className="font-bold text-slate-text">{(calc.tauxReelCommune * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-slate-muted text-xs">VLC administration</div>
                  <div className="font-bold text-slate-text">{fmt(calc.vlcAdminDeduite || 0)}€</div>
                </div>
                <div>
                  <div className="text-slate-muted text-xs">Écart VLC</div>
                  <div className="font-bold text-red-600">{calc.ecartVlcPrecis && calc.ecartVlcPrecis > 0 ? '+' : ''}{calc.ecartVlcPrecis}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Niveau de risque */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${risk.bg} ${risk.text} text-sm font-semibold mb-6`}>
            Niveau de risque d&apos;erreur : {risk.label}
          </div>

          {/* Exonération */}
          {calc.exonerationMotif && (
            <div className="bg-emerald/5 rounded-xl p-4 border border-emerald/20 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-lg">✨</span>
                <div>
                  <div className="font-semibold text-sm text-emerald-dark mb-1">Exonération potentielle détectée</div>
                  <div className="text-sm text-slate-muted">{calc.exonerationMotif}</div>
                </div>
              </div>
            </div>
          )}

          {/* Liste anomalies avec CONFIANCE */}
          {result.anomalies.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-2">Anomalies détectées</div>
              {result.anomalies.map((anomaly, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-slate-border">
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{severityIcon(anomaly.severity)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-slate-text text-sm">{anomaly.title}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-bg text-slate-muted">{severityLabel(anomaly.severity)}</span>
                      </div>
                      <div className="text-slate-muted text-sm mb-2">{anomaly.summary}</div>

                      {/* Barre de confiance */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-slate-muted font-medium">Confiance :</span>
                        <div className="flex-1 max-w-[120px] h-1.5 bg-slate-bg rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${confidenceColor(anomaly.confidence || 50)}`} style={{ width: `${anomaly.confidence || 50}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-text">{anomaly.confidence || 50}%</span>
                      </div>

                      {/* Ce qui permettrait de confirmer */}
                      {anomaly.confirmableWith && (
                        <div className="text-[10px] text-slate-muted italic">
                          → Confirmable avec : {anomaly.confirmableWith}
                        </div>
                      )}
                    </div>
                    {anomaly.impactAnnualMax > 0 && (
                      <div className="font-heading font-bold text-emerald text-sm whitespace-nowrap">
                        +{fmt(anomaly.impactAnnualMax)}€/an
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.anomalies.length === 0 && (
            <div className="text-center p-6 bg-emerald/5 rounded-xl">
              <span className="text-2xl mb-2 block">✅</span>
              <p className="text-sm text-slate-text font-semibold">Aucune anomalie majeure détectée</p>
              <p className="text-xs text-slate-muted mt-1">{result.recommendation}</p>
            </div>
          )}
        </div>

        {/* TRANSPARENCE — Ce qu'on sait vs ce qu'on ne sait pas */}
        {rel && (
          <div className="mb-6">
            <MataxeTransparency
              whatWeKnow={rel.whatWeKnow}
              whatWeDontKnow={rel.whatWeDontKnow}
            />
          </div>
        )}

        {/* Recommandation */}
        {result.anomalies.length > 0 && (
          <div className="bg-navy/[0.03] rounded-xl p-5 border border-slate-border">
            <div className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-2">Recommandation</div>
            <p className="text-sm text-slate-text leading-relaxed">{result.recommendation}</p>
          </div>
        )}

        {/* Actions : imprimer / partager */}
        <div className="flex items-center justify-center gap-3 mt-6 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-bg border border-slate-border text-slate-muted hover:text-slate-text hover:bg-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer le résultat
          </button>
          <button
            onClick={() => {
              const url = window.location.href
              navigator.clipboard.writeText(url)
              alert('Lien copié dans le presse-papier !')
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-bg border border-slate-border text-slate-muted hover:text-slate-text hover:bg-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Partager
          </button>
        </div>
      </div>
    </section>
  )
}
