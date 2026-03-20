'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'

const CONVENTIONS = [
  { value: 'IDCC_2216', label: 'Commerce alimentaire (IDCC 2216)' },
  { value: 'IDCC_1979', label: 'HCR - Hôtels, Cafés, Restaurants (IDCC 1979)' },
  { value: 'IDCC_1596', label: 'BTP Ouvriers (IDCC 1596)' },
  { value: 'IDCC_3248', label: 'Métallurgie (IDCC 3248)' },
  { value: 'IDCC_0573', label: 'Commerce de gros (IDCC 0573)' },
  { value: 'AUTRE', label: 'Autre convention collective' },
  { value: 'AUCUNE', label: 'Pas de convention collective' },
]
const STATUTS = [
  { value: 'OUVRIER', label: 'Ouvrier' },
  { value: 'EMPLOYE', label: 'Employé' },
  { value: 'TECHNICIEN', label: 'Technicien' },
  { value: 'AGENT_MAITRISE', label: 'Agent de maîtrise' },
  { value: 'CADRE', label: 'Cadre' },
]

export interface EmploiFormData {
  poste: string; conventionCode: string; statut: string; coefficient: string
  dateEntree: string; tempsTravail: 'PLEIN' | 'PARTIEL' | ''; quotite: string
  brutMensuel: string; netMensuel: string; heuresSupHebdo: string
  primes: string; changements: string
}

const EMPTY: EmploiFormData = { poste: '', conventionCode: '', statut: '', coefficient: '', dateEntree: '', tempsTravail: '', quotite: '', brutMensuel: '', netMensuel: '', heuresSupHebdo: '', primes: '', changements: '' }
const REQUIRED: (keyof EmploiFormData)[] = ['poste', 'conventionCode', 'statut', 'dateEntree', 'tempsTravail', 'brutMensuel', 'netMensuel']

interface Props { onSubmit: (data: EmploiFormData) => void; defaultValues?: Partial<EmploiFormData>; loading?: boolean }

