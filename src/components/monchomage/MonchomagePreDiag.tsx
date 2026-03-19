'use client'
import type { MonchomagePreDiagResponse } from '@/lib/monchomage/types'
import { fmt } from '@/lib/format'

interface Props { result: MonchomagePreDiagResponse }

const SEVERITY_STYLES = {
  high: { bg: 'bg-red-50', border: 'border-red-200', icon: '🔴', text: 'text-red-700' },
  medium: { bg: 'bg-orange-50', border: 'border-orange-200', icon: '🟠', text: 'text-orange-700' },
  low: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '🟡', text: 'text-yellow-700' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'ℹ️', text: 'text-blue-700' },
}

export function MonchomagePreDiag({ result }: Props) {
  const { anomalies, totalAnomalies, sjrTheorique, ajTheorique, ajNotifiee, ecartJournalier, ecartMensuel, ecartTotal, dureeNotifiee, hasAnomalies, tropPercuRisque } = result

  return (
    <section id="resultat" className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">{hasAnomalies ? '⚠️' : '✅'}</div>
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text">
            {hasAnomalies
              ? `${totalAnomalies} anomalie${totalAnomalies > 1 ? 's' : ''} potentielle${totalAnomalies > 1 ? 's' : ''} détectée${totalAnomalies > 1 ? 's' : ''}`
              : 'Votre allocation semble correcte'
            }
          </h2>
        </div>

        {/* Carte comparaison */}
        <div className="bg-white rounded-2xl border border-slate-border p-6 sm:p-8 mb-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <p className="text-xs text-slate-muted mb-1">AJ notifiée (France Travail)</p>
              <p className="text-2xl font-bold text-slate-text">{fmt(ajNotifiee)}€</p>
              <p className="text-xs text-slate-muted">par jour</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-muted mb-1">AJ théorique (notre calcul)</p>
              <p className={`text-2xl font-bold ${ecartJournalier > 0 ? 'text-emerald' : ecartJournalier < -2 ? 'text-orange-500' : 'text-slate-text'}`}>{fmt(ajTheorique)}€</p>
              <p className="text-xs text-slate-muted">par jour</p>
            </div>
          </div>

          {ecartJournalier > 0.5 && (
            <>
              <div className="h-px bg-slate-border my-6" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-muted mb-1">Écart journalier</p>
                  <p className="text-xl font-bold text-red-500">+{fmt(ecartJournalier)}€</p>
                </div>
                <div>
                  <p className="text-xs text-slate-muted mb-1">Écart mensuel</p>
                  <p className="text-xl font-bold text-navy">+{fmt(ecartMensuel)}€</p>
                </div>
                <div>
                  <p className="text-xs text-slate-muted mb-1">Impact total ({dureeNotifiee}j)</p>
                  <p className="text-xl font-bold text-navy">+{fmt(ecartTotal)}€</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Anomalies */}
        {anomalies.length > 0 && (
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
                        {anomaly.impact > 0 && <span className="text-xs font-bold text-red-500 whitespace-nowrap">+{fmt(anomaly.impact)}€/j</span>}
                      </div>
                      <p className="text-xs text-slate-muted mt-1 leading-relaxed">{anomaly.detail}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Alerte trop-perçu */}
        {tropPercuRisque && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Information :</strong> Notre calcul théorique donne un montant inférieur à votre notification. Cela peut être normal si certaines primes ou éléments n&apos;ont pas été déclarés dans le formulaire. Le rapport complet permettra d&apos;analyser en détail.
            </p>
          </div>
        )}

        {/* Explication */}
        <div className="bg-navy/[0.03] rounded-xl border border-navy/10 p-4 mb-6">
          <p className="text-xs text-slate-muted leading-relaxed">
            <strong className="text-slate-text">Comment on calcule :</strong> SJR = Salaire de référence / Jours calendaires. AJ = max(40,4% × SJR + 13,18€, 57% × SJR), plafonnée à 75% du SJR.
            Ce calcul est théorique et basé sur vos déclarations. L&apos;écart réel dépend de vos bulletins de paie et de l&apos;attestation employeur.
          </p>
        </div>

        <p className="text-[10px] text-slate-muted text-center">
          Cette analyse est un outil d&apos;aide à la vérification. Elle ne constitue pas un avis juridique. Consultez France Travail ou un avocat pour confirmation.
        </p>
      </div>
    </section>
  )
}
