'use client'
import { useState } from 'react'
import { MapensionHero } from '@/components/mapension/MapensionHero'
import { MapensionForm } from '@/components/mapension/MapensionForm'
import { MapensionResult } from '@/components/mapension/MapensionResult'
import { MapensionPaywall } from '@/components/mapension/MapensionPaywall'
import { MapensionFAQ } from '@/components/mapension/MapensionFAQ'
import { TrustBanner, TrustBadgesCompact, LegalDisclaimer } from '@/components/shared/TrustBadges'
import { BriqueHowItWorks, MAPENSION_STEPS } from '@/components/shared/BriqueHowItWorks'
import { TransparencyBlock, MAPENSION_TRANSPARENCY } from '@/components/shared/TransparencyBlock'
import { MethodologyNote, MAPENSION_METHODOLOGY } from '@/components/shared/MethodologyNote'
import { ShareBlock } from '@/components/shared/ShareBlock'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { ReviewJsonLd } from '@/components/reviews/ReviewJsonLd'
import { CrossSellBriques } from '@/components/shared/CrossSellBriques'
import type { MapensionCalculateResponse } from '@/lib/mapension/types'

export default function MapensionPage() {
  const [result, setResult] = useState<MapensionCalculateResponse | null>(null)

  const handleResult = (data: MapensionCalculateResponse) => {
    setResult(data)
    setTimeout(() => {
      document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <>
      <MapensionHero />
      {!result && <TrustBadgesCompact />}

      {/* Formulaire */}
      {!result && <MapensionForm onResult={handleResult} />}

      {/* Résultat */}
      {result && (
        <>
          <MapensionResult result={result} />
          <div className="max-w-[680px] mx-auto px-6"><MethodologyNote lines={MAPENSION_METHODOLOGY} /></div>

          {/* Paywall si arriérés */}
          {result.hasArrears && (
                        <>
                        <ShareBlock brique="mapension" montant={result.estimatedTotalArrears} />
<MapensionPaywall
              diagnosticId={result.diagnosticId}
              totalArrears={result.estimatedTotalArrears}
            />
                        </>
          )}

          {/* Pas d'arriérés */}
          {!result.hasArrears && (
            <section className="py-12 bg-emerald/[0.03]">
              <div className="max-w-[600px] mx-auto px-6 text-center">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-heading font-bold text-slate-text text-xl mb-3">Bonne nouvelle !</h3>
                <p className="text-sm text-slate-muted leading-relaxed">
                  Le montant versé correspond au montant revalorisé. Aucun arriéré n&apos;est dû.
                  Pensez à vérifier chaque année que la revalorisation est bien appliquée.
                </p>
              </div>
            </section>
          )}

          {/* Recommencer */}
          <div className="text-center py-6">
            <button
              onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="text-sm text-slate-muted hover:text-slate-text underline transition-colors"
            >
              Faire un nouveau calcul
            </button>
          </div>
        </>
      )}

      {!result && <BriqueHowItWorks steps={MAPENSION_STEPS} />}
      <TransparencyBlock data={MAPENSION_TRANSPARENCY} />

      <ReviewJsonLd brique="mapension" briqueName="Pension alimentaire" />
      <ReviewSection brique="mapension" />
      <CrossSellBriques currentBrique="mapension" />
      <TrustBanner />
      <MapensionFAQ />
      <LegalDisclaimer brique="mapension" />
    </>
  )
}