export default function Form({ onSubmit, defaultValues, loading }: Props) {
  const [form, setForm] = useState<EmploiFormData>({ ...EMPTY, ...defaultValues })
  const [errors, setErrors] = useState<Partial<Record<keyof EmploiFormData, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (k: keyof EmploiFormData, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => { const n = { ...p }; delete n[k]; return n }); setSubmitError(null) }

  const validate = (): boolean => {
    const e: typeof errors = {}
    REQUIRED.forEach(k => { if (!form[k].trim()) e[k] = 'Ce champ est requis.' })
    if (form.tempsTravail === 'PARTIEL' && !form.quotite.trim()) e.quotite = 'Précisez la quotité pour un temps partiel.'
    if (form.brutMensuel && isNaN(Number(form.brutMensuel.replace(/\s/g, '').replace(',', '.')))) e.brutMensuel = 'Montant invalide.'
    if (form.netMensuel && isNaN(Number(form.netMensuel.replace(/\s/g, '').replace(',', '.')))) e.netMensuel = 'Montant invalide.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) { setSubmitError('Corrigez les erreurs avant de continuer.'); return }
    track({ event: 'mapaie_form_submit', brique: 'mapaie', context: 'emploi_remuneration' })
    onSubmit(form)
  }

  const req = (k: keyof EmploiFormData) => REQUIRED.includes(k) || (k === 'quotite' && form.tempsTravail === 'PARTIEL')
  const err = (k: keyof EmploiFormData) => errors[k]

  const Field = ({ id, label, children }: { id: keyof EmploiFormData; label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-[#1E293B]">{label}{req(id) && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}</label>
      {children}
      {err(id) && <p id={`${id}-error`} className="text-sm text-red-600" role="alert">{err(id)}</p>}
    </div>
  )

  const inputCls = (k: keyof EmploiFormData) => `w-full rounded-lg border px-3 py-2.5 text-sm text-[#1E293B] bg-white outline-none transition-colors focus:ring-2 focus:ring-[#00D68F]/40 focus:border-[#00D68F] ${err(k) ? 'border-red-400' : 'border-slate-300'}`
  const aria = (k: keyof EmploiFormData) => ({ id: k, 'aria-required': req(k) ? ('true' as const) : undefined, 'aria-invalid': err(k) ? ('true' as const) : undefined, 'aria-describedby': err(k) ? `${k}-error` : undefined })

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field id="poste" label="Intitulé du poste">
          <input {...aria('poste')} type="text" className={inputCls('poste')} placeholder="Ex : Technicien de maintenance" value={form.poste} onChange={e => set('poste', e.target.value)} />
        </Field>
        <Field id="conventionCode" label="Convention collective">
          <select {...aria('conventionCode')} className={inputCls('conventionCode')} value={form.conventionCode} onChange={e => set('conventionCode', e.target.value)}>
            <option value="">Sélectionnez</option>
            {CONVENTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
        <Field id="statut" label="Statut">
          <select {...aria('statut')} className={inputCls('statut')} value={form.statut} onChange={e => set('statut', e.target.value)}>
            <option value="">Sélectionnez</option>
            {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <Field id="coefficient" label="Coefficient / Niveau">
          <input {...aria('coefficient')} type="text" className={inputCls('coefficient')} placeholder="Ex : 285 ou N3-E2" value={form.coefficient} onChange={e => set('coefficient', e.target.value)} />
        </Field>
        <Field id="dateEntree" label="Date d'entrée dans l'entreprise">
          <input {...aria('dateEntree')} type="date" className={inputCls('dateEntree')} value={form.dateEntree} onChange={e => set('dateEntree', e.target.value)} />
        </Field>
        <Field id="tempsTravail" label="Temps de travail">
          <select {...aria('tempsTravail')} className={inputCls('tempsTravail')} value={form.tempsTravail} onChange={e => set('tempsTravail', e.target.value)}>
            <option value="">Sélectionnez</option>
            <option value="PLEIN">Temps plein</option>
            <option value="PARTIEL">Temps partiel</option>
          </select>
        </Field>
        {form.tempsTravail === 'PARTIEL' && (
          <Field id="quotite" label="Quotité (heures/semaine)">
            <input {...aria('quotite')} type="text" className={inputCls('quotite')} placeholder="Ex : 24" value={form.quotite} onChange={e => set('quotite', e.target.value)} />
          </Field>
        )}
        <Field id="brutMensuel" label="Salaire brut mensuel (€)">
          <input {...aria('brutMensuel')} type="text" inputMode="decimal" className={inputCls('brutMensuel')} placeholder="Ex : 2 450" value={form.brutMensuel} onChange={e => set('brutMensuel', e.target.value)} />
        </Field>
        <Field id="netMensuel" label="Salaire net mensuel (€)">
          <input {...aria('netMensuel')} type="text" inputMode="decimal" className={inputCls('netMensuel')} placeholder="Ex : 1 920" value={form.netMensuel} onChange={e => set('netMensuel', e.target.value)} />
        </Field>
        <Field id="heuresSupHebdo" label="Heures supplémentaires / semaine">
          <input {...aria('heuresSupHebdo')} type="text" inputMode="decimal" className={inputCls('heuresSupHebdo')} placeholder="Ex : 4" value={form.heuresSupHebdo} onChange={e => set('heuresSupHebdo', e.target.value)} />
        </Field>
      </div>
      <Field id="primes" label="Primes et compléments (13e mois, ancienneté, panier…)">
        <textarea {...aria('primes')} rows={3} className={inputCls('primes')} placeholder="Décrivez les primes que vous percevez ou devriez percevoir" value={form.primes} onChange={e => set('primes', e.target.value)} />
      </Field>
      <Field id="changements" label="Changements récents (poste, horaires, rémunération…)">
        <textarea {...aria('changements')} rows={3} className={inputCls('changements')} placeholder="Signalez tout changement intervenu ces 3 dernières années" value={form.changements} onChange={e => set('changements', e.target.value)} />
      </Field>
      {submitError && <p className="text-sm text-red-600 font-medium" role="alert">{submitError}</p>}
      <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#00D68F] text-[#0B1426] font-heading font-bold text-base transition-colors hover:bg-[#00C07F] focus:outline-none focus:ring-2 focus:ring-[#00D68F]/60 disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Analyse en cours...' : "Lancer l'audit de mes bulletins"}
      </button>
    </form>
  )
}