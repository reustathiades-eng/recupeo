'use client'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'
import { fmt } from '@/lib/format'
import type { MonloyerCheckResult } from '@/lib/monloyer/types'

interface Props {
  result: MonloyerCheckResult
  diagnosticId: string
}

export function MonloyerResult({ result, diagnosticId }: Props) {
  useEffect(() => { track({ event: 'check_completed', brique: 'monloyer', status: result.status, overpayment: result.excessMonthly }) }, [])
  const isConforme = result.status === 'conforme'
  const isDepassement = result.status === 'depassement'
  const isComplement = result.status === 'complement_abusif'

  return (
    <section id="resultat" className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">

        {/* ─── CONFORME ─── */}
        {isConforme && (
          <div className="bg-white rounded-2xl border border-emerald/30 p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center text-3xl mx-auto mb-4">&#9989;</div>
              <h2 className="font-heading text-2xl font-bold text-slate-text">Votre loyer est conforme</h2>
              <p className="text-slate-muted text-sm mt-2">
                Votre loyer hors charges de <strong>{fmt(result.currentRent)}&nbsp;&euro;</strong> est inférieur au plafond légal de <strong>{fmt(result.referenceRentMajore)}&nbsp;&euro;</strong>.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-bg rounded-xl p-4 text-center">
                <div className="text-xs text-slate-muted mb-1">Votre loyer HC</div>
                <div className="font-heading text-2xl font-bold text-slate-text">{fmt(result.currentRent)}&nbsp;&euro;</div>
              </div>
              <div className="bg-emerald/5 rounded-xl p-4 text-center border border-emerald/20">
                <div className="text-xs text-slate-muted mb-1">Plafond légal (ref. majoré)</div>
                <div className="font-heading text-2xl font-bold text-emerald">{fmt(result.referenceRentMajore)}&nbsp;&euro;</div>
              </div>
            </div>

            {/* Cross-sell */}
            <div className="space-y-3">
              <div className="bg-navy/5 rounded-xl p-4 flex items-center gap-4">
                <span className="text-2xl">🏠</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-text font-semibold">Vous êtes propriétaire ?</p>
                  <p className="text-xs text-slate-muted">40% des avis de taxe foncière contiennent une erreur.</p>
                </div>
                <a href="/mataxe" className="text-xs font-semibold text-emerald hover:text-emerald-dark whitespace-nowrap">Vérifier →</a>
              </div>
              <div className="bg-navy/5 rounded-xl p-4 flex items-center gap-4">
                <span className="text-2xl">🏦</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-text font-semibold">Vous payez un dépôt de garantie ?</p>
                  <p className="text-xs text-slate-muted">50% des dépôts ne sont pas restitués dans les délais.</p>
                </div>
                <a href="/macaution" className="text-xs font-semibold text-emerald hover:text-emerald-dark whitespace-nowrap">Vérifier →</a>
              </div>
            </div>
          </div>
        )}

        {/* ─── DÉPASSEMENT ─── */}
        {isDepassement && (
          <div className="bg-white rounded-2xl border border-red-200 p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl mx-auto mb-4">&#9888;</div>
              <h2 className="font-heading text-2xl font-bold text-slate-text">Dépassement détecté</h2>
              <p className="text-slate-muted text-sm mt-2">
                Votre loyer dépasse le plafond légal de <strong className="text-red-600">{fmt(result.excessMonthly)}&nbsp;&euro;/mois</strong>
              </p>
            </div>

            {/* Montants */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-bg rounded-xl p-4 text-center">
                <div className="text-xs text-slate-muted mb-1">Votre loyer HC</div>
                <div className="font-heading text-xl font-bold text-slate-text">{fmt(result.currentRent)}&nbsp;&euro;</div>
              </div>
              <div className="bg-emerald/5 rounded-xl p-4 text-center border border-emerald/20">
                <div className="text-xs text-slate-muted mb-1">Plafond légal</div>
                <div className="font-heading text-xl font-bold text-emerald">{fmt(result.referenceRentMajore)}&nbsp;&euro;</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                <div className="text-xs text-red-500 mb-1">Trop-perçu mensuel</div>
                <div className="font-heading text-xl font-bold text-red-600">+{fmt(result.excessMonthly)}&nbsp;&euro;</div>
              </div>
            </div>

            {/* Total récupérable */}
            <div className="bg-emerald/5 rounded-xl p-6 text-center border border-emerald/20 mb-6">
              <div className="text-sm text-slate-muted mb-1">Montant total récupérable</div>
              <div className="font-heading text-[clamp(32px,5vw,48px)] font-extrabold text-emerald">{fmt(result.totalRecoverable)}&nbsp;&euro;</div>
              <div className="text-xs text-slate-muted mt-1">
                {fmt(result.excessMonthly)}&nbsp;&euro; &times; {result.maxRecoverableMonths} mois
                {result.maxRecoverableMonths < result.monthsSinceBail && ' (prescription 3 ans)'}
              </div>
            </div>

            {/* Détails */}
            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-border/50">
                <span className="text-slate-muted">Territoire</span>
                <span className="text-slate-text font-medium">{result.territoryLabel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-border/50">
                <span className="text-slate-muted">Date du bail</span>
                <span className="text-slate-text font-medium">{new Date(result.bailDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-border/50">
                <span className="text-slate-muted">Surface</span>
                <span className="text-slate-text font-medium">{result.surface} m²</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-border/50">
                <span className="text-slate-muted">Prix au m² (votre loyer)</span>
                <span className="text-slate-text font-medium">{result.pricePerSqm}&nbsp;&euro;/m²</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-muted">Prix au m² (plafond)</span>
                <span className="text-emerald font-medium">{result.referencePricePerSqm}&nbsp;&euro;/m²</span>
              </div>
            </div>

            {result.dpeWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 mb-6">
                &#9888; <strong>DPE F ou G :</strong> depuis la loi Climat (2021), aucun complément de loyer ne peut être appliqué sur les passoires thermiques.
              </div>
            )}

            {/* Prochaines étapes */}
            <div className="mt-6 space-y-3">
              <h3 className="font-heading font-bold text-slate-text text-sm">Prochaines étapes pour récupérer votre trop-perçu :</h3>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center text-xs font-bold text-emerald flex-shrink-0 mt-0.5">1</div>
                <div>
                  <div className="text-sm font-medium text-slate-text">Mise en demeure du bailleur</div>
                  <p className="text-xs text-slate-muted">Lettre recommandée demandant la mise en conformité et le remboursement. Délai : 15 jours.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center text-xs font-bold text-emerald flex-shrink-0 mt-0.5">2</div>
                <div>
                  <div className="text-sm font-medium text-slate-text">Saisine de la Commission de Conciliation</div>
                  <p className="text-xs text-slate-muted">Procédure gratuite et obligatoire avant le tribunal. La CDC convoque les deux parties.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center text-xs font-bold text-emerald flex-shrink-0 mt-0.5">3</div>
                <div>
                  <div className="text-sm font-medium text-slate-text">Signalement à la préfecture</div>
                  <p className="text-xs text-slate-muted">Amende de 5 000&euro; (particulier) ou 15 000&euro; (personne morale) pour le bailleur.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ─── COMPLÉMENT ABUSIF ─── */}
        {isComplement && (
          <div className="bg-white rounded-2xl border border-amber-300 p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-3xl mx-auto mb-4">&#9888;</div>
              <h2 className="font-heading text-2xl font-bold text-slate-text">Complément de loyer contestable</h2>
              <p className="text-slate-muted text-sm mt-2">
                Votre bailleur applique un complément de loyer de <strong className="text-amber-600">{fmt(result.complementAmount)}&nbsp;&euro;/mois</strong> qui pourrait être abusif.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-bg rounded-xl p-4 text-center">
                <div className="text-xs text-slate-muted mb-1">Loyer HC (avec complément)</div>
                <div className="font-heading text-xl font-bold text-slate-text">{fmt(result.currentRent)}&nbsp;&euro;</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
                <div className="text-xs text-amber-600 mb-1">Complément contestable</div>
                <div className="font-heading text-xl font-bold text-amber-600">{fmt(result.complementAmount)}&nbsp;&euro;</div>
              </div>
            </div>

            <div className="bg-emerald/5 rounded-xl p-6 text-center border border-emerald/20 mb-6">
              <div className="text-sm text-slate-muted mb-1">Montant potentiellement récupérable</div>
              <div className="font-heading text-[clamp(32px,5vw,48px)] font-extrabold text-emerald">{fmt(result.totalRecoverable)}&nbsp;&euro;</div>
              <div className="text-xs text-slate-muted mt-1">
                {fmt(result.complementAmount)}&nbsp;&euro; &times; {result.maxRecoverableMonths} mois
              </div>
            </div>

            {result.dpeWarning && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-6">
                <strong>&#128680; DPE F ou G :</strong> le complément de loyer est <strong>interdit</strong> pour les passoires thermiques depuis la loi Climat (août 2022). Votre bailleur est en infraction.
              </div>
            )}

            {/* Prochaines étapes */}
            <div className="mt-6 space-y-3">
              <h3 className="font-heading font-bold text-slate-text text-sm">Prochaines étapes pour récupérer votre trop-perçu :</h3>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center text-xs font-bold text-emerald flex-shrink-0 mt-0.5">1</div>
                <div>
                  <div className="text-sm font-medium text-slate-text">Mise en demeure du bailleur</div>
                  <p className="text-xs text-slate-muted">Lettre recommandée demandant la mise en conformité et le remboursement. Délai : 15 jours.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center text-xs font-bold text-emerald flex-shrink-0 mt-0.5">2</div>
                <div>
                  <div className="text-sm font-medium text-slate-text">Saisine de la Commission de Conciliation</div>
                  <p className="text-xs text-slate-muted">Procédure gratuite et obligatoire avant le tribunal. La CDC convoque les deux parties.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center text-xs font-bold text-emerald flex-shrink-0 mt-0.5">3</div>
                <div>
                  <div className="text-sm font-medium text-slate-text">Signalement à la préfecture</div>
                  <p className="text-xs text-slate-muted">Amende de 5 000&euro; (particulier) ou 15 000&euro; (personne morale) pour le bailleur.</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  )
}
