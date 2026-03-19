'use client'
import { useState } from 'react'
import { track } from '@/lib/analytics'
import { fmt } from '@/lib/format'
import type { MonimpotFormData } from '@/lib/monimpot/types'
import type { AvisImpositionExtracted } from '@/lib/monimpot/extract-types'
import type { CaseVide } from '@/lib/monimpot/extract-mapper'
import type { MonimpotPreDiagResponse } from '@/lib/monimpot/types'

interface Props {
  extractedData: Partial<MonimpotFormData>
  extraction: AvisImpositionExtracted
  casesVidesDetails: CaseVide[]
  multiAvis?: AvisImpositionExtracted[]
  onPreDiagComplete: (result: MonimpotPreDiagResponse) => void
}

interface SmartAnswers {
  // Cases vides → montants
  fraisReels_distance?: number
  fraisReels_puissance?: number
  fraisReels_teletravail?: boolean
  fraisReels_joursTeletravail?: number
  pensionMontantMois?: number
  donsMontantAn?: number
  emploiDomicileMontantAn?: number
  gardeMontantAn?: number
  ehpadMontantAn?: number
  perMontantAn?: number
  investPMEMontant?: number
  // Questions complémentaires
  vivezSeul?: boolean
  eleveSeul5ans?: boolean
  age?: number
  // Toujours demandé
  email: string
}

