'use client'
import { useState, useRef } from 'react'
import { MacautionHero } from '@/components/macaution/MacautionHero'
import { MacautionUpload } from '@/components/macaution/MacautionUpload'
import { MacautionExtraction } from '@/components/macaution/MacautionExtraction'
import { MacautionValidation } from '@/components/macaution/MacautionValidation'
import { MacautionForm } from '@/components/macaution/MacautionForm'
import { MacautionPreDiag } from '@/components/macaution/MacautionPreDiag'
import { MacautionPaywall } from '@/components/macaution/MacautionPaywall'
import { MacautionFAQ } from '@/components/macaution/MacautionFAQ'
import { TrustBanner, TrustBadgesCompact, LegalDisclaimer } from '@/components/shared/TrustBadges'
import { BriqueHowItWorks, MACAUTION_STEPS } from '@/components/shared/BriqueHowItWorks'
import { TransparencyBlock, MACAUTION_TRANSPARENCY } from '@/components/shared/TransparencyBlock'
import { MethodologyNote, MACAUTION_METHODOLOGY } from '@/components/shared/MethodologyNote'
import { ShareBlock } from '@/components/shared/ShareBlock'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { ReviewJsonLd } from '@/components/reviews/ReviewJsonLd'
import { CrossSellBriques } from '@/components/shared/CrossSellBriques'
import type { PreDiagnosticResponse, MacautionFormData } from '@/lib/macaution/types'
import type { ExtractionResult } from '@/lib/macaution/extract-types'

type FlowStep = 'upload' | 'extracting' | 'validation' | 'diagnosing' | 'manual' | 'result'

