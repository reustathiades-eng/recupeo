'use client'
import { fmt } from '@/lib/format'
import { useState, useEffect } from 'react'
import { BANQUES_PRINCIPALES } from '@/lib/mabanque/constants'
import type { MabanqueFormData, MabanquePreDiagResponse } from '@/lib/mabanque/types'
import type { MabanqueExtractionResult } from '@/lib/mabanque/extract-types'
import { track } from '@/lib/analytics'

interface Props {
  onResult: (result: MabanquePreDiagResponse) => void
  /** Données pré-remplies depuis l'extraction du relevé bancaire */
  initialData?: MabanqueExtractionResult | null
}

export function MabanqueForm({ onResult, initialData }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<Partial<MabanqueFormData>>({
    banque: '',
    typeCompte: 'courant',
    commissionsIntervention: 0,
    commissionsNombre: 0,
    rejetsPrelevement: 0,
    rejetsPrelevementNombre: 0,
    rejetsCheque: 0,
    agios: 0,
    lettresInformation: 0,
    fraisTenueCompte: 0,
    autresFrais: 0,
    autresFraisDescription: '',
    totalFraisMois: undefined,
    estimationAnnuelle: null,
    clientFragile: 'unknown',
    offreSpecifique: 'unknown',
    surendettement: 'no',
    incidentsMultiples: 'unknown',
    inscritFCC: 'no',
    email: '',
  })

  // Auto-remplir depuis extraction
  useEffect(() => {
    if (!initialData) return
    const s = initialData.summary
    setForm(prev => ({
      ...prev,
      banque: initialData.banqueDetectee || prev.banque || '',
      commissionsIntervention: s.commissionsIntervention,
      commissionsNombre: s.commissionsNombre,
      rejetsPrelevement: s.rejetsPrelevement,
      rejetsPrelevementNombre: s.rejetsPrelevementNombre,
      rejetsCheque: s.rejetsCheque,
      agios: s.agios,
      lettresInformation: s.lettresInformation,
      fraisTenueCompte: s.fraisTenueCompte,
      autresFrais: s.autresFrais,
      autresFraisDescription: s.autresFraisLabels.join(', '),
      totalFraisMois: s.totalFraisMois,
    }))
  }, [initialData])

  const update = <K extends keyof MabanqueFormData>(key: K, value: MabanqueFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const calculatedTotal = (form.commissionsIntervention || 0) + (form.rejetsPrelevement || 0) +
    (form.rejetsCheque || 0) + (form.agios || 0) + (form.lettresInformation || 0) +
    (form.fraisTenueCompte || 0) + (form.autresFrais || 0)

  const canSubmit = !!form.banque
    && calculatedTotal > 0
    && !!form.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    track({ event: 'form_submitted', brique: 'mabanque', source: initialData ? 'upload' : 'manual' })
    try {
      const payload = {
        ...form,
        commissionsIntervention: Number(form.commissionsIntervention || 0),
        commissionsNombre: Number(form.commissionsNombre || 0),
        rejetsPrelevement: Number(form.rejetsPrelevement || 0),
        rejetsPrelevementNombre: Number(form.rejetsPrelevementNombre || 0),
        rejetsCheque: Number(form.rejetsCheque || 0),
        agios: Number(form.agios || 0),
        lettresInformation: Number(form.lettresInformation || 0),
        fraisTenueCompte: Number(form.fraisTenueCompte || 0),
        autresFrais: Number(form.autresFrais || 0),
        totalFraisMois: form.totalFraisMois ?? calculatedTotal,
        estimationAnnuelle: form.estimationAnnuelle ? Number(form.estimationAnnuelle) : null,
      }
      const res = await fetch('/api/mabanque/pre-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Erreur'); return }
      onResult(data as MabanquePreDiagResponse)
    } catch { setError('Erreur réseau. Réessayez.') }
    finally { setLoading(false) }
  }

  // ─── Helpers UI ───
  const Label = ({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-text mb-1">
        {children}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-muted mb-1.5">{hint}</p>}
    </div>
  )
  const Input = ({ value, onChange, type = 'text', placeholder, suffix, min }: {
    value: string | number | undefined; onChange: (v: string) => void; type?: string; placeholder?: string; suffix?: string; min?: number | string
  }) => (
    <div className="relative">
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} min={min}
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

  const isFromScan = !!initialData

  return (
    <section id="formulaire" className="py-16 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-2">
            {isFromScan ? 'Vérifiez les données extraites' : 'Auditez vos frais bancaires'}
          </h2>
          <p className="text-slate-muted text-sm">
            {isFromScan ? 'Les frais ont été pré-remplis depuis votre relevé. Corrigez si nécessaire.' : 'Pré-diagnostic gratuit en moins de 2 minutes'}
          </p>
        </div>

        {/* Badge scan */}
        {isFromScan && (
          <div className="mb-6 p-3 bg-emerald/5 border border-emerald/20 rounded-xl flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <p className="text-xs text-emerald font-medium">
              Frais extraits automatiquement de votre relevé {initialData.banqueDetectee ? `(${initialData.banqueDetectee})` : ''} — {initialData.fees.length} ligne{initialData.fees.length > 1 ? 's' : ''} identifiée{initialData.fees.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className="bg-slate-bg rounded-2xl border border-slate-border p-8 space-y-6">

          {/* Section 1 — Banque */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-text mb-4 flex items-center gap-2">
              <span>🏦</span> Votre banque
            </h3>
            <div className="space-y-4">
              <div>
                <Label required>Nom de votre banque</Label>
                <select value={form.banque} onChange={e => update('banque', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-border rounded-xl bg-white text-slate-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all">
                  <option value="">Sélectionnez votre banque</option>
                  {BANQUES_PRINCIPALES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <Label>Type de compte</Label>
                <RadioGroup value={form.typeCompte} onChange={v => update('typeCompte', v as 'courant' | 'joint')} options={[
                  { value: 'courant', label: 'Compte courant' },
                  { value: 'joint', label: 'Compte joint' },
                ]} />
              </div>
            </div>
          </div>

          {/* Section 2 — Frais */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-text mb-4 flex items-center gap-2">
              <span>💸</span> Vos frais {isFromScan ? '(pré-remplis)' : '(dernier mois)'}
            </h3>
            {!isFromScan && <p className="text-xs text-slate-muted mb-4">Reportez les montants de votre dernier relevé bancaire. Laissez 0 si non applicable.</p>}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label hint="Frais facturés par opération (max 8€/op, 80€/mois)">Commissions d&apos;intervention</Label>
                  <Input type="number" value={form.commissionsIntervention} onChange={v => update('commissionsIntervention', Number(v) || 0)} placeholder="0" suffix="€" min={0} />
                </div>
                <div>
                  <Label>Nombre d&apos;opérations facturées</Label>
                  <Input type="number" value={form.commissionsNombre} onChange={v => update('commissionsNombre', Number(v) || 0)} placeholder="0" min={0} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label hint="Max 20€ par rejet">Rejets de prélèvement</Label>
                  <Input type="number" value={form.rejetsPrelevement} onChange={v => update('rejetsPrelevement', Number(v) || 0)} placeholder="0" suffix="€" min={0} />
                </div>
                <div>
                  <Label>Nombre de rejets</Label>
                  <Input type="number" value={form.rejetsPrelevementNombre} onChange={v => update('rejetsPrelevementNombre', Number(v) || 0)} placeholder="0" min={0} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label hint="Max 30€ (≤ 50€) ou 50€ (> 50€)">Rejets de chèque</Label>
                  <Input type="number" value={form.rejetsCheque} onChange={v => update('rejetsCheque', Number(v) || 0)} placeholder="0" suffix="€" min={0} />
                </div>
                <div>
                  <Label>Agios / intérêts débiteurs</Label>
                  <Input type="number" value={form.agios} onChange={v => update('agios', Number(v) || 0)} placeholder="0" suffix="€" min={0} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label hint="Max 5,36€ par tranche de 7 jours">Lettres d&apos;information</Label>
                  <Input type="number" value={form.lettresInformation} onChange={v => update('lettresInformation', Number(v) || 0)} placeholder="0" suffix="€" min={0} />
                </div>
                <div>
                  <Label>Frais de tenue de compte</Label>
                  <Input type="number" value={form.fraisTenueCompte} onChange={v => update('fraisTenueCompte', Number(v) || 0)} placeholder="0" suffix="€/mois" min={0} />
                </div>
              </div>
              <div>
                <Label hint="Frais que vous ne comprenez pas ou ne reconnaissez pas">Autres frais inexpliqués</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input type="number" value={form.autresFrais} onChange={v => update('autresFrais', Number(v) || 0)} placeholder="0" suffix="€" min={0} />
                  <Input value={form.autresFraisDescription} onChange={v => update('autresFraisDescription', v)} placeholder="Description (optionnel)" />
                </div>
              </div>

              {/* Total auto-calculé */}
              <div className="bg-navy/5 rounded-xl p-4 border border-navy/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-text">Total frais du mois</span>
                  <span className="text-xl font-bold text-navy">{fmt(calculatedTotal)}€</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 — Situation */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-text mb-4 flex items-center gap-2">
              <span>👤</span> Votre situation
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Êtes-vous identifié comme &quot;client fragile&quot; par votre banque ?</Label>
                <RadioGroup value={form.clientFragile} onChange={v => update('clientFragile', v as MabanqueFormData['clientFragile'])} options={[
                  { value: 'yes', label: 'Oui' },
                  { value: 'no', label: 'Non' },
                  { value: 'unknown', label: 'Je ne sais pas' },
                ]} />
              </div>
              {(form.clientFragile === 'yes') && (
                <div className="ml-2 pl-4 border-l-2 border-emerald/20">
                  <Label>Avez-vous souscrit l&apos;offre spécifique à 3€/mois ?</Label>
                  <RadioGroup value={form.offreSpecifique} onChange={v => update('offreSpecifique', v as MabanqueFormData['offreSpecifique'])} options={[
                    { value: 'yes', label: 'Oui' },
                    { value: 'no', label: 'Non' },
                    { value: 'unknown', label: 'Je ne sais pas' },
                  ]} />
                </div>
              )}
              <div>
                <Label>Avez-vous un dossier de surendettement en cours ?</Label>
                <RadioGroup value={form.surendettement} onChange={v => update('surendettement', v as MabanqueFormData['surendettement'])} options={[
                  { value: 'yes', label: 'Oui' },
                  { value: 'no', label: 'Non' },
                  { value: 'unknown', label: 'Je ne sais pas' },
                ]} />
              </div>
              <div>
                <Label>Avez-vous eu 5 incidents de paiement ou plus en un seul mois ?</Label>
                <RadioGroup value={form.incidentsMultiples} onChange={v => update('incidentsMultiples', v as MabanqueFormData['incidentsMultiples'])} options={[
                  { value: 'yes', label: 'Oui' },
                  { value: 'no', label: 'Non' },
                  { value: 'unknown', label: 'Je ne sais pas' },
                ]} />
              </div>
              <div>
                <Label>Êtes-vous inscrit au Fichier Central des Chèques (FCC) ?</Label>
                <RadioGroup value={form.inscritFCC} onChange={v => update('inscritFCC', v as MabanqueFormData['inscritFCC'])} options={[
                  { value: 'yes', label: 'Oui' },
                  { value: 'no', label: 'Non' },
                  { value: 'unknown', label: 'Je ne sais pas' },
                ]} />
              </div>
              <div>
                <Label required>Email</Label>
                <Input type="email" value={form.email} onChange={v => update('email', v)} placeholder="votre@email.fr" />
                <p className="text-xs text-slate-muted mt-1">Pour recevoir votre diagnostic</p>
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
                Analyse en cours...
              </span>
            ) : 'Analyser mes frais gratuitement →'}
          </button>
        </div>
      </div>
    </section>
  )
}