export function MonimpotSmartForm({ extractedData, extraction, casesVidesDetails, multiAvis, onPreDiagComplete }: Props) {
  const [answers, setAnswers] = useState<SmartAnswers>({ email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Détecter quelles questions complémentaires poser
  const sit = extraction.situationFamiliale
  const showVivezSeul = (sit === 'C' || sit === 'D' || sit === 'V') && extraction.nbPersonnesCharge > 0 && !extraction.caseT
  const showEleveSeul = !extraction.caseL && extraction.nbPersonnesCharge === 0 && (sit === 'C' || sit === 'D' || sit === 'V')

  // Grouper les cases vides en "activables" (l'utilisateur répond oui/non puis montant)
  const caseQuestions = casesVidesDetails.filter(cv => cv.key !== 'case2OP')

  const update = <K extends keyof SmartAnswers>(key: K, val: SmartAnswers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async () => {
    // email optionnel — pas de validation bloquante
    if (!answers.age || answers.age < 18) {
      setError('Veuillez indiquer votre âge')
      return
    }

    setLoading(true)
    setError(null)
    track({ event: 'form_submitted', brique: 'monimpot', questions_answered: Object.keys(answers).length })

    try {
      // Merger extracted + answers → MonimpotFormData
      const merged: MonimpotFormData = {
        situation: extractedData.situation || 'celibataire',
        vivezSeul: answers.vivezSeul ?? false,
        enfantsMineurs: extractedData.enfantsMineurs ?? 0,
        enfantsMajeurs: extractedData.enfantsMajeurs ?? 0,
        eleveSeul5ans: answers.eleveSeul5ans ?? extractedData.eleveSeul5ans ?? false,
        age: answers.age || 40,
        invalidite: extractedData.invalidite ?? false,

        revenuNetImposable: extractedData.revenuNetImposable || extraction.revenuNetImposable,
        nbParts: extractedData.nbParts || extraction.nbPartsDeclarees,
        impotPaye: extractedData.impotPaye || extraction.impotNet,
        typeRevenus: extractedData.typeRevenus || 'salaires',

        fraisReels: (answers.fraisReels_distance ?? 0) > 0,
        distanceTravail: answers.fraisReels_distance,
        puissanceFiscale: answers.fraisReels_puissance,
        teletravail: answers.fraisReels_teletravail,
        joursTeletravail: answers.fraisReels_joursTeletravail,

        pensionAlimentaire: (answers.pensionMontantMois ?? 0) > 0,
        pensionMontantMois: answers.pensionMontantMois,

        dons: (answers.donsMontantAn ?? 0) > 0,
        donsMontantAn: answers.donsMontantAn,

        emploiDomicile: (answers.emploiDomicileMontantAn ?? 0) > 0,
        emploiDomicileMontantAn: answers.emploiDomicileMontantAn,

        gardeEnfant: (answers.gardeMontantAn ?? 0) > 0,
        gardeMontantAn: answers.gardeMontantAn,

        ehpad: (answers.ehpadMontantAn ?? 0) > 0,
        ehpadMontantAn: answers.ehpadMontantAn,

        per: (answers.perMontantAn ?? 0) > 0,
        perMontantAn: answers.perMontantAn,

        revenusCapitaux: extractedData.revenusCapitaux ?? false,
        case2op: extractedData.case2op,

        email: answers.email,
      }

      const res = await fetch('/api/monimpot/pre-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...merged,
          rfr: extraction.rfr,
          extractedCases: extraction.casesRenseignees,
          isFromExtraction: true,
          extractedRevenusCapitaux: typeof extraction.revenusCapitaux === 'number' ? extraction.revenusCapitaux : undefined,
          ...(multiAvis && multiAvis.length > 1 ? { multiAvis } : {}),
        }),
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Erreur lors du pré-diagnostic')
        setLoading(false)
        return
      }

      track({
        event: 'prediag_generated',
        brique: 'monimpot',
        mode: 'smart_form',
        optimisations: data.totalOptimisations,
        economie: data.economieAnnuelle,
      })

      onPreDiagComplete(data)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-slate-bg">
      <div className="max-w-[620px] mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="font-heading text-[clamp(22px,3.5vw,30px)] font-bold text-slate-text mb-2">
            Quelques questions pour affiner votre diagnostic
          </h2>
          <p className="text-sm text-slate-muted max-w-[460px] mx-auto">
            Nous avons extrait vos données fiscales automatiquement. Il ne reste que <strong className="text-emerald">{caseQuestions.length + 2} questions</strong> pour détecter toutes les optimisations.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-border p-6 space-y-6">

          {/* Rappel données extraites */}
          <div className="p-4 bg-emerald/5 rounded-xl border border-emerald/15">
            <p className="text-xs font-semibold text-emerald-dark mb-1">✅ Données extraites automatiquement</p>
            <p className="text-xs text-slate-muted">
              Revenus {extraction.annee} : <strong>{fmt(extraction.revenuNetImposable)}€</strong> net imposable · <strong>{extraction.nbPartsDeclarees} parts</strong> · Impôt annuel : <strong>{fmt(extraction.impotNet)}€</strong>
            </p>
          </div>

          {/* Question : Âge */}
          <QuestionBlock
            label="Quel est votre âge ?"
            hint="Utile pour l'abattement seniors (65+) et la décote"
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 42"
              value={answers.age || ''}
              onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); update('age', v ? parseInt(v) : undefined) }}
              className="px-4 py-3 border border-slate-200 rounded-xl text-navy text-sm placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald w-32"
            />
          </QuestionBlock>

          {/* Question conditionnelle : Vivez-vous seul(e) ? */}
          {showVivezSeul && (
            <QuestionBlock
              label="Vivez-vous seul(e) avec vos enfants ?"
              hint="La case T (parent isolé) vous donnerait une demi-part supplémentaire"
              highlight
            >
              <YesNo value={answers.vivezSeul} onChange={(v) => update('vivezSeul', v)} />
            </QuestionBlock>
          )}

          {/* Question conditionnelle : Élevé seul 5 ans */}
          {showEleveSeul && (
            <QuestionBlock
              label="Avez-vous élevé seul(e) un enfant pendant 5 ans ou plus ?"
              hint="La case L vous donne une demi-part même après le départ de l'enfant"
              highlight
            >
              <YesNo value={answers.eleveSeul5ans} onChange={(v) => update('eleveSeul5ans', v)} />
            </QuestionBlock>
          )}

          {/* Questions pour chaque case vide */}
          {caseQuestions.map(cv => (
            <CaseVideQuestion
              key={cv.key}
              caseVide={cv}
              answers={answers}
              update={update}
              extraction={extraction}
            />
          ))}

          {/* Email (toujours) */}
          <QuestionBlock label="Votre email (optionnel)" hint="Pour recevoir un rappel avant la campagne déclarative">
            <input
              type="email"
              placeholder="nom@exemple.fr"
              value={answers.email}
              onChange={(e) => update('email', e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl text-navy text-sm placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald w-full"
            />
          </QuestionBlock>

          {/* Erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="cta-primary w-full justify-center disabled:opacity-50"
          >
            {loading ? 'Analyse en cours...' : 'Lancer ma vérification gratuite →'}
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Sous-composants ───

function QuestionBlock({ label, hint, highlight, children }: {
  label: string
  hint?: string
  highlight?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`${highlight ? 'p-4 bg-amber-50/50 rounded-xl border border-amber-200/50' : ''}`}>
      <label className="block text-sm font-semibold text-slate-text mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-muted mb-2">{hint}</p>}
      {children}
    </div>
  )
}

function YesNo({ value, onChange }: { value?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {[
        { label: 'Oui', val: true },
        { label: 'Non', val: false },
      ].map(opt => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.val)}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all border ${
            value === opt.val
              ? 'bg-emerald text-white border-emerald'
              : 'bg-white text-slate-text border-slate-border hover:border-emerald/40'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function CaseVideQuestion({ caseVide, answers, update, extraction }: {
  caseVide: CaseVide
  answers: SmartAnswers
  update: <K extends keyof SmartAnswers>(key: K, val: SmartAnswers[K]) => void
  extraction: AvisImpositionExtracted
}) {
  const key = caseVide.key

  // Frais réels → questions spécifiques (distance, puissance, télétravail)
  if (key === 'fraisReels1AK' && (extraction.salairesTraitements ?? 0) > 0) {
    return (
      <QuestionBlock
        label="Vos frais de trajet domicile-travail"
        hint="Si vos frais réels dépassent l'abattement de 10%, vous économisez de l'impôt"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-muted w-40 shrink-0">Distance aller (km)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 25"
              value={answers.fraisReels_distance || ''}
              onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); update('fraisReels_distance', v ? parseInt(v) : undefined) }}
              className="px-4 py-3 border border-slate-200 rounded-xl text-navy text-sm placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald w-24"
            />
          </div>
          {(answers.fraisReels_distance ?? 0) > 0 && (
            <>
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-muted w-40 shrink-0">Puissance fiscale (CV)</label>
                <select
                  value={answers.fraisReels_puissance || ''}
                  onChange={(e) => update('fraisReels_puissance', parseInt(e.target.value) || undefined)}
                  className="px-4 py-3 border border-slate-200 rounded-xl text-navy text-sm placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald w-24"
                >
                  <option value="">—</option>
                  {[3, 4, 5, 6, 7].map(cv => (
                    <option key={cv} value={cv}>{cv} CV</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-muted w-40 shrink-0">Télétravail ?</label>
                <YesNo
                  value={answers.fraisReels_teletravail}
                  onChange={(v) => update('fraisReels_teletravail', v)}
                />
              </div>
              {answers.fraisReels_teletravail && (
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-muted w-40 shrink-0">Jours/semaine</label>
                  <select
                    value={answers.fraisReels_joursTeletravail || 1}
                    onChange={(e) => update('fraisReels_joursTeletravail', parseInt(e.target.value))}
                    className="px-4 py-3 border border-slate-200 rounded-xl text-navy text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald w-24"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </QuestionBlock>
    )
  }

  // Autres cases → question simple montant
  const MONTANT_KEYS: Record<string, keyof SmartAnswers> = {
    pensionVersee6EL: 'pensionMontantMois',
    dons7UF: 'donsMontantAn',
    emploiDomicile7DB: 'emploiDomicileMontantAn',
    gardeEnfant7GA: 'gardeMontantAn',
    ehpad7CD: 'ehpadMontantAn',
    per6NS: 'perMontantAn',
    investPME7CF: 'investPMEMontant',
  }

  const montantKey = MONTANT_KEYS[key]
  if (!montantKey) return null

  const isPension = key === 'pensionVersee6EL'

  return (
    <QuestionBlock label={caseVide.question}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={(answers[montantKey] as number) ? String(answers[montantKey]).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0') : ''}
          onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); update(montantKey, v ? parseInt(v) : undefined) }}
          className="px-4 py-3 border border-slate-200 rounded-xl text-navy text-sm placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald w-32"
        />
        <span className="text-xs text-slate-muted">{isPension ? '€/mois' : '€/an'}</span>
      </div>
    </QuestionBlock>
  )
}
