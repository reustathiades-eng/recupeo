'use client'
import type { MapensionCalculateResponse } from '@/lib/mapension/types'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'

interface Props {
  result: MapensionCalculateResponse
}

export function MapensionResult({ result }: Props) {
  const { initialAmount, revaluedAmount, revaluationPct, monthlyGap, estimatedTotalArrears, arrearsYears, hasArrears, usesARIPA, isCreditor } = result

  return (
    <section id="resultat" className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">{hasArrears ? '⚠️' : '✅'}</div>
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text">
            {hasArrears ? 'Des arriérés sont récupérables' : 'Votre pension semble correcte'}
          </h2>
        </div>

        {/* Carte résultat principal */}
        <div className="bg-white rounded-2xl border border-slate-border p-6 sm:p-8 mb-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <p className="text-xs text-slate-muted mb-1">Pension initiale</p>
              <p className="text-2xl font-bold text-slate-text">{fmt(initialAmount)}€</p>
              <p className="text-xs text-slate-muted">par mois</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-muted mb-1">Pension revalorisée</p>
              <p className="text-2xl font-bold text-emerald">{fmt(revaluedAmount)}€</p>
              <p className="text-xs text-emerald font-medium">+{revaluationPct}% (INSEE)</p>
            </div>
          </div>

          {hasArrears && (
            <>
              <div className="h-px bg-slate-border my-6" />
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-xs text-slate-muted mb-1">Écart mensuel</p>
                  <p className="text-xl font-bold text-red-500">{fmt(monthlyGap)}€</p>
                  <p className="text-xs text-slate-muted">{isCreditor ? 'en moins chaque mois' : "en trop versé"}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-muted mb-1">Arriérés estimés ({arrearsYears} an{arrearsYears > 1 ? 's' : ''})</p>
                  <p className="text-xl font-bold text-navy">{fmt(estimatedTotalArrears)}€</p>
                  <p className="text-xs text-slate-muted">récupérables</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ARIPA warning */}
        {usesARIPA && hasArrears && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Vous passez par l&apos;ARIPA :</strong> contactez votre CAF pour vérifier si la revalorisation a bien été appliquée. L&apos;ARIPA est censée le faire automatiquement.
            </p>
          </div>
        )}

        {/* Explication gratuite */}
        <div className="bg-navy/[0.03] rounded-xl border border-navy/10 p-4 mb-6">
          <p className="text-xs text-slate-muted leading-relaxed">
            <strong className="text-slate-text">Comment on calcule :</strong> Montant initial × (Nouvel indice INSEE / Indice de référence).
            La revalorisation est automatique — votre ex-conjoint doit l&apos;appliquer chaque année sans nouveau jugement.
            Les arriérés sont récupérables sur les 5 dernières années (art. 2224 du Code civil).
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-slate-muted text-center">
          Ce calcul est fourni à titre informatif et ne constitue pas un avis juridique. En cas de litige, consultez un professionnel du droit de la famille.
        </p>
      </div>
    </section>
  )
}
