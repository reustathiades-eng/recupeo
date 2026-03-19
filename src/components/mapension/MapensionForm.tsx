'use client'
import { useState } from 'react'
import type { MapensionFormData, MapensionCalculateResponse } from '@/lib/mapension/types'
import { track } from '@/lib/analytics'

interface Props {
  onResult: (result: MapensionCalculateResponse) => void
}

export function MapensionForm({ onResult }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<Partial<MapensionFormData>>({
    initialAmount: undefined,
    judgmentDate: '',
    childrenCount: 1,
    indexType: 'ensemble_hors_tabac',
    referenceIndex: null,
    revaluationMonth: undefined,
    alreadyRevalued: 'no',
    lastRevaluedAmount: null,
    lastRevaluedDate: null,
    currentAmountPaid: undefined,
    userRole: 'creditor',
    usesARIPA: 'no',
    email: '',
  })

  const update = <K extends keyof MapensionFormData>(key: K, value: MapensionFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const canSubmit = !!form.initialAmount && form.initialAmount > 0
    && !!form.judgmentDate
    && !!form.currentAmountPaid && form.currentAmountPaid >= 0
    && !!form.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    track({ event: 'form_submitted', brique: 'mapension' })
    try {
      const jDate = form.judgmentDate || ''
      const jMonth = parseInt(jDate.split('-')[1]) || 1
      const payload = {
        ...form,
        initialAmount: Number(form.initialAmount || 0),
        childrenCount: Number(form.childrenCount || 1),
        revaluationMonth: form.revaluationMonth || jMonth,
        currentAmountPaid: Number(form.currentAmountPaid ?? form.initialAmount ?? 0),
        referenceIndex: form.referenceIndex ? Number(form.referenceIndex) : null,
        lastRevaluedAmount: form.lastRevaluedAmount ? Number(form.lastRevaluedAmount) : null,
      }
      const res = await fetch('/api/mapension/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Erreur'); return }
      onResult(data as MapensionCalculateResponse)
    } catch { setError('Erreur réseau. Réessayez.') }
    finally { setLoading(false) }
  }

  // ─── Helpers UI ───
  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="block text-sm font-semibold text-slate-text mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
  const Input = ({ value, onChange, type = 'text', placeholder, suffix, min, max }: {
    value: string | number | undefined; onChange: (v: string) => void; type?: string; placeholder?: string; suffix?: string; min?: number | string; max?: number | string
  }) => (
    <div className="relative">
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} min={min} max={max}
        className="w-full px-4 py-3 border border-slate-border rounded-xl bg-white text-slate-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all" />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-muted">{suffix}</span>}
    </div>
  )
  const RadioGroup = ({ value, onChange, options }: {
    value: string | undefined; onChange: (v: string) => void; options: { value: string; label: string }[]
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            value === o.value ? 'bg-emerald/10 border-emerald text-emerald' : 'bg-white border-slate-border text-slate-muted hover:border-slate-text/30'
          }`}>{o.label}</button>
      ))}
    </div>
  )

  return (
    <section id="formulaire" className="py-16 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-2">
            Calculez votre pension revalorisée
          </h2>
          <p className="text-slate-muted text-sm">Résultat gratuit en moins d&apos;une minute</p>
        </div>

        <div className="bg-slate-bg rounded-2xl border border-slate-border p-8 space-y-6">
          {/* Section 1 — Pension */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-text mb-4 flex items-center gap-2">
              <span>⚖️</span> Votre pension
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Montant initial (jugement)</Label>
                  <Input type="number" value={form.initialAmount} onChange={v => update('initialAmount', Number(v) || undefined as any)} placeholder="300" suffix="€/mois" />
                </div>
                <div>
                  <Label required>Date du jugement</Label>
                  <Input type="date" value={form.judgmentDate} onChange={v => update('judgmentDate', v)} max={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Nombre d&apos;enfants</Label>
                  <Input type="number" value={form.childrenCount} onChange={v => update('childrenCount', Number(v) || 1)} min={1} max={20} />
                </div>
                <div>
                  <Label required>Montant actuellement versé</Label>
                  <Input type="number" value={form.currentAmountPaid} onChange={v => update('currentAmountPaid', Number(v) || undefined as any)} placeholder="300" suffix="€/mois" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Indice */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-text mb-4 flex items-center gap-2">
              <span>📊</span> Indice INSEE
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Quel indice est précisé dans votre jugement ?</Label>
                <p className="text-xs text-slate-muted mb-2">En cas de doute, laissez le choix par défaut (le plus courant)</p>
                <RadioGroup value={form.indexType} onChange={v => update('indexType', v as MapensionFormData['indexType'])} options={[
                  { value: 'ensemble_hors_tabac', label: 'Hors tabac — Ensemble (défaut)' },
                  { value: 'ouvriers_hors_tabac', label: 'Hors tabac — Ouvriers/Employés' },
                  { value: 'ensemble_tabac', label: 'Y compris tabac — Ensemble' },
                  { value: 'ouvriers_tabac', label: 'Y compris tabac — Ouvriers' },
                ]} />
              </div>
            </div>
          </div>

          {/* Section 3 — Historique */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-text mb-4 flex items-center gap-2">
              <span>📅</span> Historique
            </h3>
            <div className="space-y-4">
              <div>
                <Label>La pension a-t-elle déjà été revalorisée ?</Label>
                <RadioGroup value={form.alreadyRevalued} onChange={v => update('alreadyRevalued', v as MapensionFormData['alreadyRevalued'])} options={[
                  { value: 'no', label: 'Non, jamais' },
                  { value: 'yes', label: 'Oui' },
                  { value: 'unknown', label: 'Je ne sais pas' },
                ]} />
              </div>
              {form.alreadyRevalued === 'yes' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-2 pl-4 border-l-2 border-emerald/20">
                  <div>
                    <Label>Dernier montant revalorisé</Label>
                    <Input type="number" value={form.lastRevaluedAmount ?? ''} onChange={v => update('lastRevaluedAmount', v ? Number(v) : null)} placeholder="320" suffix="€/mois" />
                  </div>
                  <div>
                    <Label>Date de la dernière revalorisation</Label>
                    <Input type="date" value={form.lastRevaluedDate ?? ''} onChange={v => update('lastRevaluedDate', v || null)} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4 — Situation */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-text mb-4 flex items-center gap-2">
              <span>👤</span> Votre situation
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Vous êtes :</Label>
                <RadioGroup value={form.userRole} onChange={v => update('userRole', v as MapensionFormData['userRole'])} options={[
                  { value: 'creditor', label: '👩 Je reçois la pension' },
                  { value: 'debtor', label: '👨 Je verse la pension' },
                ]} />
              </div>
              <div>
                <Label>Passez-vous par l&apos;ARIPA (CAF) ?</Label>
                <p className="text-xs text-slate-muted mb-2">L&apos;ARIPA gère l&apos;intermédiation et la revalorisation automatique</p>
                <RadioGroup value={form.usesARIPA} onChange={v => update('usesARIPA', v as MapensionFormData['usesARIPA'])} options={[
                  { value: 'no', label: 'Non' },
                  { value: 'yes', label: 'Oui' },
                  { value: 'unknown', label: 'Je ne sais pas' },
                ]} />
              </div>
              {form.usesARIPA === 'yes' && (
                <div className="p-3 bg-emerald/5 border border-emerald/20 rounded-xl">
                  <p className="text-xs text-emerald font-medium">
                    ✅ Si vous passez par l&apos;ARIPA, la revalorisation est normalement automatique. Vous pouvez quand même vérifier le calcul.
                  </p>
                </div>
              )}
              <div>
                <Label required>Email</Label>
                <Input type="email" value={form.email} onChange={v => update('email', v)} placeholder="votre@email.fr" />
                <p className="text-xs text-slate-muted mt-1">Pour recevoir votre calcul détaillé</p>
              </div>
            </div>
          </div>

          {/* Erreur */}
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={!canSubmit || loading}
            className={`w-full px-8 py-4 rounded-xl text-sm font-bold transition-all ${
              canSubmit && !loading ? 'cta-primary justify-center' : 'bg-slate-border text-slate-muted cursor-not-allowed'
            }`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Calcul en cours...
              </span>
            ) : 'Calculer ma pension revalorisée →'}
          </button>
        </div>
      </div>
    </section>
  )
}
