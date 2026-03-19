'use client'
import { useState, useRef } from 'react'
import { RetraitiaHero } from '@/components/retraitia/RetraitiaHero'
import { RetraitiaUpload } from '@/components/retraitia/RetraitiaUpload'
import { RetraitiaExtraction } from '@/components/retraitia/RetraitiaExtraction'
import { RetraitiaForm } from '@/components/retraitia/RetraitiaForm'
import { RetraitiaPreDiag } from '@/components/retraitia/RetraitiaPreDiag'
import { RetraitiaPaywall } from '@/components/retraitia/RetraitiaPaywall'
import { RetraitiaFAQ } from '@/components/retraitia/RetraitiaFAQ'
import { TrustBanner, TrustBadgesCompact, LegalDisclaimer } from '@/components/shared/TrustBadges'
import { BriqueHowItWorks, RETRAITIA_STEPS } from '@/components/shared/BriqueHowItWorks'
import { TransparencyBlock, RETRAITIA_TRANSPARENCY } from '@/components/shared/TransparencyBlock'
import { MethodologyNote, RETRAITIA_METHODOLOGY } from '@/components/shared/MethodologyNote'
import { ShareBlock } from '@/components/shared/ShareBlock'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { ReviewJsonLd } from '@/components/reviews/ReviewJsonLd'
import { CrossSellBriques } from '@/components/shared/CrossSellBriques'
import type { RetraitiaPreDiagResponse } from '@/lib/retraitia/types'
import type { RetraitiaExtractionResult } from '@/lib/retraitia/extract-types'

type FlowStep = 'upload' | 'extracting' | 'form' | 'manual' | 'diagnosing' | 'result'

export default function RetraitiaPage() {
  const [step, setStep] = useState<FlowStep>('upload')
  const [result, setResult] = useState<RetraitiaPreDiagResponse | null>(null)
  const [extraction, setExtraction] = useState<RetraitiaExtractionResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Vision consent
  const [needsVisionConsent, setNeedsVisionConsent] = useState(false)
  const [ocrConfidence, setOcrConfidence] = useState<number | undefined>()
  const pendingFiles = useRef<File[]>([])

  // ─── UPLOAD → EXTRACTION ───
  const handleFilesReady = async (files: File[]) => {
    pendingFiles.current = files
    setStep('extracting')
    setErrorMsg(null)
    setNeedsVisionConsent(false)
    await runExtraction(files, false)
  }

  const runExtraction = async (files: File[], forceVision: boolean) => {
    try {
      const formData = new FormData()
      for (const file of files) formData.append('files', file)
      if (forceVision) {
        formData.append('forceVision', 'true')
        formData.append('visionConsent', 'true')
      }

      const res = await fetch('/api/retraitia/extract', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        if (data.needsVisionConsent) {
          setNeedsVisionConsent(true)
          setOcrConfidence(data.ocrConfidence)
          return
        }
        throw new Error(data.error || "Erreur lors de l'extraction")
      }

      // Succès → passer au formulaire prérempli
      setExtraction(data.extraction)
      setStep('form')
      setTimeout(() => {
        document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      console.error('[retraitia] Extraction error:', err)
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue')
      setStep('upload')
    }
  }

  // ─── VISION CONSENT ───
  const handleVisionConsent = async () => {
    setNeedsVisionConsent(false)
    await runExtraction(pendingFiles.current, true)
  }

  // ─── RÉSULTAT PRÉ-DIAGNOSTIC ───
  const handleResult = (data: RetraitiaPreDiagResponse) => {
    setResult(data)
    setStep('result')
    setTimeout(() => {
      document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const showHowItWorks = step === 'upload' || step === 'manual'

  return (
    <>
      <RetraitiaHero />
      {showHowItWorks && <BriqueHowItWorks steps={RETRAITIA_STEPS} />}
      {showHowItWorks && <TrustBadgesCompact />}




      {/* Erreur globale */}
      {errorMsg && step === 'upload' && (
        <div className="max-w-[680px] mx-auto px-6 mb-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <p>{errorMsg}</p>
              <button type="button" onClick={() => setErrorMsg(null)} className="text-xs text-red-500 hover:text-red-700 mt-1 underline">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP: Upload */}
      {step === 'upload' && (
        <RetraitiaUpload
          onFilesReady={handleFilesReady}
          onManualMode={() => { setStep('manual'); setErrorMsg(null) }}
        />
      )}

      {/* STEP: Extraction en cours / Consentement Vision */}
      {step === 'extracting' && (
        <RetraitiaExtraction
          needsVisionConsent={needsVisionConsent}
          ocrConfidence={ocrConfidence}
          onVisionConsent={handleVisionConsent}
          onManualFallback={() => setStep('manual')}
        />
      )}

      {/* STEP: Formulaire prérempli (après extraction) */}
      {step === 'form' && (
        <RetraitiaForm
          onResult={handleResult}
          initialData={extraction}
          onBack={() => { setStep('upload'); setErrorMsg(null) }}
        />
      )}

      {/* STEP: Formulaire manuel (sans extraction) */}
      {step === 'manual' && (
        <RetraitiaForm
          onResult={handleResult}
          onBack={() => { setStep('upload'); setErrorMsg(null) }}
        />
      )}

      {/* STEP: Diagnostic IA en cours */}
      {step === 'diagnosing' && (
        <section className="py-20 bg-white">
          <div className="max-w-[500px] mx-auto px-6 text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-border/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-emerald rounded-full animate-spin" style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">📊</div>
            </div>
            <h2 className="font-heading text-xl font-bold text-slate-text mb-3">
              Analyse de votre pension en cours...
            </h2>
            <p className="text-sm text-slate-muted mb-2">
              Vérification des trimestres, calcul des majorations, détection des anomalies.
            </p>
            <p className="text-xs text-slate-muted">
              🔒 Vos données sont anonymisées pendant l&apos;analyse.
            </p>
          </div>
        </section>
      )}

      {/* STEP: Résultat */}
      {step === 'result' && result && (
        <div id="resultat">
          <RetraitiaPreDiag result={result} />
          <div className="max-w-[680px] mx-auto px-6"><MethodologyNote lines={RETRAITIA_METHODOLOGY} /></div>
          {result.anomaliesCount > 0 && (
                        <>
                        <ShareBlock brique="retraitia" montant={result.impactLifetime} />
<RetraitiaPaywall diagnosticId={result.diagnosticId} impactLifetime={result.impactLifetime} />
                        </>
          )}
        </div>
      )}

      {/* Réassurance */}
      {/* Cross-sell */}
      <TransparencyBlock data={RETRAITIA_TRANSPARENCY} />

      <ReviewJsonLd brique="retraitia" briqueName="Audit retraite" />
      <ReviewSection brique="retraitia" />
      <CrossSellBriques currentBrique="retraitia" />

      <TrustBanner />

      {/* FAQ */}
      <RetraitiaFAQ />

      {/* Disclaimer */}
      <LegalDisclaimer brique="retraitia" />
    </>
  )
}
