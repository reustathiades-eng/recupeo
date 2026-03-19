'use client'
import { useState } from 'react'
import { MonloyerHero } from '@/components/monloyer/MonloyerHero'
import { MonloyerForm } from '@/components/monloyer/MonloyerForm'
import { MonloyerResult } from '@/components/monloyer/MonloyerResult'
import { MonloyerUpsell } from '@/components/monloyer/MonloyerUpsell'
import { MonloyerCities } from '@/components/monloyer/MonloyerCities'
import { MonloyerFAQ } from '@/components/monloyer/MonloyerFAQ'
import { TrustBanner, TrustBadgesCompact, LegalDisclaimer } from '@/components/shared/TrustBadges'
import { BriqueHowItWorks, MONLOYER_STEPS } from '@/components/shared/BriqueHowItWorks'
import { TransparencyBlock, MONLOYER_TRANSPARENCY } from '@/components/shared/TransparencyBlock'
import { MethodologyNote, MONLOYER_METHODOLOGY } from '@/components/shared/MethodologyNote'
import { ShareBlock } from '@/components/shared/ShareBlock'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { ReviewJsonLd } from '@/components/reviews/ReviewJsonLd'
import { CrossSellBriques } from '@/components/shared/CrossSellBriques'
import type { MonloyerCheckResult } from '@/lib/monloyer/types'

export default function MonloyerPage() {
  const [result, setResult] = useState<MonloyerCheckResult | null>(null)
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null)

  const handleResult = (data: MonloyerCheckResult, id: string) => {
    setResult(data)
    setDiagnosticId(id)
    setTimeout(() => {
      document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const showIntro = !result

  return (
    <>
      <MonloyerHero />

      {showIntro && <BriqueHowItWorks steps={MONLOYER_STEPS} />}
      {showIntro && <TrustBadgesCompact />}

      {/* Formulaire */}
      {!result && <MonloyerForm onResult={handleResult} />}

      {/* Résultat */}
      {result && diagnosticId && (
        <>
          <MonloyerResult result={result} diagnosticId={diagnosticId} />
          <div className="max-w-[680px] mx-auto px-6"><MethodologyNote lines={MONLOYER_METHODOLOGY} /></div>
          {(result.status === 'depassement' || result.status === 'complement_abusif') && (
            <>
              <ShareBlock brique="monloyer" montant={result.totalRecoverable} />
              <MonloyerUpsell totalRecoverable={result.totalRecoverable} diagnosticId={diagnosticId} />
            </>
          )}
          {/* Bouton recommencer */}
          <div className="text-center py-6">
            <button
              onClick={() => { setResult(null); setDiagnosticId(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="text-sm text-slate-muted hover:text-slate-text underline transition-colors"
            >
              Faire une nouvelle vérification
            </button>
          </div>
        </>
      )}

      {/* Villes éligibles */}
      <MonloyerCities />

      {/* Cross-sell */}
      <TransparencyBlock data={MONLOYER_TRANSPARENCY} />

      <ReviewJsonLd brique="monloyer" briqueName="Encadrement des loyers" />
      <ReviewSection brique="monloyer" />
      <CrossSellBriques currentBrique="monloyer" />

      {/* Réassurance */}
      <TrustBanner />

      {/* FAQ */}
      <MonloyerFAQ />

      {/* Disclaimer */}
      <LegalDisclaimer brique="monloyer" />
    </>
  )
}
