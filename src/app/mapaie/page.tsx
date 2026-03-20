'use client'

import { useState, useEffect } from 'react'
import Hero from '@/components/mapaie/Hero'
import { MapaieUpload } from '@/components/mapaie/Upload'
import Form, { type EmploiFormData } from '@/components/mapaie/Form'
import { MapaiePreDiag, type MapaiePreDiagResult } from '@/components/mapaie/PreDiag'
import Paywall from '@/components/mapaie/Paywall'
import { MapaieReport } from '@/components/mapaie/Report'
import { MapaieFAQ } from '@/components/mapaie/FAQ'
import { TrustBanner, TrustBadgesCompact, LegalDisclaimer } from '@/components/shared/TrustBadges'
import { BriqueHowItWorks, MAPAIE_STEPS } from '@/components/shared/BriqueHowItWorks'
import { TransparencyBlock, MAPAIE_TRANSPARENCY } from '@/components/shared/TransparencyBlock'
import { MethodologyNote, MAPAIE_METHODOLOGY } from '@/components/shared/MethodologyNote'
import { ShareBlock } from '@/components/shared/ShareBlock'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { ReviewJsonLd } from '@/components/reviews/ReviewJsonLd'
import { CrossSellBriques } from '@/components/shared/CrossSellBriques'

type Step = 'upload' | 'form' | 'prediag' | 'report'

