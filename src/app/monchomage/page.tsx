'use client'
import { useState } from 'react'
import { MonchomageHero } from '@/components/monchomage/MonchomageHero'
import { MonchomageUpload } from '@/components/monchomage/MonchomageUpload'
import { MonchomageExtraction } from '@/components/monchomage/MonchomageExtraction'
import { MonchomageForm } from '@/components/monchomage/MonchomageForm'
import { MonchomagePreDiag } from '@/components/monchomage/MonchomagePreDiag'
import { MonchomagePaywall } from '@/components/monchomage/MonchomagePaywall'
import { MonchomageFAQ } from '@/components/monchomage/MonchomageFAQ'
import { TrustBanner, TrustBadgesCompact, LegalDisclaimer } from '@/components/shared/TrustBadges'
import { BriqueHowItWorks, MONCHOMAGE_STEPS } from '@/components/shared/BriqueHowItWorks'
import { TransparencyBlock, MONCHOMAGE_TRANSPARENCY } from '@/components/shared/TransparencyBlock'
import { MethodologyNote, MONCHOMAGE_METHODOLOGY } from '@/components/shared/MethodologyNote'
import { ShareBlock } from '@/components/shared/ShareBlock'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { ReviewJsonLd } from '@/components/reviews/ReviewJsonLd'
import { CrossSellBriques } from '@/components/shared/CrossSellBriques'
import type { MonchomagePreDiagResponse } from '@/lib/monchomage/types'
import type { MonchomageExtractionResult } from '@/lib/monchomage/extract-types'

type Step = 'upload' | 'extraction' | 'form' | 'result'

export default function MonchomagePage() {
  const [step, setStep] = useState<Step>('upload')
  const [extraction, setExtraction] = useState<MonchomageExtractionResult | null>(null)
  const [result, setResult] = useState<MonchomagePreDiagResponse | null>(null)

  const handleExtractionComplete = (data: MonchomageExtractionResult) => {
    setExtraction(data)
    setStep('extraction')
    setTimeout(() => { document.getElementById('extraction')?.scrollIntoView({ behavior: 'smooth' }) }, 100)
  }

  const handleContinueToForm = () => {
    setStep('form')
    setTimeout(() => { document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' }) }, 100)
  }

  const handleManualMode = () => {
    setExtraction(null); setStep('form')
    setTimeout(() => { document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' }) }, 100)
  }

  const handleResult = (data: MonchomagePreDiagResponse) => {
    setResult(data); setStep('result')
    setTimeout(() => { document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth' }) }, 100)
  }

  const handleRestart = () => {
    setStep('upload'); setExtraction(null); setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showUploadOrForm = step === 'upload' || step === 'extraction' || step === 'form'
  const showResult = step === 'result' && result

  return (
    <>
      <MonchomageHero />

      {step === 'upload' && (
        <>
          <TrustBadgesCompact />
          <MonchomageUpload onExtractionComplete={handleExtractionComplete} onManualMode={handleManualMode} />
        </>
      )}

      {step === 'extraction' && extraction && (
        <div id="extraction">
          <MonchomageExtraction extraction={extraction} onContinue={handleContinueToForm} onRestart={handleRestart} />
        </div>
      )}

      {step === 'form' && (
        <MonchomageForm onResult={handleResult} initialData={extraction} />
      )}

      {showResult && (
        <>
          <MonchomagePreDiag result={result} />
          <div className="max-w-[680px] mx-auto px-6"><MethodologyNote lines={MONCHOMAGE_METHODOLOGY} /></div>

          {result.hasAnomalies && result.ecartTotal > 0 && (
                        <>
                        <ShareBlock brique="monchomage" montant={result.ecartTotal} />
<MonchomagePaywall diagnosticId={result.diagnosticId} ecartTotal={result.ecartTotal} />
                        </>
          )}

          {!result.hasAnomalies && (
            <section className="py-12 bg-emerald/[0.03]">
              <div className="max-w-[600px] mx-auto px-6 text-center">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-heading font-bold text-slate-text text-xl mb-3">Bonne nouvelle !</h3>
                <p className="text-sm text-slate-muted leading-relaxed">
                  Votre allocation semble correctement calculée. Comparez avec vos bulletins de paie pour une vérification complète.
                </p>
              </div>
            </section>
          )}

          <div className="text-center py-6">
            <button onClick={handleRestart} className="text-sm text-slate-muted hover:text-slate-text underline transition-colors">
              Faire un nouveau diagnostic
            </button>
          </div>
        </>
      )}

      {showUploadOrForm && !showResult && <BriqueHowItWorks steps={MONCHOMAGE_STEPS} />}
      <TransparencyBlock data={MONCHOMAGE_TRANSPARENCY} />
      <ReviewJsonLd brique="monchomage" briqueName="Allocations chomage" />
      <ReviewSection brique="monchomage" />
      <CrossSellBriques currentBrique="monchomage" />
      <TrustBanner />
      <MonchomageFAQ />
      <LegalDisclaimer brique="monchomage" />
    </>
  )
}
