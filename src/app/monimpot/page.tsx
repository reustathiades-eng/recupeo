'use client'
import { useState } from 'react'
import { MonimpotHero } from '@/components/monimpot/MonimpotHero'
import { MonimpotUpload } from '@/components/monimpot/MonimpotUpload'
import type { MonimpotExtractResult } from '@/components/monimpot/MonimpotUpload'
import { MonimpotExtraction } from '@/components/monimpot/MonimpotExtraction'
import { MonimpotSmartForm } from '@/components/monimpot/MonimpotSmartForm'
import { MonimpotForm } from '@/components/monimpot/MonimpotForm'
import { MonimpotPreDiag } from '@/components/monimpot/MonimpotPreDiag'
import { MonimpotPaywall } from '@/components/monimpot/MonimpotPaywall'
import { MonimpotFAQ } from '@/components/monimpot/MonimpotFAQ'
import SmartFormV3 from '@/components/monimpot/SmartFormV3'
import { ShareBlock } from '@/components/shared/ShareBlock'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { ReviewJsonLd } from '@/components/reviews/ReviewJsonLd'
import { CrossSellBriques } from '@/components/shared/CrossSellBriques'
import { TrustBanner, TrustBadgesCompact, LegalDisclaimer } from '@/components/shared/TrustBadges'
import { BriqueHowItWorks } from '@/components/shared/BriqueHowItWorks'
import { TransparencyBlock } from '@/components/shared/TransparencyBlock'
import { MethodologyNote } from '@/components/shared/MethodologyNote'
import { mapExtractionToFormData } from '@/lib/monimpot/extract-mapper'
import type { MonimpotPreDiagResponse, MonimpotFormData } from '@/lib/monimpot/types'
import type { AvisImpositionExtracted } from '@/lib/monimpot/extract-types'
import type { FormComplet, ResultatTempsReel } from '@/lib/monimpot/form-complet-types'
import { computeFullCalculations } from '@/lib/monimpot/calculations-complet'
import { track } from '@/lib/analytics'

// ─── State machine ───
type Parcours = 'choix' | 'upload' | 'formulaire'
type Step = 'parcours' | 'upload' | 'extraction' | 'smart-form' | 'manual-form' | 'formulaire-v3' | 'result'

const MONIMPOT_STEPS_UPLOAD = [
  { num: '1', icon: '📄', title: "Uploadez votre avis d'imposition", desc: "Glissez le PDF téléchargé depuis impots.gouv.fr — l'IA extrait tout automatiquement." },
  { num: '2', icon: '🔍', title: "L'IA analyse votre déclaration", desc: 'Détection des cases manquées, calcul des économies, comparaison multi-années.' },
  { num: '3', icon: '💰', title: 'Corrigez et récupérez', desc: 'Recevez votre rapport avec réclamation pré-remplie et guide impots.gouv.fr.' },
]

const MONIMPOT_STEPS_FORMULAIRE = [
  { num: '1', icon: '📝', title: 'Répondez à quelques questions', desc: 'Un formulaire adaptatif en français simple. 2 à 8 minutes selon votre situation.' },
  { num: '2', icon: '🔍', title: 'Calcul instantané', desc: "L'impôt se calcule en temps réel à chaque réponse. Vous voyez l'économie en direct." },
  { num: '3', icon: '💰', title: 'Corrigez et récupérez', desc: 'Recevez votre rapport avec réclamation pré-remplie et guide impots.gouv.fr.' },
]

const MONIMPOT_TRANSPARENCY = {
  known: [
    "Extraction automatique de votre avis d'imposition (revenus, parts, cases cochées)",
    'Quotient familial et nombre de parts',
    'Frais réels vs abattement 10%',
    'Éligibilité case T (parent isolé) et case L',
    'Réductions/crédits manqués (dons, emploi domicile, garde, EHPAD, PER)',
    'Abattement seniors \u2265 65 ans',
    'Option barème vs PFU (case 2OP)',
    'Niches fiscales courantes (Pinel, outre-mer, forêt, rénovation énergétique, borne électrique)',
    'Location : micro-foncier vs régime réel, micro-BIC vs réel, déficits fonciers',
    "Comparaison multi-années et détection des cases perdues",
  ],
  unknown: [
    'La véracité des montants déclarés (nous ne vérifions pas vos justificatifs)',
    'Les montages fiscaux complexes (SCI à l\u2019IS, démembrement, pactes Dutreil)',
    'Les situations internationales (conventions fiscales, revenus étrangers)',
  ],
}