export default function MacautionPage() {
  const [step, setStep] = useState<FlowStep>('upload')
  const [result, setResult] = useState<PreDiagnosticResponse | null>(null)
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Vision consent flow
  const [needsVisionConsent, setNeedsVisionConsent] = useState(false)
  const [ocrConfidence, setOcrConfidence] = useState<number | undefined>()
  const pendingFiles = useRef<File[]>([])

  // --------------------------------------------------
  // UPLOAD → EXTRACTION
  // --------------------------------------------------
  const handleFilesReady = async (files: File[]) => {
    pendingFiles.current = files
    setStep('extracting')
    setErrorMsg(null)
    setNeedsVisionConsent(false)

    await runExtraction(files, false)
  }

  // --------------------------------------------------
  // Extraction API call
  // --------------------------------------------------
  const runExtraction = async (files: File[], forceVision: boolean) => {
    try {
      const formData = new FormData()
      for (const file of files) {
        formData.append('files', file)
      }
      if (forceVision) {
        formData.append('forceVision', 'true')
        formData.append('visionConsent', 'true')
      }

      const res = await fetch('/api/macaution/extract', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        // OCR insuffisant → demander consentement Vision
        if (data.needsVisionConsent) {
          setNeedsVisionConsent(true)
          setOcrConfidence(data.ocrConfidence)
          return
        }
        throw new Error(data.error || "Erreur lors de l'extraction")
      }

      // Succès → passer à la validation
      setExtraction(data.extraction)
      setStep('validation')
      setTimeout(() => {
        document.getElementById('validation')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      console.error('[macaution] Extraction error:', err)
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue')
      setStep('upload')
    }
  }

  // --------------------------------------------------
  // Consentement Vision → retry avec Vision
  // --------------------------------------------------
  const handleVisionConsent = async () => {
    setNeedsVisionConsent(false)
    await runExtraction(pendingFiles.current, true)
  }

  // --------------------------------------------------
  // VALIDATION → PRÉ-DIAGNOSTIC (avec loading)
  // --------------------------------------------------
  const handleValidate = async (data: MacautionFormData) => {
    setStep('diagnosing')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/macaution/pre-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, edlComparison: extraction?.edlComparison || null }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur lors du pré-diagnostic')

      setResult(json)
      setStep('result')
      setTimeout(() => {
        document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      console.error('[macaution] Pre-diagnostic error:', err)
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue')
      setStep('validation') // FIX 4 : retour validation avec erreur visible
    }
  }

  // --------------------------------------------------
  // Résultat du formulaire manuel
  // --------------------------------------------------
  const handleManualResult = (data: PreDiagnosticResponse) => {
    setResult(data)
    setStep('result')
    setTimeout(() => {
      document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // FIX 10 : Masquer "Comment ça marche" une fois le flow avancé
  const showHowItWorks = step === 'upload' || step === 'manual'

  return (
    <>
      <MacautionHero />

      {/* Comment ça marche — visible uniquement au début */}
      {showHowItWorks && <BriqueHowItWorks steps={MACAUTION_STEPS} />}
      {showHowItWorks && <TrustBadgesCompact />}

      {/* Erreur globale — visible sur upload ET validation */}
      {errorMsg && (step === 'upload' || step === 'validation') && (
        <div className="max-w-[800px] mx-auto px-6 mb-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <p>{errorMsg}</p>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-xs text-red-500 hover:text-red-700 mt-1 underline"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP: Upload */}
      {step === 'upload' && (
        <MacautionUpload
          onFilesReady={handleFilesReady}
          onManualMode={() => { setStep('manual'); setErrorMsg(null) }}
        />
      )}

      {/* STEP: Extraction en cours / Consentement Vision */}
      {step === 'extracting' && (
        <MacautionExtraction
          needsVisionConsent={needsVisionConsent}
          ocrConfidence={ocrConfidence}
          onVisionConsent={handleVisionConsent}
          onManualFallback={() => setStep('manual')}
        />
      )}

      {/* STEP: Pré-diagnostic en cours (FIX 3 : loading pendant l'analyse) */}
      {step === 'diagnosing' && (
        <section className="py-20 bg-white">
          <div className="max-w-[500px] mx-auto px-6 text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-border/30 rounded-full" />
              <div
                className="absolute inset-0 border-4 border-emerald rounded-full animate-spin"
                style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">⚖️</div>
            </div>
            <p className="font-heading font-bold text-slate-text text-lg mb-3">
              Analyse juridique en cours...
            </p>
            <p className="text-sm text-slate-muted">
              Croisement avec le droit français, calcul des pénalités et de la vétusté.
            </p>
          </div>
        </section>
      )}

      {/* STEP: Validation des données extraites */}
      {step === 'validation' && extraction && (
        <div id="validation">
          <MacautionValidation
            extraction={extraction}
            onValidate={handleValidate}
            onBack={() => { setStep('upload'); setErrorMsg(null) }}
          />
        </div>
      )}

      {/* STEP: Formulaire manuel (fallback) */}
      {step === 'manual' && (
        <MacautionForm onResult={handleManualResult} onBack={() => { setStep('upload'); setErrorMsg(null) }} />
      )}

      {/* STEP: Résultat pré-diagnostic */}
      {step === 'result' && result && (
        <div id="resultat">
          <MacautionPreDiag result={result} />
          <div className="max-w-[680px] mx-auto px-6">
            <MethodologyNote lines={MACAUTION_METHODOLOGY} />
          </div>
          {result.anomaliesCount > 0 && (
                        <>
                        <ShareBlock brique="macaution" montant={result.estimatedAmount} />
<MacautionPaywall
              diagnosticId={result.diagnosticId}
              estimatedAmount={result.estimatedAmount}
            />
                        </>
          )}
        </div>
      )}

      <TransparencyBlock data={MACAUTION_TRANSPARENCY} />


      <ReviewJsonLd brique="macaution" briqueName="Depot de garantie" />
      <ReviewSection brique="macaution" />
      <CrossSellBriques currentBrique="macaution" />

      <TrustBanner />

      {/* FAQ */}
      <MacautionFAQ />

      {/* Disclaimer juridique */}
      <LegalDisclaimer brique="macaution" />
    </>
  )
}
