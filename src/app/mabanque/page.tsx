'use client'
import { useState } from 'react'
import { MabanqueHero } from '@/components/mabanque/MabanqueHero'
import { MabanqueUpload } from '@/components/mabanque/MabanqueUpload'
import { MabanqueExtraction } from '@/components/mabanque/MabanqueExtraction'
import { MabanqueForm } from '@/components/mabanque/MabanqueForm'
import { MabanquePreDiag } from '@/components/mabanque/MabanquePreDiag'
import { MabanquePaywall } from '@/components/mabanque/MabanquePaywall'
import { MabanqueFAQ } from '@/components/mabanque/MabanqueFAQ'
import { TrustBanner, TrustBadgesCompact, LegalDisclaimer } from '@/components/shared/TrustBadges'
import { BriqueHowItWorks, MABANQUE_STEPS } from '@/components/shared/BriqueHowItWorks'
import { TransparencyBlock, MABANQUE_TRANSPARENCY } from '@/components/shared/TransparencyBlock'
import { MethodologyNote, MABANQUE_METHODOLOGY } from '@/components/shared/MethodologyNote'
import { ShareBlock } from '@/components/shared/ShareBlock'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { ReviewJsonLd } from '@/components/reviews/ReviewJsonLd'
import { CrossSellBriques } from '@/components/shared/CrossSellBriques'
import type { MabanquePreDiagResponse } from '@/lib/mabanque/types'
import type { MabanqueExtractionResult } from '@/lib/mabanque/extract-types'

type Step = 'upload' | 'extraction' | 'form' | 'result'

export default function MabanquePage() {
  const [step, setStep] = useState<Step>('upload')
  const [extraction, setExtraction] = useState<MabanqueExtractionResult | null>(null)
  const [result, setResult] = useState<MabanquePreDiagResponse | null>(null)

  // Upload terminé → montrer le résumé d'extraction
  const handleExtractionComplete = (data: MabanqueExtractionResult) => {
    setExtraction(data)
    setStep('extraction')
    setTimeout(() => {
      document.getElementById('extraction')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // User valide l'extraction → passer au formulaire pré-rempli
  const handleContinueToForm = () => {
    setStep('form')
    setTimeout(() => {
      document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Mode manuel (pas d'upload)
  const handleManualMode = () => {
    setExtraction(null)
    setStep('form')
    setTimeout(() => {
      document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Résultat du pré-diag
  const handleResult = (data: MabanquePreDiagResponse) => {
    setResult(data)
    setStep('result')
    setTimeout(() => {
      document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Reset complet
  const handleRestart = () => {
    setStep('upload')
    setExtraction(null)
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showUploadOrForm = step === 'upload' || step === 'extraction' || step === 'form'
  const showResult = step === 'result' && result

  return (
    <>
      <MabanqueHero />

      {/* Phase 1 : Upload */}
      {step === 'upload' && (
        <>
          <TrustBadgesCompact />
          <MabanqueUpload
            onExtractionComplete={handleExtractionComplete}
            onManualMode={handleManualMode}
          />
        </>
      )}

      {/* Phase 2 : Résumé extraction */}
      {step === 'extraction' && extraction && (
        <div id="extraction">
          <MabanqueExtraction
            extraction={extraction}
            onContinue={handleContinueToForm}
            onRestart={handleRestart}
          />
        </div>
      )}

      {/* Phase 3 : Formulaire (manuel ou pré-rempli) */}
      {step === 'form' && (
        <MabanqueForm
          onResult={handleResult}
          initialData={extraction}
        />
      )}

      {/* Phase 4 : Résultat */}
      {showResult && (
        <>
          <MabanquePreDiag result={result} />
          <div className="max-w-[680px] mx-auto px-6"><MethodologyNote lines={MABANQUE_METHODOLOGY} /></div>

          {/* Paywall si anomalies */}
          {result.totalAnomalies > 0 && (
                        <>
                        <ShareBlock brique="mabanque" montant={result.tropPercu5ans} />
<MabanquePaywall
              diagnosticId={result.diagnosticId}
              tropPercuAnnuel={result.tropPercuAnnuel}
            />
                        </>
          )}

          {/* Pas d'anomalies */}
          {result.totalAnomalies === 0 && (
            <section className="py-12 bg-emerald/[0.03]">
              <div className="max-w-[600px] mx-auto px-6 text-center">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-heading font-bold text-slate-text text-xl mb-3">Bonne nouvelle !</h3>
                <p className="text-sm text-slate-muted leading-relaxed">
                  Vos frais semblent conformes aux plafonds légaux.
                  Pensez à vérifier régulièrement, surtout en cas de changement de situation.
                </p>
              </div>
            </section>
          )}

          <div className="text-center py-6">
            <button onClick={handleRestart}
              className="text-sm text-slate-muted hover:text-slate-text underline transition-colors">
              Faire un nouveau diagnostic
            </button>
          </div>
        </>
      )}

      {showUploadOrForm && !showResult && <BriqueHowItWorks steps={MABANQUE_STEPS} />}
      <TransparencyBlock data={MABANQUE_TRANSPARENCY} />

      <ReviewJsonLd brique="mabanque" briqueName="Frais bancaires" />
      <ReviewSection brique="mabanque" />
      <CrossSellBriques currentBrique="mabanque" />
      <TrustBanner />
      <MabanqueFAQ />
      <LegalDisclaimer brique="mabanque" />
    </>
  )
}
