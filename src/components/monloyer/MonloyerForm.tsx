'use client'
import { useState, useRef, useEffect } from 'react'
import { track } from '@/lib/analytics'
import type { MonloyerFormData, MonloyerCheckResult, EligibleCity } from '@/lib/monloyer/types'
import { searchCities, findCity, getTerritoryForCity } from '@/lib/monloyer/cities'

interface Props {
  onResult: (data: MonloyerCheckResult, diagnosticId: string) => void
}

const CONSTRUCTION_ERAS = [
  { value: 'before_1946', label: 'Avant 1946' },
  { value: '1946_1970', label: '1946 - 1970' },
  { value: '1971_1990', label: '1971 - 1990' },
  { value: 'after_1990', label: 'Après 1990' },
]

const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'unknown'] as const
const DPE_LABELS: Record<string, string> = { unknown: 'Je ne sais pas' }

export function MonloyerForm({ onResult }: Props) {
  // Form state
  const [city, setCity] = useState('')
  const [selectedCity, setSelectedCity] = useState<EligibleCity | null>(null)
  const [citySuggestions, setCitySuggestions] = useState<EligibleCity[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cityNotEligible, setCityNotEligible] = useState(false)
  const [address, setAddress] = useState('')
  const [locationType, setLocationType] = useState<'vide' | 'meuble' | ''>('')
  const [rooms, setRooms] = useState<number | ''>('')
  const [constructionEra, setConstructionEra] = useState('')
  const [surface, setSurface] = useState<number | ''>('')
  const [currentRent, setCurrentRent] = useState<number | ''>('')
  const [hasComplement, setHasComplement] = useState<'yes' | 'no' | 'unknown' | ''>('')
  const [complementAmount, setComplementAmount] = useState<number | ''>('')
  const [bailDate, setBailDate] = useState('')
  const [dpe, setDpe] = useState<string>('')
  const [referenceRentMajore, setReferenceRentMajore] = useState<number | ''>('')
  const [email, setEmail] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // City autocomplete
  const handleCityInput = (val: string) => {
    setCity(val)
    setSelectedCity(null)
    setCityNotEligible(false)
    if (val.length >= 2) {
      const results = searchCities(val, 8)
      setCitySuggestions(results)
      setShowSuggestions(results.length > 0)
    } else {
      setCitySuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleCitySelect = (c: EligibleCity) => {
    setCity(c.name)
    setSelectedCity(c)
    setShowSuggestions(false)
    setCityNotEligible(false)
  }

  const handleCityBlur = () => {
    setTimeout(() => {
      if (!selectedCity && city.length >= 2) {
        const found = findCity(city)
        if (found) {
          setSelectedCity(found)
          setCity(found.name)
        } else {
          setCityNotEligible(true)
        }
      }
      setShowSuggestions(false)
    }, 200)
  }

  // Simulator URL
  const simulatorUrl = selectedCity
    ? getTerritoryForCity(selectedCity.name)?.simulatorUrl
    : null

  // Submit
  const handleSubmit = async () => {
    track({ event: 'form_submitted', brique: 'monloyer' })
    setError(null)
    setFieldErrors({})

    if (!selectedCity) {
      setError('Veuillez sélectionner une ville éligible dans la liste.')
      return
    }

    // Validation côté client avant envoi
    const missing: string[] = []
    if (!address || address.length < 5) missing.push('adresse complète')
    if (!locationType) missing.push('type de location')
    if (!rooms) missing.push('nombre de pièces')
    if (!constructionEra) missing.push('époque de construction')
    if (!surface || Number(surface) < 5) missing.push('surface')
    if (!currentRent || Number(currentRent) < 50) missing.push('loyer hors charges')
    if (!bailDate) missing.push('date du bail')
    if (!referenceRentMajore || Number(referenceRentMajore) < 1) missing.push('loyer de référence majoré')
    if (!email || !email.includes('@')) missing.push('email valide')
    if (missing.length > 0) {
      setError('Champs manquants : ' + missing.join(', '))
      document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    setLoading(true)
    try {
      const payload: MonloyerFormData = {
        city: selectedCity.name,
        address,
        locationType: locationType as 'vide' | 'meuble',
        rooms: (rooms || 1) as 1 | 2 | 3 | 4,
        constructionEra: constructionEra as MonloyerFormData['constructionEra'],
        surface: Number(surface),
        currentRent: Number(currentRent),
        hasComplement: (hasComplement || 'no') as 'yes' | 'no' | 'unknown',
        complementAmount: hasComplement === 'yes' ? Number(complementAmount) : undefined,
        bailDate,
        dpe: (dpe || 'unknown') as MonloyerFormData['dpe'],
        referenceRentMajore: Number(referenceRentMajore),
        email,
      }

      const res = await fetch('/api/monloyer/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (data.details) setFieldErrors(data.details)
        setError(data.error || 'Erreur de validation')
        setTimeout(() => document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
        return
      }

      onResult(data.data, data.diagnosticId)
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (name: string) =>
    fieldErrors[name] ? <p className="text-red-500 text-xs mt-1">{fieldErrors[name][0]}</p> : null

  return (
    <section id="formulaire" className="py-16 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            Vérifiez votre loyer en 30 secondes
          </h2>
          <p className="text-slate-muted text-base">
            Résultat complet et gratuit, sans engagement
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-border p-6 sm:p-8 shadow-sm space-y-6">

          {/* 1. Ville (autocomplete) */}
          <div className="relative" ref={suggestionsRef}>
            <label className="block text-sm font-semibold text-slate-text mb-1.5">
              Ville du logement <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={e => handleCityInput(e.target.value)}
              onBlur={handleCityBlur}
              onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Tapez le nom de votre ville (ex: Paris, Lyon, Lille...)"
              className="w-full px-4 py-3 rounded-xl border border-slate-border text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-border rounded-xl shadow-lg max-h-[240px] overflow-y-auto">
                {citySuggestions.map(c => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => handleCitySelect(c)}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald/5 transition-colors flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-text font-medium">{c.name}</span>
                    <span className="text-xs text-slate-muted">Depuis {c.since.replace('-', '/')}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedCity && (
              <p className="text-emerald text-xs mt-1.5 flex items-center gap-1">
                <span>&#10003;</span> {selectedCity.name} est soumise à l&apos;encadrement des loyers
              </p>
            )}
            {cityNotEligible && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                <p className="text-amber-700 font-semibold">&#9888; Cette ville n&apos;est pas concernée par l&apos;encadrement des loyers.</p>
                <p className="text-amber-600 text-xs mt-1">
                  Seules 69 communes en France sont concernées.{' '}
                  <a href="#villes" className="underline">Voir la liste</a>
                </p>
                <p className="text-amber-600 text-xs mt-2">
                  Vous payez un dépôt de garantie ?{' '}
                  <a href="/macaution" className="text-emerald font-semibold underline">Vérifiez avec MACAUTION</a>
                </p>
              </div>
            )}
            {fieldError('city')}
          </div>

          {/* 2. Adresse */}
          <div>
            <label className="block text-sm font-semibold text-slate-text mb-1.5">
              Adresse complète <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="12 rue de la Paix, 75002 Paris"
              className="w-full px-4 py-3 rounded-xl border border-slate-border text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
            />
            {fieldError('address')}
          </div>

          {/* 3-4. Type location + Pièces */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-text mb-1.5">
                Type de location <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                {(['vide', 'meuble'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLocationType(t)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                      locationType === t
                        ? 'border-emerald bg-emerald/5 text-emerald'
                        : 'border-slate-border text-slate-muted hover:border-slate-text/30'
                    }`}
                  >
                    {t === 'vide' ? 'Non meublé' : 'Meublé'}
                  </button>
                ))}
              </div>
              {fieldError('locationType')}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-text mb-1.5">
                Nombre de pièces <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRooms(n)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                      rooms === n
                        ? 'border-emerald bg-emerald/5 text-emerald'
                        : 'border-slate-border text-slate-muted hover:border-slate-text/30'
                    }`}
                  >
                    {n === 4 ? '4+' : n}
                  </button>
                ))}
              </div>
              {fieldError('rooms')}
            </div>
          </div>

          {/* 5. Construction */}
          <div>
            <label className="block text-sm font-semibold text-slate-text mb-1.5">
              Époque de construction <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONSTRUCTION_ERAS.map(e => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => setConstructionEra(e.value)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    constructionEra === e.value
                      ? 'border-emerald bg-emerald/5 text-emerald'
                      : 'border-slate-border text-slate-muted hover:border-slate-text/30'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
            {fieldError('constructionEra')}
          </div>

          {/* 6-7. Surface + Loyer */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-text mb-1.5">
                Surface (m²) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={surface}
                onChange={e => setSurface(e.target.value ? Number(e.target.value) : '')}
                placeholder="45"
                min={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-border text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
              />
              {fieldError('surface')}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-text mb-1.5">
                Loyer hors charges (&euro;/mois) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={currentRent}
                onChange={e => setCurrentRent(e.target.value ? Number(e.target.value) : '')}
                placeholder="1 200"
                min={50}
                className="w-full px-4 py-3 rounded-xl border border-slate-border text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
              />
              {fieldError('currentRent')}
            </div>
          </div>

          {/* 8. Complément de loyer */}
          <div>
            <label className="block text-sm font-semibold text-slate-text mb-1.5">
              Un complément de loyer est-il appliqué ?
            </label>
            <div className="flex gap-2">
              {([['yes', 'Oui'], ['no', 'Non'], ['unknown', 'Je ne sais pas']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setHasComplement(val)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                    hasComplement === val
                      ? 'border-emerald bg-emerald/5 text-emerald'
                      : 'border-slate-border text-slate-muted hover:border-slate-text/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {hasComplement === 'yes' && (
              <div className="mt-3">
                <input
                  type="number"
                  value={complementAmount}
                  onChange={e => setComplementAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Montant du complément (€/mois)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-border text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
                />
              </div>
            )}
            {fieldError('hasComplement')}
            {fieldError('complementAmount')}
          </div>

          {/* 9-10. Date bail + DPE */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-text mb-1.5">
                Date de signature du bail <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={bailDate}
                onChange={e => setBailDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-slate-border text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
              />
              {fieldError('bailDate')}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-text mb-1.5">
                DPE du logement
              </label>
              <select
                value={dpe}
                onChange={e => setDpe(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-border text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald bg-white"
              >
                <option value="">Sélectionnez...</option>
                {DPE_OPTIONS.map(d => (
                  <option key={d} value={d}>{DPE_LABELS[d] || `DPE ${d}`}</option>
                ))}
              </select>
              {fieldError('dpe')}
            </div>
          </div>

          {/* 11. Loyer de référence majoré */}
          <div className="bg-slate-bg rounded-xl border border-slate-border p-4">
            <label className="block text-sm font-semibold text-slate-text mb-1.5">
              Loyer de référence majoré (&euro;/mois) <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-slate-muted mb-3">
              Consultez le simulateur officiel de votre ville pour trouver ce montant.
              {simulatorUrl && (
                <>
                  {' '}
                  <a
                    href={simulatorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald font-semibold underline"
                  >
                    Ouvrir le simulateur officiel &rarr;
                  </a>
                </>
              )}
            </p>
            <input
              type="number"
              value={referenceRentMajore}
              onChange={e => setReferenceRentMajore(e.target.value ? Number(e.target.value) : '')}
              placeholder="Montant total du loyer de référence majoré"
              min={1}
              className="w-full px-4 py-3 rounded-xl border border-slate-border text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald bg-white"
            />
            {fieldError('referenceRentMajore')}
          </div>

          {/* 12. Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-text mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-border text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
            />
            <p className="text-xs text-slate-muted mt-1">Pour recevoir votre résultat. Aucun spam.</p>
            {fieldError('email')}
          </div>

          {/* Erreur globale */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              &#9888; {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="cta-primary w-full !text-[17px] !py-[18px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Vérification en cours...
              </span>
            ) : (
              'Vérifier mon loyer gratuitement'
            )}
          </button>

          <p className="text-xs text-slate-muted text-center flex flex-wrap items-center justify-center gap-3">
            <span>&#128274; Données chiffrées</span>
            <span className="text-slate-border">&middot;</span>
            <span>&#127467;&#127479; Serveur en France</span>
            <span className="text-slate-border">&middot;</span>
            <span>&#10060; Aucun spam</span>
            <span className="text-slate-border">&middot;</span>
            <span>&#128176; 100% gratuit</span>
          </p>
        </div>
      </div>
    </section>
  )
}