const MONIMPOT_METHODOLOGY = [
  'Calcul basé sur le barème progressif 2026 (revenus 2025) et les plafonds légaux en vigueur.',
  'Les économies sont des estimations — le montant réel dépend de votre situation exacte.',
]

export default function MonimpotPage() {
  const [parcours, setParcours] = useState<Parcours>('choix')
  const [step, setStep] = useState<Step>('parcours')
  const [extractResult, setExtractResult] = useState<MonimpotExtractResult | null>(null)
  const [result, setResult] = useState<MonimpotPreDiagResponse | null>(null)
  const [isSubmittingV3, setIsSubmittingV3] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Extraction principale (mono ou multi-avis)
  const primaryExtraction: AvisImpositionExtracted | undefined =
    extractResult?.extraction ?? extractResult?.multiAvis?.avis?.[0]

  // ─── Choix du parcours ───

  const handleChoixUpload = () => {
    setParcours('upload')
    setStep('upload')
    track({ event: 'form_started', brique: 'monimpot', mode: 'upload' })
    scrollTo('parcours-content')
  }

  const handleChoixFormulaire = () => {
    setParcours('formulaire')
    setStep('formulaire-v3')
    track({ event: 'form_started', brique: 'monimpot', mode: 'formulaire_v3' })
    scrollTo('parcours-content')
  }

  // ─── Handlers Chemin A (Upload) ───

  const handleExtractionComplete = (data: MonimpotExtractResult) => {
    setExtractResult(data)
    setStep('extraction')
    scrollTo('extraction')
  }

  const handleExtractionConfirm = () => {
    setStep('smart-form')
    scrollTo('smart-form')
  }

  const handleExtractionEdit = () => {
    setStep('manual-form')
    scrollTo('form')
  }

  const handleManualMode = () => {
    setStep('manual-form')
    scrollTo('form')
  }

  const handlePreDiagComplete = (data: MonimpotPreDiagResponse) => {
    setResult(data)
    setStep('result')
    scrollTo('resultat')
  }

  const handleManualResult = (data: MonimpotPreDiagResponse) => {
    setResult(data)
    setStep('result')
    scrollTo('resultat')
  }

  // ─── Handler Chemin B (Formulaire V3) ───

  const handleFormV3Complete = async (formData: Partial<FormComplet>, realtimeResult: ResultatTempsReel) => {
    setIsSubmittingV3(true)
    setSubmitError(null)
    try {
      // Mapper FormComplet → MonimpotFormData pour le pre-diagnostic existant
      const fullCalc = computeFullCalculations(formData)
      const mapped: MonimpotFormData = {
        situation: formData.situation || 'celibataire',
        vivezSeul: formData.vivezSeul || false,
        enfantsMineurs: formData.enfantsMineurs || 0,
        enfantsMajeurs: formData.enfantsMajeursRattaches || 0,
        eleveSeul5ans: formData.eleveSeul5ans || false,
        age: formData.ageDeclarant1 || 35,
        invalidite: formData.invaliditeD1 || false,
        revenuNetImposable: fullCalc.revenuNetImposable,
        nbParts: fullCalc.parts,
        impotPaye: formData.impotPayeActuel ?? realtimeResult.impotActuel,
        typeRevenus: formData.typeRevenusD1 === 'retraite' ? 'retraite'
          : formData.typeRevenusD1 === 'independant' ? 'independant' : 'salaires',
        fraisReels: false,  // Toujours false en V3 pour que l'anomaly-detection puisse evaluer
        distanceTravail: formData.distanceTravail,
        puissanceFiscale: typeof formData.puissanceFiscale === 'string'
          ? parseInt(formData.puissanceFiscale) : formData.puissanceFiscale,
        teletravail: formData.teletravail,
        joursTeletravail: formData.joursTeletravail,
        pensionAlimentaire: formData.pensionAlimentaireVersee || false,
        pensionMontantMois: formData.pensionAlimentaireMontant
          ? Math.round(formData.pensionAlimentaireMontant / 12) : undefined,
        dons: formData.donsAssociations || false,
        donsMontantAn: formData.donsAssociationsMontant,
        emploiDomicile: formData.emploiDomicile || false,
        emploiDomicileMontantAn: formData.emploiDomicileMontant,
        gardeEnfant: formData.gardeEnfant || false,
        gardeMontantAn: formData.gardeEnfantMontant,
        ehpad: formData.ehpad || false,
        ehpadMontantAn: formData.ehpadMontant,
        per: formData.perVersements || false,
        perMontantAn: formData.perMontant,
        revenusCapitaux: formData.aPlacementsFinanciers || false,
        case2op: false,

        // Phase 3 fields
        enfantsCollege: formData.enfantsCollege,
        enfantsLycee: formData.enfantsLycee,
        enfantsSuperieur: formData.enfantsSuperieur,
        cotisationsSyndicales: formData.cotisationsSyndicales,
        pinelMontant: formData.pinelMontant,
        outreMerMontant: formData.outreMer,
        investForestier: formData.investForestier,
        renovationEnergetique: formData.renovationEnergetique,
        borneElectriqueMontant: formData.borneElectriqueMontant,
        pretEtudiantMontant: formData.pretEtudiant,
        loyersBruts: formData.loyersBrutsAn,
        chargesLocatives: formData.chargesLocatives,
        locationMeubleeCA: formData.locationMeubleeCA,
        csgDeductibleMontant: formData.csgDeductible,
        prestationCompensatoireMontant: formData.prestationCompensatoire,
        domTom: formData.domTom,
        deficitsFonciersAnterieurs: formData.deficitsFonciersAnterieurs,

        email: formData.email || '',
      }

      // Appel au pré-diagnostic existant
      const resp = await fetch('/api/monimpot/pre-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapped),
      })

      const data = await resp.json()
      if (data.success) {
        setResult(data)
        setStep('result')
        scrollTo('resultat')
      } else {
        console.error('[monimpot] V3 pre-diagnostic error:', data.error, data.details)
        // Afficher les erreurs de validation si disponibles
        if (data.details && typeof data.details === 'object') {
          const fieldErrors = Object.entries(data.details)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' · ')
          setSubmitError(`Certaines données semblent incorrectes (${fieldErrors}). Veuillez vérifier et réessayer.`)
        } else {
          setSubmitError('Une erreur est survenue lors de l\u2019analyse. Vos données sont conservées — réessayez.')
        }
      }
    } catch (err) {
      console.error('[monimpot] V3 submit error:', err)
      setSubmitError('Erreur de connexion. Vos données sont conservées — vérifiez votre connexion et réessayez.')
    } finally {
      setIsSubmittingV3(false)
    }
  }

  // ─── Retour au choix ───

  const handleRetourChoix = () => {
    setParcours('choix')
    setStep('parcours')
    setExtractResult(null)
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollTo = (id: string) => {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 200)
  }

  return (
    <div>
      <MonimpotHero />

      {/* ═══ CHOIX DU PARCOURS ═══ */}
      {step === 'parcours' && (
        <section id="parcours-choix" className="max-w-[900px] mx-auto px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy text-center mb-3">
            Comment voulez-vous commencer ?
          </h2>
          <p className="text-center text-slate-500 mb-10 max-w-[600px] mx-auto">
            Deux chemins, un même résultat : trouvez les économies cachées dans votre déclaration.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Chemin A — Upload */}
            <button
              onClick={handleChoixUpload}
              className="group relative bg-white border-2 border-slate-200 rounded-2xl p-8 text-left hover:border-emerald-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                Recommandé
              </div>
              <div className="text-4xl mb-4">📄</div>
              <h3 className="font-heading text-xl font-bold text-navy mb-2">
                J&apos;ai mon avis d&apos;imposition
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Uploadez votre PDF (téléchargé depuis impots.gouv.fr).
                L&apos;extraction est <span className="font-semibold text-emerald-600">instantanée</span> et
                détecte automatiquement les cases remplies et manquantes.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>⚡ Instantané</span>
                <span>📊 Multi-années</span>
                <span>🎯 Plus précis</span>
              </div>
              <div className="mt-4 text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Commencer avec mon avis →
              </div>
            </button>

            {/* Chemin B — Formulaire */}
            <button
              onClick={handleChoixFormulaire}
              className="group bg-white border-2 border-slate-200 rounded-2xl p-8 text-left hover:border-emerald-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-heading text-xl font-bold text-navy mb-2">
                Je n&apos;ai pas mon avis sous la main
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Répondez à un formulaire adaptatif en français simple.
                Le calcul se fait <span className="font-semibold text-emerald-600">en temps réel</span> à
                chaque réponse. 2 à 8 minutes selon votre situation.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>📝 2-8 min</span>
                <span>🔄 Temps réel</span>
                <span>🆓 Sans document</span>
              </div>
              <div className="mt-4 text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Commencer le formulaire →
              </div>
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Les deux parcours aboutissent au même résultat : vérification gratuite + audit détaillé si optimisations détectées.
          </p>
        </section>
      )}

      {/* ═══ CHEMIN A — UPLOAD ═══ */}
      <div id="parcours-content">
        {step === 'upload' && parcours === 'upload' && (
          <>
            <BriqueHowItWorks steps={MONIMPOT_STEPS_UPLOAD} />
            <TrustBadgesCompact />
            <MonimpotUpload
              onExtractionComplete={handleExtractionComplete}
              onManualMode={handleManualMode}
            />
            <BackButton onClick={handleRetourChoix} />
          </>
        )}

        {step === 'extraction' && extractResult && (
          <div id="extraction">
            <MonimpotExtraction
              extraction={extractResult.extraction}
              multiAvis={extractResult.multiAvis}
              casesVidesDetails={extractResult.casesVidesDetails}
              onConfirm={handleExtractionConfirm}
              onEdit={handleExtractionEdit}
            />
          </div>
        )}

        {step === 'smart-form' && extractResult && primaryExtraction && (
          <div id="smart-form">
            <MonimpotSmartForm
              extractedData={mapExtractionToFormData(primaryExtraction)}
              extraction={primaryExtraction}
              casesVidesDetails={extractResult.casesVidesDetails}
              multiAvis={extractResult.multiAvis?.avis}
              onPreDiagComplete={handlePreDiagComplete}
            />
          </div>
        )}

        {step === 'manual-form' && (
          <div id="form">
            <MonimpotForm onResult={handleManualResult} initialData={primaryExtraction ? mapExtractionToFormData(primaryExtraction) : undefined} />
            <BackButton onClick={handleRetourChoix} />
          </div>
        )}

        {/* ═══ CHEMIN B — FORMULAIRE V3 ═══ */}
        {step === 'formulaire-v3' && parcours === 'formulaire' && (
          <>
            <BriqueHowItWorks steps={MONIMPOT_STEPS_FORMULAIRE} />
            <section id="formulaire-v3" className="max-w-[900px] mx-auto px-6 py-12">
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <p className="font-medium mb-1">⚠️ {submitError}</p>
                  <button
                    onClick={() => setSubmitError(null)}
                    className="text-red-600 underline hover:text-red-800"
                  >
                    Fermer
                  </button>
                </div>
              )}
              {isSubmittingV3 ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
                  <p className="text-slate-500">Analyse en cours...</p>
                </div>
              ) : (
                <SmartFormV3
                  mode="standalone"
                  onComplete={handleFormV3Complete}
                />
              )}
            </section>
            <BackButton onClick={handleRetourChoix} />
          </>
        )}

        {/* ═══ RÉSULTAT (commun aux 2 chemins) ═══ */}
        {step === 'result' && result && (
          <div id="resultat">
            <MonimpotPreDiag result={result} />
            <div className="max-w-[680px] mx-auto px-6">
              <MethodologyNote lines={MONIMPOT_METHODOLOGY} />
            </div>

            {result.hasOptimisations && result.totalOptimisations > 0 && result.economieAnnuelle > 0 && (
              <>
                <ShareBlock brique="monimpot" montant={result.economie3ans} />
                <MonimpotPaywall
                  diagnosticId={result.diagnosticId}
                  economie3ans={result.economie3ans}
                  economieAnnuelle={result.economieAnnuelle}
                  sensitiveData={extractResult?.sensitive}
                  totalOptimisations={result.totalOptimisations}
                />
              </>
            )}

            <TransparencyBlock data={MONIMPOT_TRANSPARENCY} />
          </div>
        )}
      </div>

      <ReviewJsonLd brique="monimpot" briqueName="Audit declaration de revenus" />
      <ReviewSection brique="monimpot" />
      <CrossSellBriques currentBrique="monimpot" />
      <TrustBanner />
      <MonimpotFAQ />
      <LegalDisclaimer brique="monimpot" />
    </div>
  )
}

// ─── Bouton retour ───

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="max-w-[700px] mx-auto px-6 py-4">
      <button
        onClick={onClick}
        className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        ← Revenir au choix du parcours
      </button>
    </div>
  )
}
