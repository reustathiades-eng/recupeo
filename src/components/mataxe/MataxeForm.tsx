'use client'
import { useState, useMemo, useEffect } from 'react'
import type { MataxeFormData, MataxePreDiagResponse } from '@/lib/mataxe/types'
import type { MataxeExtractionResult } from '@/lib/mataxe/extract-types'
import { MataxeBaseNetteHelper } from './MataxeBaseNetteHelper'
import { MataxeReliabilityMeter } from './MataxeReliabilityMeter'
import { computeReliability } from '@/lib/mataxe/reliability'
import { track } from '@/lib/analytics'

interface MataxeFormProps {
  onResult: (result: MataxePreDiagResponse) => void
  onCommuneChange?: (commune: string) => void
  extractedData?: MataxeExtractionResult | null
}

const STEPS = [
  { label: 'Votre bien', icon: '🏠' },
  { label: 'État du bien', icon: '🔍' },
  { label: 'Taxe foncière', icon: '📄' },
  { label: 'Situation', icon: '👤' },
]

export function MataxeForm({ onResult, onCommuneChange, extractedData }: MataxeFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<Partial<MataxeFormData>>({
    propertyType: undefined,
    constructionYear: undefined,
    surfaceHabitable: undefined,
    roomCount: undefined,
    floor: null,
    elevator: undefined,
    bathroomCount: undefined,
    wcCount: undefined,
    heating: undefined,
    hasGarage: false,
    hasCave: false,
    hasBalcony: false,
    balconySurface: null,
    buildingCondition: undefined,
    propertyCondition: undefined,
    removedEquipment: undefined,
    removedEquipmentDetail: null,
    taxAmount: undefined,
    commune: '',
    vlcKnown: false,
    vlcAmount: null,
    has6675M: false,
    baseNette: null,
    ownerAge: undefined,
    beneficiaryAspaAah: false,
    isMainResidence: true,
    email: '',
  })

  // ─── Préremplissage depuis extraction 6675-M ───
  useEffect(() => {
    if (!extractedData) return
    const ext = extractedData.extracted
    const prefill: Partial<MataxeFormData> = {}

    // Commune
    if (ext.communeName?.value) {
      prefill.commune = ext.communeName.value
      onCommuneChange?.(ext.communeName.value)
    }

    // Surface réelle
    if (ext.surfaceReelle?.value && ext.surfaceReelle.value > 0) {
      prefill.surfaceHabitable = ext.surfaceReelle.value
    }

    // Base nette
    if (ext.baseNette?.value && ext.baseNette.value > 0) {
      prefill.baseNette = ext.baseNette.value
    }

    // Taxe
    if (ext.taxAmount?.value && ext.taxAmount.value > 0) {
      prefill.taxAmount = ext.taxAmount.value
    }

    // 6675-M is provided
    const has6675M = extractedData.documents.some(d => d.type === '6675m')
    if (has6675M) {
      prefill.has6675M = true
    }

    // VLC from extraction
    if (ext.vlcRevisee?.value || ext.vlcBrute?.value) {
      prefill.vlcKnown = true
      prefill.vlcAmount = ext.vlcRevisee?.value || ext.vlcBrute?.value || null
    }

    // Dépendances
    if (extractedData.dependencies) {
      for (const dep of extractedData.dependencies) {
        const name = dep.name.toLowerCase()
        if (name.includes('garage') || name.includes('parking')) prefill.hasGarage = true
        if (name.includes('cave') || name.includes('cellier')) prefill.hasCave = true
        if (name.includes('balcon') || name.includes('terrasse')) {
          prefill.hasBalcony = true
          if (dep.rawSurface > 0) prefill.balconySurface = dep.rawSurface
        }
      }
    }

    // Équipements → déduire chauffage
    if (extractedData.equipments) {
      const eqNames = extractedData.equipments.map(e => e.name.toLowerCase())
      if (eqNames.some(n => n.includes('chauffage central'))) {
        prefill.heating = 'central_individuel'
      }
    }

    setForm(prev => ({ ...prev, ...prefill }))

    if (has6675M) {
      track({ event: '6675m_extraction_prefill', brique: 'mataxe', fields_prefilled: Object.keys(prefill).length })
    }
  }, [extractedData]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Préremplissage depuis extraction 6675-M ───
  useEffect(() => {
    if (!extractedData) return
    const ext = extractedData.extracted
    const prefill: Partial<MataxeFormData> = {}

    // Commune
    if (ext.communeName?.value) {
      prefill.commune = ext.communeName.value
      onCommuneChange?.(ext.communeName.value)
    }

    // Surface réelle
    if (ext.surfaceReelle?.value && ext.surfaceReelle.value > 0) {
      prefill.surfaceHabitable = ext.surfaceReelle.value
    }

    // Base nette
    if (ext.baseNette?.value && ext.baseNette.value > 0) {
      prefill.baseNette = ext.baseNette.value
    }

    // Taxe
    if (ext.taxAmount?.value && ext.taxAmount.value > 0) {
      prefill.taxAmount = ext.taxAmount.value
    }

    // 6675-M is provided
    const has6675M = extractedData.documents.some(d => d.type === '6675m')
    if (has6675M) {
      prefill.has6675M = true
    }

    // VLC from extraction
    if (ext.vlcRevisee?.value || ext.vlcBrute?.value) {
      prefill.vlcKnown = true
      prefill.vlcAmount = ext.vlcRevisee?.value || ext.vlcBrute?.value || null
    }

    // Dépendances
    if (extractedData.dependencies) {
      for (const dep of extractedData.dependencies) {
        const name = dep.name.toLowerCase()
        if (name.includes('garage') || name.includes('parking')) prefill.hasGarage = true
        if (name.includes('cave') || name.includes('cellier')) prefill.hasCave = true
        if (name.includes('balcon') || name.includes('terrasse')) {
          prefill.hasBalcony = true
          if (dep.rawSurface > 0) prefill.balconySurface = dep.rawSurface
        }
      }
    }

    // Équipements: déduire chauffage
    if (extractedData.equipments) {
      const eqNames = extractedData.equipments.map(e => e.name.toLowerCase())
      if (eqNames.some(n => n.includes('chauffage central'))) {
        prefill.heating = 'central_individuel'
      }
    }

    setForm(prev => ({ ...prev, ...prefill }))

    if (has6675M) {
      track({ event: '6675m_extraction_prefill', brique: 'mataxe', fields_prefilled: Object.keys(prefill).length })
    }
  }, [extractedData]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = <K extends keyof MataxeFormData>(key: K, value: MataxeFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const reliability = useMemo(() => computeReliability({
    ...form,
    propertyType: form.propertyType || 'appartement',
    constructionYear: form.constructionYear || 1980,
    surfaceHabitable: form.surfaceHabitable || 0,
    roomCount: form.roomCount || 1,
    floor: form.floor ?? null,
    elevator: form.elevator || 'non',
    bathroomCount: form.bathroomCount ?? 0,
    wcCount: form.wcCount ?? 1,
    heating: form.heating || 'individuel',
    hasGarage: form.hasGarage ?? false,
    hasCave: form.hasCave ?? false,
    hasBalcony: form.hasBalcony ?? false,
    balconySurface: form.balconySurface ?? null,
    buildingCondition: form.buildingCondition || 'na',
    propertyCondition: form.propertyCondition || 'passable',
    removedEquipment: form.removedEquipment || 'non',
    removedEquipmentDetail: form.removedEquipmentDetail ?? null,
    taxAmount: form.taxAmount || 0,
    commune: form.commune || '',
    vlcKnown: form.vlcKnown ?? false,
    vlcAmount: form.vlcAmount ?? null,
    has6675M: form.has6675M ?? false,
    baseNette: form.baseNette ?? null,
    ownerAge: form.ownerAge || 30,
    beneficiaryAspaAah: form.beneficiaryAspaAah ?? false,
    isMainResidence: form.isMainResidence ?? true,
    email: form.email || '',
  } as MataxeFormData), [form])

  const canNext = (): boolean => {
    switch (step) {
      case 1:
        return !!form.propertyType && !!form.constructionYear && !!form.surfaceHabitable
          && !!form.roomCount && form.bathroomCount !== undefined && form.wcCount !== undefined
          && !!form.heating && form.hasGarage !== undefined && form.hasCave !== undefined
          && (!form.hasBalcony || (!!form.balconySurface && form.balconySurface > 0))
      case 2:
        return !!form.propertyCondition && !!form.removedEquipment
          && (form.removedEquipment !== 'oui' || (!!form.removedEquipmentDetail && form.removedEquipmentDetail.trim().length >= 3))
      case 3:
        return !!form.taxAmount && !!form.commune

      case 4:
        return !!form.ownerAge && !!form.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    track({ event: 'form_submitted', brique: 'mataxe', reliability_score: reliability.score })
    try {
      const payload = {
        ...form,
        constructionYear: Number(form.constructionYear || 1980),
        surfaceHabitable: Number(form.surfaceHabitable || 0),
        roomCount: Number(form.roomCount || 1),
        floor: form.floor !== null && form.floor !== undefined ? Number(form.floor) : null,
        elevator: form.propertyType === 'maison' ? 'na' as const : (form.elevator || 'non' as const),
        bathroomCount: Number(form.bathroomCount || 0),
        wcCount: Number(form.wcCount || 1),
        balconySurface: form.hasBalcony && form.balconySurface ? Number(form.balconySurface) : null,
        buildingCondition: form.propertyType === 'maison' ? 'na' as const : (form.buildingCondition || 'na' as const),
        taxAmount: Number(form.taxAmount || 0),
        vlcKnown: false,
        vlcAmount: null,
        baseNette: form.baseNette ? Number(form.baseNette) : null,
        ownerAge: Number(form.ownerAge || 30),
      }

      const res = await fetch('/api/mataxe/pre-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || "Erreur lors de l'analyse")
        return
      }
      onResult(data as MataxePreDiagResponse)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Composants form helpers ───

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="block text-sm font-semibold text-slate-text mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )

  const Input = ({ value, onChange, type = 'text', placeholder, min, max, suffix }: {
    value: string | number | undefined; onChange: (v: string) => void; type?: string; placeholder?: string; min?: number; max?: number; suffix?: string
  }) => (
    <div className="relative">
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full px-4 py-3 border border-slate-border rounded-xl bg-white text-slate-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all"
      />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-muted">{suffix}</span>}
    </div>
  )

  const Select = ({ value, onChange, options, placeholder }: {
    value: string | undefined; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string
  }) => (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-slate-border rounded-xl bg-white text-slate-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all appearance-none"
    >
      <option value="" disabled>{placeholder || 'Sélectionnez...'}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )

  const Toggle = ({ value, onChange, label }: { value: boolean | undefined; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${value ? 'bg-emerald' : 'bg-slate-border'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
      <span className="text-sm text-slate-text">{label}</span>
    </div>
  )

  const RadioGroup = ({ value, onChange, options }: {
    value: string | undefined; onChange: (v: string) => void; options: { value: string; label: string }[]
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            value === o.value
              ? 'bg-emerald/10 border-emerald text-emerald'
              : 'bg-white border-slate-border text-slate-muted hover:border-slate-text/30'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )

  // ─── Rendu des steps ───

  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <Label required>Type de bien</Label>
        <RadioGroup
          value={form.propertyType}
          onChange={v => update('propertyType', v as MataxeFormData['propertyType'])}
          options={[
            { value: 'appartement', label: '🏢 Appartement' },
            { value: 'maison', label: '🏡 Maison' },
            { value: 'autre', label: '🏗️ Autre' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Année de construction</Label>
          <Input type="number" value={form.constructionYear} onChange={v => update('constructionYear', Number(v) || undefined as any)} placeholder="1975" min={1800} max={2026} />
        </div>
        <div>
          <Label required>Surface habitable</Label>
          <Input type="number" value={form.surfaceHabitable} onChange={v => update('surfaceHabitable', Number(v) || undefined as any)} placeholder="75" suffix="m²" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Pièces principales</Label>
          <Input type="number" value={form.roomCount} onChange={v => update('roomCount', Number(v) || undefined as any)} placeholder="4" min={1} max={30} />
        </div>
        {form.propertyType === 'appartement' && (
          <div>
            <Label>Étage</Label>
            <Input type="number" value={form.floor ?? ''} onChange={v => update('floor', v ? Number(v) : null)} placeholder="3" min={0} max={50} />
          </div>
        )}
      </div>

      {form.propertyType === 'appartement' && (
        <div>
          <Label>Ascenseur</Label>
          <RadioGroup
            value={form.elevator}
            onChange={v => update('elevator', v as MataxeFormData['elevator'])}
            options={[
              { value: 'oui', label: 'Oui' },
              { value: 'non', label: 'Non' },
            ]}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Salles de bain / d&apos;eau</Label>
          <Input type="number" value={form.bathroomCount} onChange={v => update('bathroomCount', Number(v))} placeholder="1" min={0} max={10} />
        </div>
        <div>
          <Label required>WC</Label>
          <Input type="number" value={form.wcCount} onChange={v => update('wcCount', Number(v))} placeholder="1" min={0} max={10} />
        </div>
      </div>

      <div>
        <Label required>Chauffage</Label>
        <Select
          value={form.heating}
          onChange={v => update('heating', v as MataxeFormData['heating'])}
          options={[
            { value: 'central_collectif', label: 'Central collectif' },
            { value: 'central_individuel', label: 'Central individuel' },
            { value: 'individuel', label: 'Individuel (électrique, poêle...)' },
            { value: 'aucun', label: 'Aucun' },
          ]}
          placeholder="Type de chauffage"
        />
      </div>

      <div className="space-y-3">
        <Toggle value={form.hasGarage} onChange={v => update('hasGarage', v)} label="Garage / parking privatif" />
        <Toggle value={form.hasCave} onChange={v => update('hasCave', v)} label="Cave" />
        <Toggle value={form.hasBalcony} onChange={v => { update('hasBalcony', v); if (!v) update('balconySurface', null) }} label="Balcon / terrasse" />
        {form.hasBalcony && (
          <div className="ml-13 max-w-[200px]">
            <Input type="number" value={form.balconySurface ?? ''} onChange={v => update('balconySurface', v ? Number(v) : null)} placeholder="Surface" suffix="m²" />
          </div>
        )}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-5">
      {/* Texte pédagogique */}
      <div className="p-4 bg-navy/[0.03] rounded-xl border border-slate-border">
        <p className="text-sm text-slate-text leading-relaxed">
          <strong>Pourquoi ces questions sont importantes :</strong> l&apos;administration fiscale attribue un <em>coefficient d&apos;entretien</em> à votre bien (de 0,80 à 1,20). En pratique, elle applique souvent &laquo;Bon&raquo; (1,10) par défaut, même si le logement est en état passable ou médiocre. Chaque écart de 0,10 se traduit par ~10% de taxe en plus.
        </p>
      </div>

      {form.propertyType !== 'maison' && (
        <div>
          <Label>État général de l&apos;immeuble (copropriété)</Label>
          <RadioGroup
            value={form.buildingCondition}
            onChange={v => update('buildingCondition', v as any)}
            options={[
              { value: 'tres_bon', label: 'Très bon' },
              { value: 'bon', label: 'Bon' },
              { value: 'passable', label: 'Passable' },
              { value: 'mediocre', label: 'Médiocre' },
              { value: 'mauvais', label: 'Mauvais' },
            ]}
          />
        </div>
      )}

      <div>
        <Label required>État de votre logement</Label>
        <RadioGroup
          value={form.propertyCondition}
          onChange={v => update('propertyCondition', v as MataxeFormData['propertyCondition'])}
          options={[
            { value: 'tres_bon', label: 'Très bon' },
            { value: 'bon', label: 'Bon' },
            { value: 'passable', label: 'Passable' },
            { value: 'mediocre', label: 'Médiocre' },
            { value: 'mauvais', label: 'Mauvais' },
          ]}
        />
        <p className="text-xs text-slate-muted mt-2">
          L&apos;administration applique souvent un coefficient &laquo;bon&raquo; (1,10) par défaut. Si votre logement est en état passable ou moins, il y a probablement une surévaluation.
        </p>
      </div>

      <div>
        <Label required>Des équipements ont-ils été supprimés depuis l&apos;achat ?</Label>
        <p className="text-xs text-slate-muted mb-2">Ex : salle de bain supprimée, cheminée condamnée, WC retiré...</p>
        <RadioGroup
          value={form.removedEquipment}
          onChange={v => update('removedEquipment', v as MataxeFormData['removedEquipment'])}
          options={[
            { value: 'oui', label: 'Oui' },
            { value: 'non', label: 'Non' },
            { value: 'ne_sais_pas', label: 'Je ne sais pas' },
          ]}
        />
        {form.removedEquipment === 'oui' && (
          <div className="mt-3">
            <textarea
              value={form.removedEquipmentDetail || ''}
              onChange={e => update('removedEquipmentDetail', e.target.value)}
              placeholder="Précisez les équipements supprimés..."
              className="w-full px-4 py-3 border border-slate-border rounded-xl bg-white text-slate-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all resize-none"
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-5">
      <div>
        <Label required>Montant de votre dernière taxe foncière</Label>
        <Input type="number" value={form.taxAmount} onChange={v => update('taxAmount', Number(v) || undefined as any)} placeholder="1 200" suffix="€" />
        <p className="text-xs text-slate-muted mt-1">Montant total figurant sur votre avis d&apos;imposition</p>
      </div>

      <div>
        <Label required>Commune du bien</Label>
        <Input value={form.commune} onChange={v => { update('commune', v); onCommuneChange?.(v) }} placeholder="Ex: Lyon, Nantes, Marseille..." />
      </div>

      {/* Base nette — le champ clé pour la fiabilité */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <Label>Base nette d&apos;imposition (optionnel mais très utile)</Label>
        <p className="text-xs text-slate-muted mb-2">
          Ce chiffre figure sur votre avis de taxe foncière (ligne &laquo;Base&raquo; dans le tableau de calcul). Il nous permet de déduire le taux exact de votre commune et la VLC retenue par l&apos;administration → fiabilité passe à ~80%.
        </p>
        <Input type="number" value={form.baseNette ?? ''} onChange={v => { update('baseNette', v ? Number(v) : null); if (v && Number(v) > 0) track({ event: 'base_nette_filled', brique: 'mataxe' }) }} placeholder="Ex: 2 840" suffix="€" />
        <div className="mt-2">
          <MataxeBaseNetteHelper />
        </div>
      </div>

      <div>
        <Label>Disposez-vous du formulaire 6675-M ?</Label>
        <p className="text-xs text-slate-muted mb-2">La fiche d&apos;évaluation cadastrale détaillée de votre bien (optionnel, fiabilité → 95%)</p>
        <Toggle value={form.has6675M} onChange={v => update('has6675M', v)} label="Oui, j'ai le 6675-M" />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-5">
      <div>
        <Label required>Votre âge</Label>
        <Input type="number" value={form.ownerAge} onChange={v => update('ownerAge', Number(v) || undefined as any)} placeholder="55" min={18} max={120} suffix="ans" />
        {form.ownerAge && form.ownerAge >= 65 && (
          <p className="text-xs text-emerald mt-1 font-medium">
            ✨ Vous pourriez être éligible à une exonération ou un dégrèvement de taxe foncière !
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Toggle value={form.beneficiaryAspaAah} onChange={v => update('beneficiaryAspaAah', v)} label="Bénéficiaire ASPA, AAH ou ASI" />
        <Toggle value={form.isMainResidence} onChange={v => update('isMainResidence', v)} label="Ce bien est ma résidence principale" />
      </div>

      <div>
        <Label required>Email</Label>
        <Input type="email" value={form.email} onChange={v => update('email', v)} placeholder="votre@email.fr" />
        <p className="text-xs text-slate-muted mt-1">Pour recevoir votre pré-diagnostic et, si vous le souhaitez, le rapport complet</p>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return null
    }
  }

  return (
    <section id="formulaire" className="py-16 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-2">
            Vérifiez votre taxe foncière
          </h2>
          <p className="text-slate-muted text-sm">Remplissez les 4 sections — pré-diagnostic gratuit en moins de 2 minutes</p>
        </div>

        {/* Progress bar with connection lines */}
        <div className="flex items-center mb-8 px-2">
          {STEPS.map((s, i) => {
            const num = i + 1
            const active = step === num
            const done = step > num
            return (
              <div key={num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    done ? 'bg-emerald text-white' : active ? 'bg-emerald/20 text-emerald border-2 border-emerald' : 'bg-slate-bg text-slate-muted border border-slate-border'
                  }`}>
                    {done ? '✓' : s.icon}
                  </div>
                  <span className={`text-[11px] mt-1.5 font-medium whitespace-nowrap ${active ? 'text-emerald' : 'text-slate-muted'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mt-[-16px] rounded-full transition-all ${
                    step > num ? 'bg-emerald' : 'bg-slate-border'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Form card */}
        <div className="bg-slate-bg rounded-2xl border border-slate-border p-8">
          <h3 className="font-heading font-bold text-lg text-slate-text mb-6 flex items-center gap-2">
            <span>{STEPS[step - 1].icon}</span>
            {STEPS[step - 1].label}
            <span className="text-sm text-slate-muted font-normal ml-auto">Étape {step}/4</span>
          </h3>

          {/* Baromètre de fiabilité */}
          <div className="mb-6">
            <MataxeReliabilityMeter
              score={reliability.score}
              level={reliability.level}
              label={reliability.label}
              compact
            />
          </div>

          {/* Bannière extraction 6675-M */}
          {extractedData && extractedData.documents.some(d => d.type === '6675m') && (
            <div className="mb-6 p-3 bg-emerald/5 border border-emerald/20 rounded-xl">
              <p className="text-xs text-emerald font-medium">
                ✅ Données préremplies depuis votre formulaire 6675-M — vérifiez et complétez les champs manquants
              </p>
            </div>
          )}

          {/* Bannière extraction 6675-M */}
          {extractedData && extractedData.documents.some(d => d.type === '6675m') && (
            <div className="mb-6 p-3 bg-emerald/5 border border-emerald/20 rounded-xl">
              <p className="text-xs text-emerald font-medium">
                ✅ Données préremplies depuis votre formulaire 6675-M — vérifiez et complétez les champs manquants
              </p>
            </div>
          )}

          {renderCurrentStep()}

          {/* Animation de chargement IA */}
          {loading && (
            <div className="mt-4 p-6 bg-emerald/5 border border-emerald/20 rounded-xl text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald/10 flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-emerald" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-text mb-2">Analyse en cours...</p>
              <div className="space-y-1.5">
                {['Calcul de la surface pondérée', 'Détection des anomalies', 'Analyse par notre IA', 'Estimation du trop-perçu'].map((msg, i) => (
                  <p key={i} className="text-xs text-slate-muted animate-pulse" style={{ animationDelay: `${i * 1.5}s` }}>
                    {msg}...
                  </p>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-border">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl text-sm font-medium text-slate-muted hover:text-slate-text transition-colors"
              >
                ← Précédent
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={() => { if (canNext()) { track({ event: 'form_step_completed', brique: 'mataxe', step }); setStep(step + 1) } }}
                disabled={!canNext()}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                  canNext()
                    ? 'cta-primary'
                    : 'bg-slate-border text-slate-muted cursor-not-allowed'
                }`}
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canNext() || loading}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                  canNext() && !loading
                    ? 'cta-primary'
                    : 'bg-slate-border text-slate-muted cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Analyse IA en cours...
                  </span>
                ) : 'Analyser ma taxe foncière →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
