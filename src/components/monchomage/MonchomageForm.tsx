'use client'
import { useState, useEffect } from 'react'
import type { MonchomageFormData, MonchomagePreDiagResponse } from '@/lib/monchomage/types'
import type { MonchomageExtractionResult } from '@/lib/monchomage/extract-types'
import { track } from '@/lib/analytics'

interface Props {
  onResult: (result: MonchomagePreDiagResponse) => void
  initialData?: MonchomageExtractionResult | null
}

export function MonchomageForm({ onResult, initialData }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<MonchomageFormData>>({
    ageFinContrat: undefined, dateFinContrat: '', typeRupture: 'licenciement', typeContrat: 'cdi',
    salaireBrutMoyen: undefined, hasPrimes: false, primesTotal: 0,
    hasMaladie: false, maladieDuree: 0, hasActivitePartielle: false, apDuree: 0, multiEmployeurs: false,
    ajBrute: undefined, dureeIndemnisation: undefined, sjrNotification: null,
    degressiviteAppliquee: 'unknown', email: '',
  })

  // Auto-fill from extraction
  useEffect(() => {
    if (!initialData) return
    const { notification: n, emploi: e, bulletins: b } = initialData
    setForm(prev => ({
      ...prev,
      ...(e.dateFinContrat ? { dateFinContrat: e.dateFinContrat } : {}),
      ...(e.typeRupture ? { typeRupture: e.typeRupture as MonchomageFormData['typeRupture'] } : {}),
      ...(e.typeContrat ? { typeContrat: e.typeContrat as MonchomageFormData['typeContrat'] } : {}),
      ...(e.salaireBrutMoyen ? { salaireBrutMoyen: e.salaireBrutMoyen } : {}),
      ...(e.primesDetectees || b.primesIdentifiees.length > 0 ? {
        hasPrimes: true,
        primesTotal: e.primesDetectees || b.primesIdentifiees.reduce((s, p) => s + p.montant, 0),
      } : {}),
      ...(b.arretsMaladie ? { hasMaladie: true, maladieDuree: b.arretsMaladie } : {}),
      ...(n.ajBrute ? { ajBrute: n.ajBrute } : {}),
      ...(n.dureeIndemnisation ? { dureeIndemnisation: n.dureeIndemnisation } : {}),
      ...(n.sjr ? { sjrNotification: n.sjr } : {}),
      ...(n.degressivite !== 'unknown' ? { degressiviteAppliquee: n.degressivite } : {}),
    }))
  }, [initialData])

  const update = <K extends keyof MonchomageFormData>(key: K, value: MonchomageFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const canSubmit = !!form.ageFinContrat && !!form.dateFinContrat && !!form.salaireBrutMoyen
    && !!form.ajBrute && !!form.dureeIndemnisation
    && !!form.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    track({ event: 'form_submitted', brique: 'monchomage', source: initialData ? 'upload' : 'manual' })
    try {
      const payload = {
        ...form,
        ageFinContrat: Number(form.ageFinContrat || 0),
        salaireBrutMoyen: Number(form.salaireBrutMoyen || 0),
        primesTotal: Number(form.primesTotal || 0),
        maladieDuree: Number(form.maladieDuree || 0),
        apDuree: Number(form.apDuree || 0),
        ajBrute: Number(form.ajBrute || 0),
        dureeIndemnisation: Number(form.dureeIndemnisation || 0),
        sjrNotification: form.sjrNotification ? Number(form.sjrNotification) : null,
      }
      const res = await fetch('/api/monchomage/pre-diagnostic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Erreur'); return }
      onResult(data as MonchomagePreDiagResponse)
    } catch { setError('Erreur réseau. Réessayez.') }
    finally { setLoading(false) }
  }

  const Label = ({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) => (
    <div><label className="block text-sm font-semibold text-slate-text mb-1">{children}{required && <span className="text-red-400 ml-0.5">*</span>}</label>{hint && <p className="text-xs text-slate-muted mb-1.5">{hint}</p>}</div>
  )
  const Input = ({ value, onChange, type = 'text', placeholder, suffix, min, max }: {
    value: string | number | undefined | null; onChange: (v: string) => void; type?: string; placeholder?: string; suffix?: string; min?: number | string; max?: string
  }) => (
    <div className="relative">
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max}
        className="w-full px-4 py-3 border border-slate-border rounded-xl bg-white text-slate-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all" />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-muted">{suffix}</span>}
    </div>
  )
  const RadioGroup = ({ value, onChange, options }: { value: string | undefined; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${value === o.value ? 'bg-emerald/10 border-emerald text-emerald' : 'bg-white border-slate-border text-slate-muted hover:border-slate-text/30'}`}>{o.label}</button>
      ))}
    </div>
  )
  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button type="button" onClick={() => onChange(!value)}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border w-full text-left ${value ? 'bg-emerald/10 border-emerald text-emerald' : 'bg-white border-slate-border text-slate-muted hover:border-slate-text/30'}`}>
      {value ? '✓ ' : ''}{label}
    </button>
  )

  const isFromScan = !!initialData

  return (
    <section id="formulaire" className="py-16 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-2">
            {isFromScan ? 'Vérifiez les données extraites' : 'Vérifiez votre allocation chômage'}
          </h2>
          <p className="text-slate-muted text-sm">
            {isFromScan ? 'Les données ont été pré-remplies depuis vos documents. Complétez et corrigez si nécessaire.' : 'Pré-diagnostic gratuit en moins de 3 minutes'}
          </p>
        </div>

        {isFromScan && (
          <div className="mb-6 p-3 bg-emerald/5 border border-emerald/20 rounded-xl flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <p className="text-xs text-emerald font-medium">
              Données extraites automatiquement — {initialData.documents.length} document{initialData.documents.length > 1 ? 's' : ''} analysé{initialData.documents.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className="bg-slate-bg rounded-2xl border border-slate-border p-8 space-y-6">
          {/* Section 1 — Situation */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-text mb-4 flex items-center gap-2"><span>👤</span> Votre situation</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label required>Âge à la fin du contrat</Label><Input type="number" value={form.ageFinContrat} onChange={v => update('ageFinContrat', Number(v) || (undefined as any))} placeholder="35" suffix="ans" min={16} /></div>
                <div><Label required>Date de fin de contrat</Label><Input type="date" value={form.dateFinContrat} onChange={v => update('dateFinContrat', v)} max={new Date().toISOString().split('T')[0]} /></div>
              </div>
              <div><Label>Type de rupture</Label>
                <RadioGroup value={form.typeRupture} onChange={v => update('typeRupture', v as MonchomageFormData['typeRupture'])} options={[
                  { value: 'licenciement', label: 'Licenciement' }, { value: 'rupture_conv', label: 'Rupture conventionnelle' },
                  { value: 'fin_cdd', label: 'Fin de CDD' }, { value: 'demission', label: 'Démission' },
                ]} /></div>
              <div><Label>Type de contrat</Label>
                <RadioGroup value={form.typeContrat} onChange={v => update('typeContrat', v as MonchomageFormData['typeContrat'])} options={[
                  { value: 'cdi', label: 'CDI' }, { value: 'cdd', label: 'CDD' }, { value: 'interim', label: 'Intérim' }, { value: 'autre', label: 'Autre' },
                ]} /></div>
            </div>
          </div>

          {/* Section 2 — Rémunérations */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-text mb-4 flex items-center gap-2"><span>💰</span> Vos rémunérations {isFromScan ? '(pré-remplies)' : ''}</h3>
            <div className="space-y-4">
              <div><Label required hint="Moyenne sur les 24 derniers mois (ou 36 si ≥ 55 ans)">Salaire brut mensuel moyen</Label>
                <Input type="number" value={form.salaireBrutMoyen} onChange={v => update('salaireBrutMoyen', Number(v) || (undefined as any))} placeholder="2500" suffix="€/mois" min={0} /></div>
              <Toggle value={form.hasPrimes || false} onChange={v => update('hasPrimes', v)} label="J'ai perçu des primes / 13ème mois" />
              {form.hasPrimes && (
                <div className="ml-2 pl-4 border-l-2 border-emerald/20">
                  <Label hint="Total brut sur toute la période de référence">Montant total des primes</Label>
                  <Input type="number" value={form.primesTotal} onChange={v => update('primesTotal', Number(v) || 0)} placeholder="3000" suffix="€" min={0} />
                </div>
              )}
              <Toggle value={form.hasMaladie || false} onChange={v => update('hasMaladie', v)} label="J'ai eu des arrêts maladie / congé maternité" />
              {form.hasMaladie && (
                <div className="ml-2 pl-4 border-l-2 border-emerald/20">
                  <Label>Durée totale approximative</Label>
                  <Input type="number" value={form.maladieDuree} onChange={v => update('maladieDuree', Number(v) || 0)} placeholder="30" suffix="jours" min={0} />
                </div>
              )}
              <Toggle value={form.hasActivitePartielle || false} onChange={v => update('hasActivitePartielle', v)} label="J'ai été en activité partielle / chômage partiel" />
              {form.hasActivitePartielle && (
                <div className="ml-2 pl-4 border-l-2 border-emerald/20">
                  <Label>Durée approximative</Label>
                  <Input type="number" value={form.apDuree} onChange={v => update('apDuree', Number(v) || 0)} placeholder="60" suffix="jours" min={0} />
                </div>
              )}
              <Toggle value={form.multiEmployeurs || false} onChange={v => update('multiEmployeurs', v)} label="J'avais plusieurs employeurs sur la période" />
            </div>
          </div>

          {/* Section 3 — Notification */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-text mb-4 flex items-center gap-2"><span>📋</span> Notification France Travail {isFromScan ? '(pré-remplie)' : ''}</h3>
            {!isFromScan && <p className="text-xs text-slate-muted mb-4">Ces informations figurent sur votre notification de droits</p>}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label required hint="Montant journalier brut">Allocation journalière brute</Label>
                  <Input type="number" value={form.ajBrute} onChange={v => update('ajBrute', Number(v) || (undefined as any))} placeholder="38.50" suffix="€/jour" min={0} /></div>
                <div><Label required>Durée d&apos;indemnisation</Label>
                  <Input type="number" value={form.dureeIndemnisation} onChange={v => update('dureeIndemnisation', Number(v) || (undefined as any))} placeholder="730" suffix="jours" min={1} /></div>
              </div>
              <div><Label hint="Si visible sur votre notification (facultatif)">SJR (Salaire Journalier de Référence)</Label>
                <Input type="number" value={form.sjrNotification} onChange={v => update('sjrNotification', v ? Number(v) : null)} placeholder="75.00" suffix="€" min={0} /></div>
              <div><Label>La dégressivité vous est-elle appliquée ?</Label>
                <RadioGroup value={form.degressiviteAppliquee} onChange={v => update('degressiviteAppliquee', v as MonchomageFormData['degressiviteAppliquee'])} options={[
                  { value: 'yes', label: 'Oui' }, { value: 'no', label: 'Non' }, { value: 'unknown', label: 'Je ne sais pas' },
                ]} /></div>
              <div><Label required>Email</Label>
                <Input type="email" value={form.email} onChange={v => update('email', v)} placeholder="votre@email.fr" />
                <p className="text-xs text-slate-muted mt-1">Pour recevoir votre diagnostic</p></div>
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          <button onClick={handleSubmit} disabled={!canSubmit || loading}
            className={`w-full px-8 py-4 rounded-xl text-sm font-bold transition-all ${canSubmit && !loading ? 'cta-primary justify-center' : 'bg-slate-border text-slate-muted cursor-not-allowed'}`}>
            {loading ? (<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analyse en cours...</span>) : 'Vérifier mon allocation gratuitement →'}
          </button>
        </div>
      </div>
    </section>
  )
}
