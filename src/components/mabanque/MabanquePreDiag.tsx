'use client'
import type { MabanquePreDiagResponse } from '@/lib/mabanque/types'
import { fmt } from '@/lib/format'

interface Props {
  result: MabanquePreDiagResponse
}

const SEVERITY_STYLES = {
  high: { bg: 'bg-red-50', border: 'border-red-200', icon: '🔴', text: 'text-red-700' },
  medium: { bg: 'bg-orange-50', border: 'border-orange-200', icon: '🟠', text: 'text-orange-700' },
  low: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '🟡', text: 'text-yellow-700' },
}

export function MabanquePreDiag({ result }: Props) {
  const { anomalies, totalAnomalies, tropPercuMensuel, tropPercuAnnuel, tropPercu5ans, isFragileEligible, isFragileApplied, banque } = result
  const hasAnomalies = totalAnomalies > 0

  return (
    <section id="resultat" className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">{hasAnomalies ? '⚠️' : '✅'}</div>
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text">
            {hasAnomalies
              ? `${totalAnomalies} anomalie${totalAnomalies > 1 ? 's' : ''} détectée${totalAnomalies > 1 ? 's' : ''}`
              : 'Aucune anomalie détectée'
            }
          </h2>
          {hasAnomalies && (
            <p className="text-slate-muted text-sm mt-1">
              Banque : <strong>{banque}</strong>
            </p>
          )}
        </div>

        {/* Carte trop-perçu */}
        {hasAnomalies && (
          <div className="bg-white rounded-2xl border border-slate-border p-6 sm:p-8 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-muted mb-1">Trop-perçu mensuel</p>
                <p className="text-2xl font-bold text-red-500">{fmt(tropPercuMensuel)}€</p>
              </div>
              <div>
                <p className="text-xs text-slate-muted mb-1">Trop-perçu annuel</p>
                <p className="text-2xl font-bold text-navy">{fmt(tropPercuAnnuel)}€</p>
              </div>
              <div>
                <p className="text-xs text-slate-muted mb-1">Sur 5 ans</p>
                <p className="text-2xl font-bold text-navy">{fmt(tropPercu5ans)}€</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des anomalies */}
        {hasAnomalies && (
          <div className="space-y-3 mb-6">
            {anomalies.map((anomaly, i) => {
              const style = SEVERITY_STYLES[anomaly.severity]
              return (
                <div key={i} className={`${style.bg} ${style.border} border rounded-xl p-4`}>
                  <div className="flex items-start gap-3">
                    <span className="text-sm mt-0.5">{style.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-semibold ${style.text}`}>{anomaly.label}</h4>
                        {anomaly.montantExces > 0 && (
                          <span className="text-xs font-bold text-red-500 whitespace-nowrap">+{fmt(anomaly.montantExces)}€</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-muted mt-1 leading-relaxed">{anomaly.detail}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Alerte fragilité */}
        {isFragileEligible && !isFragileApplied && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-6">
            <p className="text-sm text-purple-800">
              <strong>⚡ Vous pourriez bénéficier du statut &quot;client fragile&quot;</strong> — Votre banque devrait plafonner vos frais à 25€/mois et vous proposer l&apos;offre spécifique à 3€/mois (plafond 200€/an).
            </p>
          </div>
        )}

        {/* Explication gratuite */}
        <div className="bg-navy/[0.03] rounded-xl border border-navy/10 p-4 mb-6">
          <p className="text-xs text-slate-muted leading-relaxed">
            <strong className="text-slate-text">Comment ça marche :</strong> Nous comparons vos frais aux plafonds légaux du Code monétaire et financier (art. R.312-4-1 et suivants).
            Les frais en excès sont potentiellement récupérables sur 5 ans (art. 2224 du Code civil).
            70% des médiations bancaires aboutissent en faveur du client.
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-slate-muted text-center">
          Cet outil vérifie la conformité de vos frais aux plafonds légaux. Il ne constitue pas un avis juridique. En cas de litige, consultez un professionnel.
        </p>
      </div>
    </section>
  )
}
