'use client'
// ============================================================
// MONIMPÔT V3 — Formulaire intelligent adaptatif (Chemin B)
// 10 étapes, calcul temps réel, 0 appel API
// ============================================================

import { useState, useCallback, useMemo, useEffect } from 'react'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'
import {
  type FormComplet,
  type ResultatTempsReel,
  ETAPES,
  defaultFormComplet,
} from '@/lib/monimpot/form-complet-types'
import {
  type FormQuestion,
  getQuestionsForEtape,
  computeProgression,
  isEtapeComplete,
  getNextEtape,
  getPrevEtape,
} from '@/lib/monimpot/questions-bank'
import { computeFullCalculations, getTMI } from '@/lib/monimpot/calculations-complet'

// ─── PROPS ───

interface SmartFormV3Props {
  mode: 'standalone' | 'post-extraction'
  extractedData?: Partial<FormComplet>
  onComplete: (data: Partial<FormComplet>, result: ResultatTempsReel) => void
}

// ─── COMPOSANT PRINCIPAL ───

export default function SmartFormV3({ mode, extractedData, onComplete }: SmartFormV3Props) {
  const [formData, setFormData] = useState<Partial<FormComplet>>({
    ...defaultFormComplet(),
    ...extractedData,
  })
  const [etape, setEtape] = useState(1)
  const [maxEtape, setMaxEtape] = useState(1)
  const [showInfobox, setShowInfobox] = useState<string | null>(null)

  // Persistance sessionStorage — ne jamais perdre les données
  const STORAGE_KEY = 'recupeo_monimpot_v3'

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.formData) setFormData(prev => ({ ...prev, ...parsed.formData }))
        if (parsed.etape) setEtape(parsed.etape)
        if (parsed.maxEtape) setMaxEtape(parsed.maxEtape)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, etape, maxEtape }))
    } catch {}
  }, [formData, etape, maxEtape])

  // Calcul temps réel
  const calc = useMemo(() => computeFullCalculations(formData), [formData])
  const progression = useMemo(() => computeProgression(formData), [formData])
  const questions = useMemo(() => getQuestionsForEtape(etape, formData), [etape, formData])
  const etapeComplete = useMemo(() => isEtapeComplete(etape, formData), [etape, formData])

  // Compteur d'optimisations détectées côté client
  const clientOptimisations = useMemo(() => {
    const opts: string[] = []
    let eco = 0
    const revParPart = calc.revenuNetImposable > 0 && calc.parts > 0
      ? calc.revenuNetImposable / calc.parts : 0
    const tmi = getTMI(revParPart) || 0.11
    if (calc.fraisReelsPlusAvantageux && calc.gainFraisReels > 50) {
      opts.push('Frais réels')
      eco += Math.round(calc.gainFraisReels * tmi)
    }
    if ((formData.enfantsCollege || 0) > 0) { opts.push('Scolarité collège'); eco += (formData.enfantsCollege || 0) * 61 }
    if ((formData.enfantsLycee || 0) > 0) { opts.push('Scolarité lycée'); eco += (formData.enfantsLycee || 0) * 153 }
    if ((formData.enfantsSuperieur || 0) > 0) { opts.push('Scolarité supérieur'); eco += (formData.enfantsSuperieur || 0) * 183 }
    if ((formData.cotisationsSyndicales || 0) > 0) { opts.push('Syndicat'); eco += Math.round((formData.cotisationsSyndicales || 0) * 0.66) }
    if ((formData.donsAssociationsMontant || 0) > 0) { opts.push('Dons'); eco += Math.round((formData.donsAssociationsMontant || 0) * 0.66) }
    if ((formData.emploiDomicileMontant || 0) > 0) { opts.push('Emploi domicile'); eco += Math.round(Math.min(formData.emploiDomicileMontant || 0, 12000) * 0.50) }
    if ((formData.gardeEnfantMontant || 0) > 0) { opts.push('Garde enfant'); eco += Math.round(Math.min(formData.gardeEnfantMontant || 0, 3500) * 0.50) }
    if ((formData.perMontant || 0) > 0) { opts.push('PER'); eco += Math.round((formData.perMontant || 0) * tmi) }
    return { count: opts.length, eco, labels: opts }
  }, [formData, calc])

  // Mise à jour d'un champ
  const updateField = useCallback((field: keyof FormComplet, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Navigation
  const goNext = useCallback(() => {
    if (etape === 10) {
      // Submit
      if (!formData.confirmeExactitude) return
      const result: ResultatTempsReel = {
        impotActuel: calc.impotNet,
        impotOptimise: calc.impotOptimise,
        economie: calc.economieAnnuelle,
        optimisationsCount: 0,
        progression: 100,
        etapeActuelle: 10,
      }
      track({ event: 'form_submitted', brique: 'monimpot', mode: 'smart_form_v3' })
      try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
      onComplete(formData, result)
      return
    }
    const next = getNextEtape(etape, formData)
    track({ event: 'form_step_completed', brique: 'monimpot', step: etape })
    setEtape(next)
    setMaxEtape(prev => Math.max(prev, next))
    document.getElementById('smartform-v3-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [etape, formData, calc, progression, onComplete])

  const goPrev = useCallback(() => {
    const prev = getPrevEtape(etape, formData)
    setEtape(prev)
    document.getElementById('smartform-v3-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [etape, formData])

  // Vérif champs obligatoires sur l'étape courante
  const hasRequiredMissing = useMemo(() => {
    return questions.some(q => {
      if (!q.required) return false
      const val = formData[q.field]
      if (val === undefined || val === '' || val === 0) return true
      // Vérifier les bornes min/max pour les champs numériques
      if (typeof val === 'number' && q.min !== undefined && val < q.min) return true
      if (typeof val === 'number' && q.max !== undefined && val > q.max) return true
      return false
    })
  }, [questions, formData])

  const etapeInfo = ETAPES[etape - 1]

  return (
    <div id="smartform-v3-top" className="max-w-[700px] mx-auto scroll-mt-24">
      {/* ─── Barre progression ─── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">
            Étape {etape}/10 — {etapeInfo.titre}
          </span>
          <span className="text-sm text-slate-500">{Math.round(((maxEtape - 1) / 10) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.round(((maxEtape - 1) / 10) * 100)}%` }}
          />
        </div>
        {/* Étapes miniatures */}
        <div className="flex justify-between mt-2">
          {ETAPES.map(e => (
            <button
              key={e.numero}
              onClick={() => { if (e.numero <= maxEtape) { setEtape(e.numero); setTimeout(() => document.getElementById('smartform-v3-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100) } }}
              className={`w-8 h-8 rounded-full text-xs flex items-center justify-center transition-colors ${
                e.numero === etape
                  ? 'bg-emerald-500 text-white'
                  : e.numero <= maxEtape
                  ? 'bg-emerald-100 text-emerald-700 cursor-pointer hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
              disabled={e.numero > maxEtape}
              title={e.titre}
            >
              {e.icone}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Titre étape ─── */}
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-navy">
          {etapeInfo.icone} {etapeInfo.titre}
        </h2>
        <p className="text-slate-500 mt-1">{etapeInfo.sousTitre}</p>
      </div>

      {/* ─── Questions ─── */}
      {etape < 10 ? (
        <div className="space-y-6">
          {questions.map(q => (
            <QuestionField
              key={q.id}
              question={q}
              value={formData[q.field]}
              onChange={(val) => updateField(q.field, val)}
              showInfobox={showInfobox}
              setShowInfobox={setShowInfobox}
            />
          ))}

          {questions.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p>Aucune question pour cette étape selon vos réponses.</p>
              <p className="text-sm mt-1">Passez à l&apos;étape suivante.</p>
            </div>
          )}
        </div>
      ) : (
        /* ─── Étape 10 : Récapitulatif ─── */
        <RecapStep formData={formData} calc={calc} updateField={updateField} clientOptimisations={clientOptimisations} />
      )}

      {/* ─── Indicateur économie ─── */}
      {calc.impotNet > 0 && etape > 3 && (
        <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 font-medium">Impôt estimé en temps réel</p>
              <p className="text-2xl font-bold text-emerald-700">{fmt(calc.impotNet)} €</p>
            </div>
            {clientOptimisations.count > 0 && (
              <div className="text-right">
                <p className="text-sm text-emerald-600">{clientOptimisations.count} avantage{clientOptimisations.count > 1 ? 's' : ''} fiscal{clientOptimisations.count > 1 ? 'aux' : ''} identifié{clientOptimisations.count > 1 ? 's' : ''}</p>
                <p className="text-lg font-bold text-emerald-600">-{fmt(clientOptimisations.eco)} €</p>
              </div>
            )}
          </div>
          {clientOptimisations.count > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {clientOptimisations.labels.map(l => (
                <span key={l} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{l}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Navigation ─── */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={goPrev}
          disabled={etape === 1}
          className="px-6 py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Précédent
        </button>

        <button
          onClick={goNext}
          disabled={(etape === 10 && !formData.confirmeExactitude) || (etape < 10 && hasRequiredMissing)}
          className="cta-primary px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {etape === 10 ? 'Voir mon résultat →' : hasRequiredMissing ? 'Complétez les champs obligatoires' : 'Suivant →'}
        </button>
      </div>
    </div>
  )
}

// ─── COMPOSANT QUESTION ───

// Formatage milliers style FR : 30000 → "30 000"
function formatMontant(val: number | string | undefined): string {
  if (val === undefined || val === '' || val === 0) return ''
  const num = typeof val === 'string' ? parseInt(val, 10) : val
  if (isNaN(num) || num === 0) return ''
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
}

function QuestionField({
  question: q,
  value,
  onChange,
  showInfobox,
  setShowInfobox,
}: {
  question: FormQuestion
  value: any
  onChange: (val: any) => void
  showInfobox: string | null
  setShowInfobox: (id: string | null) => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
      <label className="block mb-3">
        <span className="font-heading text-base font-semibold text-navy">{q.question}</span>
        {q.aide && (
          <span className="block text-sm text-slate-500 mt-1">{q.aide}</span>
        )}
      </label>

      {/* Infobox */}
      {q.infobox && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {q.infobox}
        </div>
      )}

      {/* Input selon le type */}
      {q.type === 'oui_non' && (
        <div className="flex gap-3">
          <button
            onClick={() => onChange(true)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
              value === true
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            Oui
          </button>
          <button
            onClick={() => onChange(false)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
              value === false
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            Non
          </button>
        </div>
      )}

      {q.type === 'choix' && q.options && (
        <div className="grid gap-2">
          {q.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`w-full text-left py-3 px-4 rounded-xl border-2 transition-all ${
                String(value) === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {q.type === 'nombre' && (q.max ?? 99) <= 20 && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(Math.max(q.min ?? 0, (value ?? 0) - 1))}
            className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 text-xl font-bold hover:border-emerald-400 hover:text-emerald-600 transition-colors select-none"
          >
            −
          </button>
          <span className="text-2xl font-bold text-navy min-w-[3rem] text-center">{value ?? 0}</span>
          <button
            type="button"
            onClick={() => onChange(Math.min(q.max ?? 99, (value ?? 0) + 1))}
            className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 text-xl font-bold hover:border-emerald-400 hover:text-emerald-600 transition-colors select-none"
          >
            +
          </button>
          {q.unite && <span className="text-slate-400 text-sm ml-1">{q.unite}</span>}
        </div>
      )}

      {q.type === 'nombre' && (q.max ?? 99) > 20 && (
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={value === undefined || value === '' ? '' : String(value)}
            onChange={e => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              onChange(raw === '' ? undefined : Number(raw))
            }}
            placeholder={q.placeholder || ''}
            className="w-full py-3 px-4 pr-14 border-2 border-slate-200 rounded-xl text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors"
          />
          {q.unite && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              {q.unite}
            </span>
          )}
        </div>
      )}

      {(q.type === 'montant' || q.type === 'distance') && (
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={formatMontant(value)}
            onChange={e => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              onChange(raw === '' ? undefined : Number(raw))
            }}
            placeholder={q.placeholder || ''}
            className={`w-full py-3 px-4 pr-14 border-2 rounded-xl text-lg outline-none transition-colors ${
              q.required && (value === undefined || value === '' || value === 0)
                ? 'border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            {q.unite || ''}
            {q.required && (value === undefined || value === '' || value === 0) && (
              <span className="text-emerald-500 ml-1">*</span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── RÉCAPITULATIF (Étape 10) ───

function RecapStep({
  formData,
  calc,
  updateField,
  clientOptimisations,
}: {
  formData: Partial<FormComplet>
  calc: ReturnType<typeof computeFullCalculations>
  updateField: (field: keyof FormComplet, value: any) => void
  clientOptimisations: { count: number; eco: number; labels: string[] }
}) {
  const situationLabel: Record<string, string> = {
    celibataire: 'Célibataire',
    marie_pacse: 'Marié(e) / Pacsé(e)',
    divorce_separe: 'Divorcé(e) / Séparé(e)',
    veuf: 'Veuf / Veuve',
  }

  // Pistes personnalisées selon le profil (sans montants)
  const pistes: string[] = []
  if (calc.revenuNetImposable > 30000 && formData.typeRevenusD1 !== 'retraite')
    pistes.push('Frais réels vs abattement 10%')
  if ((formData.enfantsMineurs || 0) > 0) pistes.push('Crédits garde / scolarité')
  if (formData.situation === 'celibataire' || formData.situation === 'divorce_separe')
    pistes.push('Demi-part parent isolé (case T/L)')
  if ((formData.ageDeclarant1 || 0) >= 65) pistes.push('Abattement seniors 65+')
  if (formData.aPlacementsFinanciers) pistes.push('PFU vs barème (case 2OP)')
  if (!formData.perVersements) pistes.push('Épargne retraite PER')
  // Toujours au moins une piste
  if (pistes.length === 0) pistes.push('Déductions et réductions oubliées')

  return (
    <div className="space-y-6">
      {/* Résumé profil */}
      <div className="bg-slate-50 rounded-xl p-5 space-y-3">
        <h3 className="font-heading font-bold text-navy">Votre profil fiscal</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-slate-500">Situation :</span> {situationLabel[formData.situation || ''] || formData.situation}</div>
          <div><span className="text-slate-500">Âge :</span> {formData.ageDeclarant1} ans</div>
          <div><span className="text-slate-500">Parts :</span> {calc.parts}</div>
          <div><span className="text-slate-500">Enfants :</span> {formData.enfantsMineurs || 0}</div>
        </div>
      </div>

      {/* Revenus */}
      <div className="bg-slate-50 rounded-xl p-5 space-y-3">
        <h3 className="font-heading font-bold text-navy">Vos revenus</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {calc.revenusSalaires > 0 && <div><span className="text-slate-500">Salaires :</span> {fmt(calc.revenusSalaires)} €</div>}
          {calc.revenusPensions > 0 && <div><span className="text-slate-500">Pensions :</span> {fmt(calc.revenusPensions)} €</div>}
          {calc.revenusFonciers > 0 && <div><span className="text-slate-500">Foncier :</span> {fmt(calc.revenusFonciers)} €</div>}
          <div className="col-span-2 pt-2 border-t">
            <span className="text-slate-500">Revenu net imposable :</span>{' '}
            <span className="font-bold">{fmt(calc.revenuNetImposable)} €</span>
          </div>
        </div>
      </div>

      {/* Résultat impôt */}
      <div className="bg-navy text-white rounded-xl p-6">
        <h3 className="font-heading text-xl font-bold mb-4">Votre impôt estimé</h3>
        <div className="text-4xl font-bold text-emerald-400 mb-2">{fmt(calc.impotNet)} €</div>
        <div className="text-sm text-slate-300 space-y-1">
          <div>Impôt brut : {fmt(calc.impotBrut)} € | Décote : {fmt(calc.decote)} €</div>
          <div>Réductions : {fmt(calc.reductions)} € | Crédits : {fmt(calc.credits)} €</div>
          {calc.fraisReelsPlusAvantageux && (
            <div className="text-emerald-300 font-medium mt-2">
              💡 Les frais réels vous feraient économiser {fmt(calc.gainFraisReels)} € de base imposable
            </div>
          )}
        </div>
      </div>

      {/* ═══ TEASER — Ce que l'analyse va faire ═══ */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🔍</span>
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-bold text-navy text-lg mb-1">
              Dernière étape : votre audit personnalisé
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Notre IA va scanner <strong className="text-navy">30 types d&apos;optimisations</strong> adaptés à votre profil et calculer votre score de déclaration.
            </p>

            {/* Pistes personnalisées */}
            <div className="flex flex-wrap gap-2 mb-3">
              {pistes.slice(0, 4).map(p => (
                <span key={p} className="text-xs bg-white/80 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full">
                  {p}
                </span>
              ))}
              <span className="text-xs bg-white/80 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full">
                + {30 - Math.min(pistes.length, 4)} autres
              </span>
            </div>

            {/* Avantages déjà détectés en temps réel */}
            {clientOptimisations.count > 0 && (
              <div className="bg-white/70 rounded-lg p-3 flex items-center gap-3">
                <span className="text-emerald-600 font-heading text-xl font-bold">
                  {clientOptimisations.count}
                </span>
                <div className="text-sm">
                  <p className="text-emerald-700 font-semibold">
                    avantage{clientOptimisations.count > 1 ? 's' : ''} déjà identifié{clientOptimisations.count > 1 ? 's' : ''}
                  </p>
                  <p className="text-slate-500 text-xs">
                    L&apos;audit complet pourrait en trouver davantage.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <label className="block mb-2">
          <span className="font-heading text-base font-semibold text-navy">Votre email <span className="text-slate-400 font-normal">(optionnel)</span></span>
          <span className="block text-sm text-slate-500 mt-1">
            Pour recevoir un rappel avant la campagne déclarative.
          </span>
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={e => updateField('email', e.target.value)}
          placeholder="nom@exemple.fr"
          className="w-full py-3 px-4 border-2 border-slate-200 rounded-xl text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors"
        />
      </div>

      {/* Confirmation */}
      <div className="border border-slate-200 bg-slate-50 rounded-xl p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.confirmeExactitude || false}
            onChange={e => updateField('confirmeExactitude', e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-sm text-slate-600">
            Je confirme que ces informations sont exactes et complètes. Les résultats sont calculés sous réserve de l&apos;exactitude de mes réponses.
          </span>
        </label>
      </div>
    </div>
  )
}
