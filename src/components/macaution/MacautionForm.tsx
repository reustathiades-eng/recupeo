'use client'
import { useState } from 'react'
import { track } from '@/lib/analytics'
import type { MacautionFormData, DeductionReason, PreDiagnosticResponse } from '@/lib/macaution/types'
import { deductionLabels } from '@/lib/macaution/schema'

const DEDUCTION_OPTIONS: { value: DeductionReason; label: string }[] = [
  { value: 'peintures_murs', label: 'Dégradation des peintures / murs' },
  { value: 'sols', label: 'Dégradation des sols' },
  { value: 'sanitaires_plomberie', label: 'Dégradation sanitaires / plomberie' },
  { value: 'equipements_cuisine', label: 'Dégradation équipements cuisine' },
  { value: 'menuiseries_portes', label: 'Dégradation menuiseries / portes' },
  { value: 'nettoyage', label: 'Nettoyage' },
  { value: 'loyers_impayes', label: 'Loyers impayés' },
  { value: 'charges_impayees', label: 'Charges impayées' },
  { value: 'autre', label: 'Autre' },
]

interface MacautionFormProps {
  onResult: (result: PreDiagnosticResponse) => void
  onBack?: () => void
}

export function MacautionForm({ onResult, onBack }: MacautionFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<Partial<MacautionFormData>>({
    locationType: undefined,
    rentAmount: undefined,
    depositAmount: undefined,
    entryDate: '',
    exitDate: '',
    depositReturned: undefined,
    returnedAmount: undefined,
    returnDate: '',
    deductions: [],
    deductionAmount: undefined,
    hasInvoices: undefined,
    entryDamages: undefined,
    email: '',
    otherDeduction: '',
  })

  const update = <K extends keyof MacautionFormData>(key: K, value: MacautionFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const toggleDeduction = (d: DeductionReason) => {
    const current = form.deductions || []
    if (current.includes(d)) {
      update('deductions', current.filter(x => x !== d))
    } else {
      update('deductions', [...current, d])
    }
  }

  const canNext = (): boolean => {
    switch (step) {
      case 1: return !!form.locationType && !!form.rentAmount && form.rentAmount > 0 && !!form.depositAmount && form.depositAmount > 0
      case 2: return !!form.entryDate && !!form.exitDate
      case 3: {
        if (!form.depositReturned) return false
        if (form.depositReturned === 'partial' && (!form.returnedAmount && form.returnedAmount !== 0)) return false
        return true
      }
      case 4: return (form.deductionAmount !== undefined && form.deductionAmount >= 0) && !!form.hasInvoices && !!form.entryDamages
      case 5: return !!form.email && form.email.includes('@')
      default: return false
    }
  }

  const handleSubmit = async () => {
    track({ event: 'form_submitted', brique: 'macaution' })
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/macaution/pre-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          rentAmount: Number(form.rentAmount),
          depositAmount: Number(form.depositAmount),
          returnedAmount: form.returnedAmount ? Number(form.returnedAmount) : undefined,
          deductionAmount: Number(form.deductionAmount || 0),
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Erreur lors de l\'analyse')
        return
      }
      onResult(data as PreDiagnosticResponse)
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-border bg-white text-slate-text placeholder:text-slate-muted/60 focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald transition-all text-base font-body"
  const labelClass = "block text-sm font-semibold text-slate-text mb-2"
  const radioGroupClass = "flex gap-3 flex-wrap"
  const radioClass = (selected: boolean) => `px-5 py-3 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all ${selected ? 'border-emerald bg-emerald/5 text-emerald' : 'border-slate-border bg-white text-slate-muted hover:border-emerald/40'}`

  return (
    <section id="formulaire" className="py-20 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        {/* Retour upload */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-emerald-dark hover:text-emerald font-medium mb-6 transition-colors"
          >
            ← Revenir au dépôt de documents
          </button>
        )}

        {/* Titre */}
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            Analysez votre situation
          </h2>
          <p className="text-slate-muted text-base max-w-[460px] mx-auto">
            Remplissez ce formulaire en 2 minutes. Le pré-diagnostic est gratuit et immédiat.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3,4,5].map(s => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-emerald' : 'bg-slate-border'}`} />
            </div>
          ))}
          <span className="text-xs text-slate-muted font-medium ml-2">Étape {step}/5</span>
        </div>

        {/* Card du formulaire */}
        <div className="bg-white rounded-2xl border border-slate-border p-8 shadow-sm">
          {/* STEP 1 — Type, loyer, dépôt */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Type de location</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.locationType === 'vide')} onClick={() => update('locationType', 'vide')}>
                    Location vide (non meublée)
                  </button>
                  <button type="button" className={radioClass(form.locationType === 'meuble')} onClick={() => update('locationType', 'meuble')}>
                    Location meublée
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Loyer mensuel hors charges (€)</label>
                <input type="number" className={inputClass} placeholder="Ex: 750" value={form.rentAmount || ''} onChange={e => update('rentAmount', parseFloat(e.target.value) || undefined as any)} />
              </div>
              <div>
                <label className={labelClass}>Montant du dépôt de garantie versé (€)</label>
                <input type="number" className={inputClass} placeholder="Ex: 750" value={form.depositAmount || ''} onChange={e => update('depositAmount', parseFloat(e.target.value) || undefined as any)} />
              </div>
            </div>
          )}

          {/* STEP 2 — Dates */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Date d&apos;entrée dans le logement</label>
                <input type="date" className={inputClass} value={form.entryDate} onChange={e => update('entryDate', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Date de sortie / remise des clés</label>
                <input type="date" className={inputClass} value={form.exitDate} onChange={e => update('exitDate', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 3 — Restitution */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Le dépôt a-t-il été restitué ?</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.depositReturned === 'total')} onClick={() => update('depositReturned', 'total')}>
                    Oui, en totalité
                  </button>
                  <button type="button" className={radioClass(form.depositReturned === 'partial')} onClick={() => update('depositReturned', 'partial')}>
                    Oui, partiellement
                  </button>
                  <button type="button" className={radioClass(form.depositReturned === 'none')} onClick={() => update('depositReturned', 'none')}>
                    Non, rien
                  </button>
                </div>
              </div>
              {form.depositReturned === 'partial' && (
                <>
                  <div>
                    <label className={labelClass}>Montant restitué (€)</label>
                    <input type="number" className={inputClass} placeholder="Ex: 300" value={form.returnedAmount || ''} onChange={e => update('returnedAmount', parseFloat(e.target.value) || undefined as any)} />
                  </div>
                  <div>
                    <label className={labelClass}>Date de restitution</label>
                    <input type="date" className={inputClass} value={form.returnDate} onChange={e => update('returnDate', e.target.value)} />
                  </div>
                </>
              )}
              {form.depositReturned === 'none' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  <strong>Le bailleur ne vous a rien restitué.</strong> Si le délai légal est dépassé, des pénalités de retard s&apos;appliquent automatiquement.
                </div>
              )}
              {form.depositReturned === 'total' && (
                <div className="bg-emerald/5 border border-emerald/20 rounded-xl p-4 text-sm text-emerald-dark">
                  <strong>Bonne nouvelle !</strong> Votre dépôt a été intégralement restitué. Il n&apos;y a a priori pas d&apos;anomalie.
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Retenues */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Motifs de retenue invoqués par le bailleur</label>
                <div className="grid grid-cols-1 gap-2">
                  {DEDUCTION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleDeduction(opt.value)}
                      className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        (form.deductions || []).includes(opt.value)
                          ? 'border-emerald bg-emerald/5 text-emerald'
                          : 'border-slate-border bg-white text-slate-muted hover:border-emerald/40'
                      }`}
                    >
                      {(form.deductions || []).includes(opt.value) ? '✓ ' : ''}{opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {(form.deductions || []).includes('autre') && (
                <div>
                  <label className={labelClass}>Précisez l&apos;autre motif</label>
                  <input type="text" className={inputClass} placeholder="Décrivez le motif..." value={form.otherDeduction || ''} onChange={e => update('otherDeduction', e.target.value)} />
                </div>
              )}
              <div>
                <label className={labelClass}>Montant total des retenues (€)</label>
                <input type="number" className={inputClass} placeholder="Ex: 450" value={form.deductionAmount || ''} onChange={e => update('deductionAmount', parseFloat(e.target.value) || undefined as any)} />
              </div>
              <div>
                <label className={labelClass}>Le bailleur a-t-il fourni des justificatifs (factures/devis) ?</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.hasInvoices === 'yes')} onClick={() => update('hasInvoices', 'yes')}>Oui</button>
                  <button type="button" className={radioClass(form.hasInvoices === 'no')} onClick={() => update('hasInvoices', 'no')}>Non</button>
                  <button type="button" className={radioClass(form.hasInvoices === 'partial')} onClick={() => update('hasInvoices', 'partial')}>Partiellement</button>
                </div>
              </div>
              <div>
                <label className={labelClass}>L&apos;état des lieux d&apos;entrée mentionnait-il des dégradations existantes ?</label>
                <div className={radioGroupClass}>
                  <button type="button" className={radioClass(form.entryDamages === 'yes')} onClick={() => update('entryDamages', 'yes')}>Oui</button>
                  <button type="button" className={radioClass(form.entryDamages === 'no')} onClick={() => update('entryDamages', 'no')}>Non</button>
                  <button type="button" className={radioClass(form.entryDamages === 'no_edl')} onClick={() => update('entryDamages', 'no_edl')}>Pas d&apos;EDL d&apos;entrée</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 — Email */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Votre adresse email</label>
                <input type="email" className={inputClass} placeholder="exemple@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
                <p className="text-xs text-slate-muted mt-2">Pour recevoir votre pré-diagnostic. Aucun spam, promis.</p>
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-border">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="text-slate-muted hover:text-slate-text font-medium text-sm transition-colors">
                ← Retour
              </button>
            ) : <div />}
            {step < 5 ? (
              <button
                type="button"
                onClick={() => { track({ event: 'form_step_completed', brique: 'macaution', step }); setStep(s => s + 1) }}
                disabled={!canNext()}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                  canNext()
                    ? 'bg-emerald text-navy-dark hover:bg-emerald-dark'
                    : 'bg-slate-border text-slate-muted cursor-not-allowed'
                }`}
              >
                Continuer →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canNext() || loading}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                  canNext() && !loading
                    ? 'bg-emerald text-navy-dark hover:bg-emerald-dark'
                    : 'bg-slate-border text-slate-muted cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Analyse en cours...
                  </span>
                ) : 'Lancer le pré-diagnostic gratuit →'}
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-muted text-center mt-4">
          🔒 Vos données sont confidentielles et ne sont jamais partagées. Analyse non contractuelle.
        </p>
      </div>
    </section>
  )
}