export default function MapaiePage() {
  const [step, setStep] = useState<Step>('upload')
  const [extraction, setExtraction] = useState<unknown>(null)
  const [prediagResult, setPrediagResult] = useState<MapaiePreDiagResult | null>(null)
  const [reportData, setReportData] = useState<{ report: unknown; letters: unknown } | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)

  // Retour Stripe : session_id + diagnostic_id en query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const diagId = params.get('diagnostic_id')
    if (sessionId && diagId) {
      setReportLoading(true)
      fetch('/api/mapaie/full-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, diagnosticId: diagId }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setReportData({ report: data.report, letters: data.letters ?? null })
            setStep('report')
            setTimeout(() => document.getElementById('rapport')?.scrollIntoView({ behavior: 'smooth' }), 100)
          }
        })
        .finally(() => setReportLoading(false))
    }
  }, [])

  const handleExtractionComplete = (data: unknown) => {
    setExtraction(data)
    setStep('form')
    setTimeout(() => document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleManualMode = () => {
    setExtraction(null)
    setStep('form')
    setTimeout(() => document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleFormSubmit = async (data: EmploiFormData) => {
    setFormLoading(true)
    try {
      // Calcul ancienneté depuis dateEntree
      const ancienneteAnnees = data.dateEntree
        ? Math.floor((Date.now() - new Date(data.dateEntree).getTime()) / (365.25 * 24 * 3600 * 1000))
        : 0

      // Conversion tempsTravail -> dureeHebdomadaire
      const tempsPartiel = data.tempsTravail === 'PARTIEL'
      const dureeHebdomadaire = tempsPartiel
        ? (parseFloat(data.quotite) || 17.5)
        : 35

      // Transformation vers PreDiagnosticSchema
      const payload = {
        emploi: {
          intitulePoste: data.poste,
          conventionCollective: data.conventionCode,
          dateEntree: data.dateEntree,
          tempsPartiel,
          dureeHebdomadaire,
          ...(data.coefficient ? { coefficient: parseFloat(data.coefficient) } : {}),
        },
        remuneration: {
          salaireBrutMensuel: parseFloat(data.brutMensuel),
          salaireNetMensuel: parseFloat(data.netMensuel),
          heuresSupMensuelles: data.heuresSupHebdo ? parseFloat(data.heuresSupHebdo) * 4.33 : 0,
          ancienneteAnnees,
        },
        periodeAudit: 'THREE_MONTHS' as const,
        consentementTraitement: true as const,
        extraction,
      }

      const res = await fetch('/api/mapaie/pre-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        setPrediagResult(json.result)
        setStep('prediag')
        setTimeout(() => document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth' }), 100)
      } else {
        console.error('[mapaie] pre-diagnostic error:', json)
        alert(json.error ?? 'Une erreur est survenue. Vérifiez vos informations et réessayez.')
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handlePrediagContinue = () => {
    setTimeout(() => document.getElementById('paywall')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleRestart = () => {
    setStep('upload')
    setExtraction(null)
    setPrediagResult(null)
    setReportData(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showUploadOrForm = step === 'upload' || step === 'form'

  return (
    <>
      <Hero />

      {/* Phase 1 : Upload */}
      {step === 'upload' && (
        <div id="upload-section">
          <TrustBadgesCompact />
          <MapaieUpload
            onExtractionComplete={handleExtractionComplete}
            onManualMode={handleManualMode}
          />
        </div>
      )}

      {/* Phase 2 : Formulaire (pré-rempli ou manuel) */}
      {step === 'form' && (
        <section id="formulaire" className="py-20 bg-slate-bg">
          <div className="max-w-[680px] mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="font-heading text-[clamp(24px,4vw,32px)] font-bold text-slate-text mb-3">
                Votre situation d&apos;emploi
              </h2>
              <p className="text-slate-muted text-base max-w-[520px] mx-auto">
                Ces informations permettent de <strong className="text-emerald">détecter les anomalies</strong> spécifiques à votre contrat et votre convention collective.
              </p>
            </div>
            <Form
              onSubmit={handleFormSubmit}
              defaultValues={extraction as Partial<EmploiFormData> | undefined}
              loading={formLoading}
            />
          </div>
        </section>
      )}

      {/* Chargement rapport post-Stripe */}
      {reportLoading && (
        <section className="py-20 bg-slate-bg">
          <div className="max-w-[400px] mx-auto px-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald/10 flex items-center justify-center">
              <svg className="animate-spin h-7 w-7 text-emerald" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-text mb-1">Génération de votre rapport en cours…</p>
            <p className="text-sm text-slate-muted">On compile toutes les anomalies détectées.</p>
          </div>
        </section>
      )}

      {/* Phase 3 : Pré-diagnostic */}
      {step === 'prediag' && prediagResult && (
        <div id="resultat">
          <MapaiePreDiag result={prediagResult} onContinue={handlePrediagContinue} />
          <div className="max-w-[680px] mx-auto px-6">
            <MethodologyNote lines={MAPAIE_METHODOLOGY} />
          </div>

          {prediagResult.totalAnomalies > 0 && (
            <>
              <ShareBlock brique="mapaie" montant={prediagResult.rappelTotalBrut} />
              <div id="paywall">
                <Paywall />
              </div>
            </>
          )}

          {prediagResult.totalAnomalies === 0 && (
            <section className="py-12 bg-emerald/[0.03]">
              <div className="max-w-[600px] mx-auto px-6 text-center">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-heading font-bold text-slate-text text-xl mb-3">Bonne nouvelle !</h3>
                <p className="text-sm text-slate-muted leading-relaxed">
                  Vos bulletins semblent conformes aux règles en vigueur.
                  Pensez à vérifier à chaque changement de poste, d&apos;horaires ou de convention collective.
                </p>
              </div>
            </section>
          )}

          <div className="text-center py-6">
            <button
              onClick={handleRestart}
              className="text-sm text-slate-muted hover:text-slate-text underline transition-colors"
            >
              Faire un nouveau diagnostic
            </button>
          </div>
        </div>
      )}

      {/* Phase 4 : Rapport complet (après paiement Stripe) */}
      {step === 'report' && reportData && (
        <div id="rapport">
          <MapaieReport
            report={reportData.report}
            letters={reportData.letters}
            diagnosticId={prediagResult?.diagnosticId ?? ''}
          />
          <div className="text-center py-6">
            <button
              onClick={handleRestart}
              className="text-sm text-slate-muted hover:text-slate-text underline transition-colors"
            >
              Faire un nouveau diagnostic
            </button>
          </div>
        </div>
      )}

      {showUploadOrForm && <div id="comment-ca-marche"><BriqueHowItWorks steps={MAPAIE_STEPS} /></div>}
      <TransparencyBlock data={MAPAIE_TRANSPARENCY} />

      <ReviewJsonLd brique="mapaie" briqueName="Audit bulletin de paie" />
      <ReviewSection brique="mapaie" />
      <CrossSellBriques currentBrique="mapaie" />
      <TrustBanner />
      <MapaieFAQ />
      <LegalDisclaimer brique="mapaie" />
    </>
  )
}
