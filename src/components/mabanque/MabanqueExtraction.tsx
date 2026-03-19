'use client'
import type { MabanqueExtractionResult } from '@/lib/mabanque/extract-types'
import { fmt } from '@/lib/format'

interface Props {
  extraction: MabanqueExtractionResult
  onContinue: () => void
  onRestart: () => void
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  commission_intervention: { label: 'Commissions d\'intervention', icon: '🔴' },
  rejet_prelevement: { label: 'Rejets de prélèvement', icon: '🟠' },
  rejet_cheque: { label: 'Rejets de chèque', icon: '🟠' },
  agios: { label: 'Agios / intérêts débiteurs', icon: '🟡' },
  lettre_information: { label: 'Lettres d\'information', icon: '🟡' },
  frais_tenue_compte: { label: 'Frais de tenue de compte', icon: '⚪' },
  virement_instantane: { label: 'Virement instantané facturé', icon: '🔴' },
  frais_autre: { label: 'Autres frais', icon: '⚪' },
}

export function MabanqueExtraction({ extraction, onContinue, onRestart }: Props) {
  const { summary, fees, banqueDetectee, periodeDebut, periodeFin, warnings } = extraction

  // Grouper les frais par catégorie pour l'affichage
  const feesByCategory = fees.reduce((acc, fee) => {
    if (!acc[fee.category]) acc[fee.category] = []
    acc[fee.category].push(fee)
    return acc
  }, {} as Record<string, typeof fees>)

  return (
    <section className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🔍</div>
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-2">
            {fees.length} frais identifiés sur votre relevé
          </h2>
          {banqueDetectee && (
            <p className="text-slate-muted text-sm">
              Banque : <strong>{banqueDetectee}</strong>
              {periodeDebut && periodeFin && <> · Période : {periodeDebut} → {periodeFin}</>}
            </p>
          )}
        </div>

        {/* Résumé total */}
        <div className="bg-white rounded-2xl border border-slate-border p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-xs text-slate-muted mb-1">Total des frais détectés</p>
            <p className="text-3xl font-bold text-navy">{fmt(summary.totalFraisMois)}€</p>
          </div>

          {/* Détail par catégorie */}
          <div className="space-y-2">
            {Object.entries(feesByCategory).map(([cat, catFees]) => {
              const info = CATEGORY_LABELS[cat] || { label: cat, icon: '⚪' }
              const total = catFees.reduce((s, f) => s + f.amount, 0)
              return (
                <div key={cat} className="flex items-center justify-between py-2 border-b border-slate-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{info.icon}</span>
                    <span className="text-sm text-slate-text">{info.label}</span>
                    <span className="text-xs text-slate-muted">({catFees.length})</span>
                  </div>
                  <span className="text-sm font-bold text-slate-text">{fmt(total)}€</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Virement instantané = alerte illégal */}
        {summary.virementInstantaneFacture && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            <p className="text-sm text-red-700">
              <strong>🚨 Virement instantané facturé détecté</strong> — Les virements instantanés sont gratuits depuis le 9 janvier 2025. Cette facturation est illégale.
            </p>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
            {warnings.map((w, i) => (
              <p key={i} className="text-xs text-yellow-800">{w}</p>
            ))}
          </div>
        )}

        {/* Détail des frais (accordéon) */}
        <details className="mb-6">
          <summary className="text-sm text-emerald font-medium cursor-pointer hover:underline">
            Voir le détail des {fees.length} frais détectés
          </summary>
          <div className="mt-3 bg-white rounded-xl border border-slate-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-bg text-slate-muted">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Libellé</th>
                  <th className="px-3 py-2 text-right">Montant</th>
                  <th className="px-3 py-2 text-center">Fiabilité</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee, i) => (
                  <tr key={i} className="border-t border-slate-border/50">
                    <td className="px-3 py-2 text-slate-muted whitespace-nowrap">{fee.date}</td>
                    <td className="px-3 py-2 text-slate-text">{fee.label}</td>
                    <td className="px-3 py-2 text-right font-medium text-slate-text">{fmt(fee.amount)}€</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        fee.confidence === 'high' ? 'bg-emerald' : fee.confidence === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onContinue} className="cta-primary flex-1 justify-center">
            Lancer le diagnostic avec ces données →
          </button>
        </div>
        <div className="text-center mt-4">
          <button onClick={onRestart} className="text-sm text-slate-muted hover:text-slate-text underline transition-colors">
            Scanner un autre document
          </button>
        </div>
      </div>
    </section>
  )
}
