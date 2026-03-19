'use client'
import { useState } from 'react'
import { MataxeHero } from '@/components/mataxe/MataxeHero'
import { MataxeMethode } from '@/components/mataxe/MataxeMethode'
import { MataxeUpload } from '@/components/mataxe/MataxeUpload'
import { MataxeForm } from '@/components/mataxe/MataxeForm'
import { MataxePreDiag } from '@/components/mataxe/MataxePreDiag'
import { MataxePaywall } from '@/components/mataxe/MataxePaywall'
import { Mataxe6675MAssistant } from '@/components/mataxe/Mataxe6675MAssistant'
import { MataxeFAQ } from '@/components/mataxe/MataxeFAQ'
import { TrustBanner, TrustBadgesCompact, LegalDisclaimer } from '@/components/shared/TrustBadges'
import { MethodologyNote, MATAXE_METHODOLOGY } from '@/components/shared/MethodologyNote'
import { ShareBlock } from '@/components/shared/ShareBlock'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { ReviewJsonLd } from '@/components/reviews/ReviewJsonLd'
import { CrossSellBriques } from '@/components/shared/CrossSellBriques'
import type { MataxePreDiagResponse } from '@/lib/mataxe/types'
import type { MataxeExtractionResult } from '@/lib/mataxe/extract-types'

type InputMode = 'choose' | 'upload' | 'manual'

export default function MataxePage() {
  const [result, setResult] = useState<MataxePreDiagResponse | null>(null)
  const [commune, setCommune] = useState<string>('')
  const [inputMode, setInputMode] = useState<InputMode>('choose')
  const [extraction, setExtraction] = useState<MataxeExtractionResult | null>(null)

  const handleResult = (data: MataxePreDiagResponse) => {
    setResult(data)
    setTimeout(() => {
      document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleExtractionComplete = (ext: MataxeExtractionResult) => {
    setExtraction(ext)
    // Prefill commune from extraction
    if (ext.extracted.communeName?.value) {
      setCommune(ext.extracted.communeName.value)
    }
    setInputMode('manual') // Show form with prefilled data
    setTimeout(() => {
      document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleReset = () => {
    setResult(null)
    setCommune('')
    setInputMode('choose')
    setExtraction(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showIntro = !result

  return (
    <>
      <MataxeHero />

      {/* Approche transparente (remplace "Comment ça marche") */}
      {showIntro && <MataxeMethode />}
      {showIntro && <TrustBadgesCompact />}

      {/* Choix : Upload 6675-M ou formulaire manuel */}
      {!result && inputMode === 'choose' && (
        <section className="py-16 bg-white">
          <div className="max-w-[680px] mx-auto px-6 text-center">
            <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-3">
              Comment souhaitez-vous procéder ?
            </h2>
            <p className="text-slate-muted text-sm mb-8 max-w-[480px] mx-auto">
              Le formulaire 6675-M permet un diagnostic à 95% de fiabilité. Sans ce document, notre analyse reste précise à 60-80%.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1 : Upload */}
              <button
                onClick={() => setInputMode('upload')}
                className="group p-6 rounded-2xl border-2 border-emerald/30 bg-emerald/[0.03] hover:bg-emerald/[0.06] hover:border-emerald/50 transition-all text-left"
              >
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-heading font-bold text-slate-text text-base mb-2">
                  J&apos;ai le formulaire 6675-M
                </h3>
                <p className="text-xs text-slate-muted leading-relaxed mb-3">
                  Notre IA lit votre fiche d&apos;évaluation cadastrale et prérempli le diagnostic.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-emerald/20 overflow-hidden">
                    <div className="w-[95%] h-full bg-emerald rounded-full" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald">95% fiabilité</span>
                </div>
              </button>

              {/* Option 2 : Manuel */}
              <button
                onClick={() => setInputMode('manual')}
                className="group p-6 rounded-2xl border-2 border-slate-border bg-white hover:border-slate-text/20 transition-all text-left"
              >
                <div className="text-3xl mb-3">✏️</div>
                <h3 className="font-heading font-bold text-slate-text text-base mb-2">
                  Remplir manuellement
                </h3>
                <p className="text-xs text-slate-muted leading-relaxed mb-3">
                  Répondez à quelques questions sur votre bien et votre taxe foncière.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-slate-border overflow-hidden">
                    <div className="w-[70%] h-full bg-yellow-400 rounded-full" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-muted">60-80% fiabilité</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Upload 6675-M */}
      {!result && inputMode === 'upload' && (
        <MataxeUpload
          onExtractionComplete={handleExtractionComplete}
          onManualMode={() => setInputMode('manual')}
        />
      )}

      {/* Formulaire (mode manuel OU après extraction) */}
      {!result && inputMode === 'manual' && (
        <MataxeForm
          onResult={handleResult}
          onCommuneChange={setCommune}
          extractedData={extraction}
        />
      )}

      {/* Résultat */}
      {result && (
        <div id="resultat">
          <MataxePreDiag result={result} />
          <div className="max-w-[680px] mx-auto px-6"><MethodologyNote lines={MATAXE_METHODOLOGY} /></div>

          {/* Assistant 6675-M + Paywall — si anomalies détectées */}
          {result.anomaliesCount > 0 && (
            <>
              {/* N'afficher l'assistant 6675-M que si on N'a PAS déjà uploadé le 6675-M */}
              {!extraction && (
                <Mataxe6675MAssistant
                  commune={commune || 'votre commune'}
                />
              )}
                            <>
                            <ShareBlock brique="mataxe" montant={result.impact4Years} />
<MataxePaywall diagnosticId={result.diagnosticId} impact4Years={result.impact4Years} />
                            </>
            </>
          )}

          {/* Si aucune anomalie, message rassurant */}
          {result.anomaliesCount === 0 && (
            <section className="py-12 bg-emerald/[0.03]">
              <div className="max-w-[600px] mx-auto px-6 text-center">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-heading font-bold text-slate-text text-xl mb-3">Bonne nouvelle !</h3>
                <p className="text-sm text-slate-muted leading-relaxed mb-4">
                  Nous n&apos;avons pas détecté d&apos;anomalie majeure sur votre taxe foncière.
                  {!extraction && " Pour confirmer ce résultat, vous pouvez demander gratuitement votre formulaire 6675-M aux impôts — cela nous permettrait de vérifier chaque paramètre avec certitude."}
                  {extraction && " L'analyse de votre formulaire 6675-M confirme que vos paramètres cadastraux semblent corrects."}
                </p>
                {!extraction && (
                  <a href="#faq" className="text-sm text-emerald font-medium hover:text-emerald-dark transition-colors">
                    En savoir plus sur le 6675-M →
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Bouton recommencer */}
          <div className="text-center py-6">
            <button
              onClick={handleReset}
              className="text-sm text-slate-muted hover:text-slate-text underline transition-colors"
            >
              Faire une nouvelle vérification
            </button>
          </div>
        </div>
      )}

      {/* Cross-sell autres briques */}

      <ReviewJsonLd brique="mataxe" briqueName="Taxe fonciere" />
      <ReviewSection brique="mataxe" />
      <CrossSellBriques currentBrique="mataxe" />

      {/* Réassurance */}
      <TrustBanner />

      {/* FAQ */}
      <MataxeFAQ />

      {/* Disclaimer */}
      <LegalDisclaimer brique="mataxe" />
    </>
  )
}
