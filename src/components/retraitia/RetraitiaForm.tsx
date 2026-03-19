'use client'
import { useState } from 'react'
import { track } from '@/lib/analytics'
import type { RetraitiaFormData, RetirementRegime, RetraitiaPreDiagResponse } from '@/lib/retraitia/types'
import type { RetraitiaExtractionResult } from '@/lib/retraitia/extract-types'
import { REGIME_LABELS, REGIME_GROUPS } from '@/lib/retraitia/constants'

interface RetraitiaFormProps {
  onResult: (result: RetraitiaPreDiagResponse) => void
  initialData?: RetraitiaExtractionResult | null
  onBack?: () => void
}

export function RetraitiaForm({ onResult, initialData, onBack }: RetraitiaFormProps) {
  const prefilled = !!initialData
  const ext = initialData?.extracted

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<Partial<RetraitiaFormData>>({
    birthDate: ext?.birthDate?.value || '',
    sex: ext?.sex?.value || undefined,
    childrenCount: undefined,
    status: ext?.retirementDate?.value ? 'retired' as const : undefined,
    regimes: (ext?.regimes?.value as RetirementRegime[]) || [],
    totalTrimesters: ext?.totalTrimesters?.value || undefined,
    cotisedTrimesters: ext?.cotisedTrimesters?.value || undefined,
    careerStartAge: ext?.careerStartAge?.value || undefined,
    militaryService: ext?.militaryService?.value === true ? 'yes' : ext?.militaryService?.value === false ? 'no' : undefined,
    militaryDuration: ext?.militaryDuration?.value || undefined,
    militaryReported: undefined,
    unemploymentPeriods: undefined,
    unemploymentDuration: undefined,
    maternityOrSickness: undefined,
    maternityCount: undefined,
    basePension: ext?.basePension?.value || undefined,
    complementaryPension: ext?.complementaryPension?.value || undefined,
    retirementDate: ext?.retirementDate?.value || '',
    hasChildrenBonus: ext?.hasChildrenBonus?.value === true ? 'yes' : ext?.hasChildrenBonus?.value === false ? 'no' : undefined,
    hasDecote: ext?.hasDecote?.value === true ? 'yes' : ext?.hasDecote?.value === false ? 'no' : undefined,
    estimatedBasePension: undefined,
    estimatedComplementaryPension: undefined,
    plannedRetirementDate: '',
    hasRIS: initialData?.documents?.some(d => d.type === 'ris') || false,
    hasEIG: initialData?.documents?.some(d => d.type === 'eig') || false,
    hasAgircArrco: initialData?.documents?.some(d => d.type === 'agirc_arrco') || false,
    email: '',
  })

  // Infos client extraites (hors du formulaire, pour les courriers)
  const clientInfoRef = initialData?.clientInfo || null

  const update = <K extends keyof RetraitiaFormData>(key: K, value: RetraitiaFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const toggleRegime = (r: RetirementRegime) => {
    const current = form.regimes || []
    if (current.includes(r)) {
      update('regimes', current.filter(x => x !== r) as RetirementRegime[])
    } else {
      update('regimes', [...current, r] as RetirementRegime[])
    }
  }

  const canNext = (): boolean => {
    switch (step) {
      case 1: return !!form.birthDate && !!form.sex && form.childrenCount !== undefined && !!form.status
      case 2: {
        if (!form.regimes || form.regimes.length === 0) return false
        if (!form.totalTrimesters || !form.cotisedTrimesters || !form.careerStartAge) return false
        if (!form.militaryService || !form.unemploymentPeriods || !form.maternityOrSickness) return false
        if (form.militaryService === 'yes' && !form.militaryDuration) return false
        if (form.unemploymentPeriods === 'yes' && !form.unemploymentDuration) return false
        return true
      }
      case 3: {
        if (!form.hasChildrenBonus || !form.hasDecote) return false
        if (form.status === 'retired' && !form.basePension) return false
        return true
      }
      case 4: return true
      case 5: return !!form.email && form.email.includes('@')
      default: return false
    }
  }

  const handleSubmit = async () => {
    track({ event: 'form_submitted', brique: 'retraitia' })
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...form,
        childrenCount: Number(form.childrenCount || 0),
        totalTrimesters: Number(form.totalTrimesters || 0),
        cotisedTrimesters: Number(form.cotisedTrimesters || 0),
        careerStartAge: Number(form.careerStartAge || 18),
        militaryDuration: form.militaryDuration ? Number(form.militaryDuration) : undefined,
        unemploymentDuration: form.unemploymentDuration ? Number(form.unemploymentDuration) : undefined,
        maternityCount: form.maternityCount ? Number(form.maternityCount) : undefined,
        basePension: form.basePension ? Number(form.basePension) : undefined,
        complementaryPension: form.complementaryPension ? Number(form.complementaryPension) : undefined,
        estimatedBasePension: form.estimatedBasePension ? Number(form.estimatedBasePension) : undefined,
        estimatedComplementaryPension: form.estimatedComplementaryPension ? Number(form.estimatedComplementaryPension) : undefined,
        clientName: clientInfoRef?.fullName || undefined,
        clientAddress: clientInfoRef?.address || undefined,
        clientNIR: clientInfoRef?.nir || undefined,
        clientCARSAT: clientInfoRef?.carsat || undefined,
        clientCity: clientInfoRef?.city || undefined,
      }
      const res = await fetch('/api/retraitia/pre-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || "Erreur lors de l'analyse")
        return
      }
      onResult(data as RetraitiaPreDiagResponse)
    } catch {
      setError('Erreur de connexion. Veuillez r\u00e9essayer.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-border bg-white text-slate-text placeholder:text-slate-muted/60 focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald transition-all text-base font-body"
  const labelClass = "block text-sm font-semibold text-slate-text mb-2"
  const helpClass = "text-xs text-slate-muted mt-1"
  const radioGroupClass = "flex gap-3 flex-wrap"
  const radioClass = (selected: boolean) => `px-5 py-3 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all ${selected ? 'border-emerald bg-emerald/5 text-emerald' : 'border-slate-border bg-white text-slate-muted hover:border-emerald/40'}`
  const checkClass = (selected: boolean) => `px-4 py-3 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all ${selected ? 'border-emerald bg-emerald/5 text-emerald' : 'border-slate-border bg-white text-slate-muted hover:border-emerald/40'}`

  return (
    <section id="formulaire" className="py-20 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        {/* Retour upload */}
        {onBack && (
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-emerald-dark hover:text-emerald font-medium mb-6 transition-colors">
            ← Revenir au dépôt de documents
          </button>
        )}

        {/* Titre */}
        <div className="text-center mb-6">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            {prefilled ? 'V\u00e9rifiez et compl\u00e9tez' : 'Analysez votre pension'}
          </h2>
          <p className="text-slate-muted text-base max-w-[480px] mx-auto">
            {prefilled
              ? "Vos documents ont \u00e9t\u00e9 analys\u00e9s. V\u00e9rifiez les donn\u00e9es pr\u00e9remplies et compl\u00e9tez les champs manquants."
              : "Remplissez ce formulaire en 3 minutes. Le pr\u00e9-diagnostic est gratuit et imm\u00e9diat."}
          </p>
        </div>

        {/* Banner extraction */}
        {prefilled && initialData && (
          <div className="bg-emerald/5 border border-emerald/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-slate-text text-sm">
                {initialData.documents.length} document(s) analysé(s) avec succès
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {initialData.documents.map((d, i) => (
                <span key={i} className="text-xs bg-white rounded-lg px-2 py-1 border border-emerald/20 text-emerald-dark">
                  {d.type === 'ris' ? 'RIS' : d.type === 'eig' ? 'EIG' : d.type === 'agirc_arrco' ? 'Agirc-Arrco' : d.type === 'notification' ? 'Notification' : d.summary || d.type}
                </span>
              ))}
            </div>
            {initialData.warnings.length > 0 && (
              <div className="mt-2 text-xs text-amber-700">
                {initialData.warnings.map((w, i) => <div key={i}>* {w}</div>)}
              </div>
            )}
            {initialData.careerGaps && initialData.careerGaps.length > 0 && (
              <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                <div className="text-xs font-semibold text-amber-800 mb-1">Trous de carrière détectés :</div>
                {initialData.careerGaps.map((g, i) => (
                  <div key={i} className="text-xs text-amber-700">{g.startYear}-{g.endYear} : {g.comment}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3,4,5].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all ${s <= step ? 'bg-emerald' : 'bg-slate-border'}`} />
            </div>
          ))}
          <span className="text-xs text-slate-muted font-medium ml-2">Étape {step}/5</span>
        </div>

        {/* Card du formulaire */}
        <div className="bg-white rounded-2xl border border-slate-border p-8 shadow-sm">

          {/* === STEP 1 — Profil === */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-heading font-bold text-slate-text text-lg mb-1">Votre profil</h3>
              <div>
                <label className={labelClass}>Date de naissance</label>
                <input type="date" className={inputClass} value={form.birthDate} onChange={e => update('birthDate', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Sexe</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.sex === 'M')} onClick={() => update('sex', 'M')}>Homme</button>
                  <button type="button" className={radioClass(form.sex === 'F')} onClick={() => update('sex', 'F')}>Femme</button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Nombre d&apos;enfants élevés</label>
                <div className={radioGroupClass}>
                  {[0,1,2,3].map(n => (
                    <button key={n} type="button" className={radioClass(form.childrenCount === n)} onClick={() => update('childrenCount', n)}>
                      {n === 3 ? '3 ou plus' : String(n)}
                    </button>
                  ))}
                </div>
                {(form.childrenCount || 0) >= 3 && (
                  <p className="text-xs text-emerald mt-2 font-medium">Eligible à la majoration +10% pour 3 enfants ou plus</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Votre situation actuelle</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.status === 'retired')} onClick={() => update('status', 'retired')}>Retraité(e)</button>
                  <button type="button" className={radioClass(form.status === 'active')} onClick={() => update('status', 'active')}>En activité</button>
                  <button type="button" className={radioClass(form.status === 'liquidating')} onClick={() => update('status', 'liquidating')}>En cours de liquidation</button>
                </div>
              </div>
            </div>
          )}

          {/* === STEP 2 — Carriere === */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-heading font-bold text-slate-text text-lg mb-1">Votre carrière</h3>
              <div>
                <label className={labelClass}>Régimes de cotisation</label>
                <p className={helpClass + ' mb-3'}>Sélectionnez tous les organismes auxquels vous avez cotisé</p>
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                  {REGIME_GROUPS.map(group => (
                    <div key={group.label}>
                      <div className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-2">{group.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {group.regimes.map(r => (
                          <button key={r} type="button" className={checkClass((form.regimes || []).includes(r as RetirementRegime))} onClick={() => toggleRegime(r as RetirementRegime)}>
                            {REGIME_LABELS[r] || r}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Trimestres validés (total)</label>
                  <input type="number" className={inputClass} placeholder="Ex: 158" value={form.totalTrimesters || ''} onChange={e => update('totalTrimesters', parseInt(e.target.value) || undefined as any)} />
                  <p className={helpClass}>Visible sur votre RIS (info-retraite.fr)</p>
                </div>
                <div>
                  <label className={labelClass}>Trimestres cotisés</label>
                  <input type="number" className={inputClass} placeholder="Ex: 148" value={form.cotisedTrimesters || ''} onChange={e => update('cotisedTrimesters', parseInt(e.target.value) || undefined as any)} />
                  <p className={helpClass}>Hors trimestres assimilés</p>
                </div>
              </div>
              <div>
                <label className={labelClass}>Age de début de carrière</label>
                <input type="number" className={inputClass} placeholder="Ex: 18" value={form.careerStartAge || ''} onChange={e => update('careerStartAge', parseInt(e.target.value) || undefined as any)} />
              </div>
              <div>
                <label className={labelClass}>Avez-vous effectué un service militaire ?</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.militaryService === 'yes')} onClick={() => update('militaryService', 'yes')}>Oui</button>
                  <button type="button" className={radioClass(form.militaryService === 'no')} onClick={() => update('militaryService', 'no')}>Non</button>
                </div>
              </div>
              {form.militaryService === 'yes' && (
                <div className="pl-4 border-l-2 border-emerald/30 space-y-4">
                  <div>
                    <label className={labelClass}>Durée (en mois)</label>
                    <input type="number" className={inputClass} placeholder="Ex: 12" value={form.militaryDuration || ''} onChange={e => update('militaryDuration', parseInt(e.target.value) || undefined as any)} />
                  </div>
                  <div>
                    <label className={labelClass}>Reporté sur votre relevé de carrière ?</label>
                    <div className={radioGroupClass}>
                      <button type="button" className={radioClass(form.militaryReported === 'yes')} onClick={() => update('militaryReported', 'yes')}>Oui</button>
                      <button type="button" className={radioClass(form.militaryReported === 'no')} onClick={() => update('militaryReported', 'no')}>Non</button>
                      <button type="button" className={radioClass(form.militaryReported === 'unknown')} onClick={() => update('militaryReported', 'unknown')}>Je ne sais pas</button>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className={labelClass}>Périodes de chômage indemnisé ?</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.unemploymentPeriods === 'yes')} onClick={() => update('unemploymentPeriods', 'yes')}>Oui</button>
                  <button type="button" className={radioClass(form.unemploymentPeriods === 'no')} onClick={() => update('unemploymentPeriods', 'no')}>Non</button>
                </div>
              </div>
              {form.unemploymentPeriods === 'yes' && (
                <div className="pl-4 border-l-2 border-emerald/30">
                  <label className={labelClass}>Durée totale de chômage (en mois)</label>
                  <input type="number" className={inputClass} placeholder="Ex: 24" value={form.unemploymentDuration || ''} onChange={e => update('unemploymentDuration', parseInt(e.target.value) || undefined as any)} />
                </div>
              )}
              <div>
                <label className={labelClass}>Congés maternité ou maladie longue durée ?</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.maternityOrSickness === 'yes')} onClick={() => update('maternityOrSickness', 'yes')}>Oui</button>
                  <button type="button" className={radioClass(form.maternityOrSickness === 'no')} onClick={() => update('maternityOrSickness', 'no')}>Non</button>
                </div>
              </div>
              {form.maternityOrSickness === 'yes' && (
                <div className="pl-4 border-l-2 border-emerald/30">
                  <label className={labelClass}>Nombre de périodes</label>
                  <input type="number" className={inputClass} placeholder="Ex: 2" value={form.maternityCount || ''} onChange={e => update('maternityCount', parseInt(e.target.value) || undefined as any)} />
                </div>
              )}
            </div>
          )}

          {/* === STEP 3 — Pension === */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-heading font-bold text-slate-text text-lg mb-1">
                {form.status === 'retired' ? 'Votre pension actuelle' : 'Votre pension estimée'}
              </h3>
              {form.status === 'retired' ? (
                <>
                  <div>
                    <label className={labelClass}>Pension de base brute mensuelle (CNAV, en €)</label>
                    <input type="number" className={inputClass} placeholder="Ex: 1200" value={form.basePension || ''} onChange={e => update('basePension', parseFloat(e.target.value) || undefined as any)} />
                  </div>
                  <div>
                    <label className={labelClass}>Pension complémentaire brute mensuelle (Agirc-Arrco, en €)</label>
                    <input type="number" className={inputClass} placeholder="Ex: 600" value={form.complementaryPension || ''} onChange={e => update('complementaryPension', parseFloat(e.target.value) || undefined as any)} />
                  </div>
                  <div>
                    <label className={labelClass}>Date de départ en retraite</label>
                    <input type="date" className={inputClass} value={form.retirementDate} onChange={e => update('retirementDate', e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>Pension de base estimée (mensuel brut, en €)</label>
                    <input type="number" className={inputClass} placeholder="Ex: 1200" value={form.estimatedBasePension || ''} onChange={e => update('estimatedBasePension', parseFloat(e.target.value) || undefined as any)} />
                    <p className={helpClass}>Montant visible sur votre EIG ou simulation info-retraite.fr</p>
                  </div>
                  <div>
                    <label className={labelClass}>Pension complémentaire estimée (mensuel brut, en €)</label>
                    <input type="number" className={inputClass} placeholder="Ex: 600" value={form.estimatedComplementaryPension || ''} onChange={e => update('estimatedComplementaryPension', parseFloat(e.target.value) || undefined as any)} />
                  </div>
                  <div>
                    <label className={labelClass}>Date de départ envisagée</label>
                    <input type="date" className={inputClass} value={form.plannedRetirementDate} onChange={e => update('plannedRetirementDate', e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <label className={labelClass}>La majoration pour enfants (+10%) est-elle appliquée ?</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.hasChildrenBonus === 'yes')} onClick={() => update('hasChildrenBonus', 'yes')}>Oui</button>
                  <button type="button" className={radioClass(form.hasChildrenBonus === 'no')} onClick={() => update('hasChildrenBonus', 'no')}>Non</button>
                  <button type="button" className={radioClass(form.hasChildrenBonus === 'unknown')} onClick={() => update('hasChildrenBonus', 'unknown')}>Je ne sais pas</button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Une décote est-elle appliquée sur votre pension ?</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.hasDecote === 'yes')} onClick={() => update('hasDecote', 'yes')}>Oui</button>
                  <button type="button" className={radioClass(form.hasDecote === 'no')} onClick={() => update('hasDecote', 'no')}>Non</button>
                  <button type="button" className={radioClass(form.hasDecote === 'unknown')} onClick={() => update('hasDecote', 'unknown')}>Je ne sais pas</button>
                </div>
                <p className={helpClass}>La décote est une réduction si vous n&apos;avez pas tous vos trimestres</p>
              </div>
            </div>
          )}

          {/* === STEP 4 — Documents === */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="font-heading font-bold text-slate-text text-lg mb-1">Vos documents</h3>
              <p className="text-sm text-slate-muted">Ces informations aident à affiner le diagnostic.</p>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-border bg-slate-bg cursor-pointer hover:border-emerald/40 transition-all">
                  <input type="checkbox" checked={form.hasRIS} onChange={e => update('hasRIS', e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-border text-emerald focus:ring-emerald" />
                  <div>
                    <div className="font-semibold text-slate-text text-sm">Relevé Individuel de Situation (RIS)</div>
                    <div className="text-xs text-slate-muted mt-0.5">Disponible sur info-retraite.fr</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-border bg-slate-bg cursor-pointer hover:border-emerald/40 transition-all">
                  <input type="checkbox" checked={form.hasEIG} onChange={e => update('hasEIG', e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-border text-emerald focus:ring-emerald" />
                  <div>
                    <div className="font-semibold text-slate-text text-sm">Estimation Indicative Globale (EIG)</div>
                    <div className="text-xs text-slate-muted mt-0.5">Envoyée par courrier à partir de 55 ans</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-border bg-slate-bg cursor-pointer hover:border-emerald/40 transition-all">
                  <input type="checkbox" checked={form.hasAgircArrco} onChange={e => update('hasAgircArrco', e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-border text-emerald focus:ring-emerald" />
                  <div>
                    <div className="font-semibold text-slate-text text-sm">Relevé de points Agirc-Arrco</div>
                    <div className="text-xs text-slate-muted mt-0.5">Disponible sur agirc-arrco.fr</div>
                  </div>
                </label>
              </div>
              <div className="bg-emerald/5 border border-emerald/20 rounded-xl p-4">
                <p className="text-sm text-slate-text">
                  <strong>Astuce :</strong> Avoir votre RIS sous les yeux améliore la précision.
                  Téléchargez-le sur <a href="https://info-retraite.fr" target="_blank" rel="noopener noreferrer" className="text-emerald underline">info-retraite.fr</a>.
                </p>
              </div>
            </div>
          )}

          {/* === STEP 5 — Email === */}
          {step === 5 && (
            <div className="space-y-6">
              <h3 className="font-heading font-bold text-slate-text text-lg mb-1">Dernière étape</h3>
              <div>
                <label className={labelClass}>Votre adresse email</label>
                <input type="email" className={inputClass} placeholder="votre@email.fr" value={form.email} onChange={e => update('email', e.target.value)} />
                <p className={helpClass}>Pour recevoir votre pré-diagnostic et le rapport complet</p>
              </div>
              <label className="flex items-start gap-2 text-xs text-slate-muted cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 w-3.5 h-3.5 rounded border-slate-border text-emerald focus:ring-emerald" />
                <span>J&apos;accepte que mes données soient analysées pour le diagnostic. Elles sont anonymisées avant tout traitement par l&apos;IA et ne sont jamais revendues. <a href="/confidentialite" className="text-emerald underline">Politique de confidentialité</a></span>
              </label>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-border">
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${step === 1 ? 'invisible' : 'text-slate-muted hover:text-slate-text hover:bg-slate-bg'}`}
            >
              ← Précédent
            </button>
            {step < 5 ? (
              <button
                type="button"
                onClick={() => { track({ event: 'form_step_completed', brique: 'retraitia', step }); setStep(s => s + 1) }}
                disabled={!canNext()}
                className="px-8 py-3 rounded-xl text-sm font-bold transition-all bg-emerald text-navy-dark hover:bg-emerald-dark disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canNext() || loading}
                className="cta-primary !text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Analyse en cours...
                  </span>
                ) : 'Lancer le diagnostic gratuit \u2192'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
