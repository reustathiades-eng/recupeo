'use client'
import { useState } from 'react'
import { track } from '@/lib/analytics'
import type { MonimpotPreDiagResponse } from '@/lib/monimpot/types'

import type { MonimpotFormData } from '@/lib/monimpot/types'

function fmtInput(val: number | string | undefined): string {
  if (val === undefined || val === '') return ''
  const num = typeof val === 'string' ? parseInt(val, 10) : val
  if (isNaN(num)) return ''
  if (num === 0) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
}

function parseInput(raw: string): number | '' {
  const cleaned = raw.replace(/[^0-9]/g, '')
  return cleaned === '' ? '' : Number(cleaned)
}

// Classes visuelles
const importedCls = "border-emerald-300 bg-emerald-50/30" // champ pré-rempli
const needInputCls = "border-amber-300 bg-amber-50/30"    // champ à remplir

interface Props {
  onResult: (data: MonimpotPreDiagResponse) => void
  initialData?: Partial<MonimpotFormData>
}

type Step = 'profil' | 'revenus' | 'deductions'

export function MonimpotForm({ onResult, initialData }: Props) {
  const [step, setStep] = useState<Step>('profil')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Profil
  const [situation, setSituation] = useState(initialData?.situation || '')
  const [vivezSeul, setVivezSeul] = useState(initialData?.vivezSeul ?? false)
  const [enfantsMineurs, setEnfantsMineurs] = useState(initialData?.enfantsMineurs ?? 0)
  const [enfantsMajeurs, setEnfantsMajeurs] = useState(initialData?.enfantsMajeurs ?? 0)
  const [eleveSeul5ans, setEleveSeul5ans] = useState(initialData?.eleveSeul5ans ?? false)
  const [age, setAge] = useState<number | ''>(initialData?.age ?? '')
  const [invalidite, setInvalidite] = useState(initialData?.invalidite ?? false)

  // Revenus
  const [revenuNet, setRevenuNet] = useState<number | ''>(initialData?.revenuNetImposable ?? '')
  const [nbParts, setNbParts] = useState<number | ''>(initialData?.nbParts ?? '')
  const [impotPaye, setImpotPaye] = useState<number | ''>(initialData?.impotPaye ?? '')
  const [typeRevenus, setTypeRevenus] = useState(initialData?.typeRevenus || 'salaires')

  // Déductions
  const [fraisReels, setFraisReels] = useState(initialData?.fraisReels ?? false)
  const [distance, setDistance] = useState<number | ''>(initialData?.distanceTravail ?? '')
  const [puissance, setPuissance] = useState<number | ''>(initialData?.puissanceFiscale ?? 5)
  const [teletravail, setTeletravail] = useState(initialData?.teletravail ?? false)
  const [joursTele, setJoursTele] = useState(initialData?.joursTeletravail ?? 0)

  const [pensionAli, setPensionAli] = useState(initialData?.pensionAlimentaire ?? false)
  const [pensionMois, setPensionMois] = useState<number | ''>(initialData?.pensionMontantMois ?? '')
  const [dons, setDons] = useState(initialData?.dons ?? false)
  const [donsMontant, setDonsMontant] = useState<number | ''>(initialData?.donsMontantAn ?? '')
  const [emploiDom, setEmploiDom] = useState(initialData?.emploiDomicile ?? false)
  const [emploiMontant, setEmploiMontant] = useState<number | ''>(initialData?.emploiDomicileMontantAn ?? '')
  const [garde, setGarde] = useState(initialData?.gardeEnfant ?? false)
  const [gardeMontant, setGardeMontant] = useState<number | ''>(initialData?.gardeMontantAn ?? '')
  const [ehpad, setEhpad] = useState(initialData?.ehpad ?? false)
  const [ehpadMontant, setEhpadMontant] = useState<number | ''>(initialData?.ehpadMontantAn ?? '')
  const [per, setPer] = useState(initialData?.per ?? false)
  const [perMontant, setPerMontant] = useState<number | ''>(initialData?.perMontantAn ?? '')
  const [revCapitaux, setRevCapitaux] = useState(initialData?.revenusCapitaux ?? false)
  const [case2op, setCase2op] = useState<boolean | null>(initialData?.case2op ?? null)

  const [email, setEmail] = useState(initialData?.email || '')

  const handleSubmit = async () => {
    const missing: string[] = []
    if (!situation) missing.push('situation familiale')
    if (age === '' || age === undefined) missing.push('\u00e2ge')
    if (revenuNet === '' || revenuNet === undefined) missing.push('revenu net imposable')
    if (nbParts === '' || nbParts === undefined) missing.push('nombre de parts')
    if (impotPaye === '' || impotPaye === undefined) missing.push('imp\u00f4t pay\u00e9')
    // email est optionnel
    if (missing.length > 0) {
      setError(`Champ${missing.length > 1 ? 's' : ''} manquant${missing.length > 1 ? 's' : ''} : ${missing.join(', ')}.`)
      return
    }
    setLoading(true); setError('')
    track({ event: 'form_submitted', brique: 'monimpot' })

    try {
      const res = await fetch('/api/monimpot/pre-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation, vivezSeul, enfantsMineurs, enfantsMajeurs, eleveSeul5ans,
          age: Number(age), invalidite,
          revenuNetImposable: Number(revenuNet), nbParts: Number(nbParts),
          impotPaye: Number(impotPaye), typeRevenus,
          fraisReels, distanceTravail: distance ? Number(distance) : undefined,
          puissanceFiscale: puissance ? Number(puissance) : undefined,
          teletravail, joursTeletravail: joursTele,
          pensionAlimentaire: pensionAli, pensionMontantMois: pensionMois ? Number(pensionMois) : undefined,
          dons, donsMontantAn: donsMontant ? Number(donsMontant) : undefined,
          emploiDomicile: emploiDom, emploiDomicileMontantAn: emploiMontant ? Number(emploiMontant) : undefined,
          gardeEnfant: garde, gardeMontantAn: gardeMontant ? Number(gardeMontant) : undefined,
          ehpad, ehpadMontantAn: ehpadMontant ? Number(ehpadMontant) : undefined,
          per, perMontantAn: perMontant ? Number(perMontant) : undefined,
          revenusCapitaux: revCapitaux, case2op,
          email: email.toLowerCase().trim(),
        }),
      })
      const data = await res.json()
      if (data.success) { onResult(data) }
      else { setError(data.error || 'Erreur lors du diagnostic.') }
    } catch { setError('Erreur réseau.') }
    finally { setLoading(false) }
  }

  const inputCls = "w-full px-4 py-3 border border-slate-200 rounded-xl text-navy text-sm placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
  const labelCls = "block text-sm font-medium text-navy mb-1.5"
  const toggleCls = (active: boolean) => `px-4 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${active ? 'border-emerald bg-emerald/5 text-navy' : 'border-slate-200 text-slate-muted hover:border-slate-300'}`

  return (
    <section id="formulaire" className="py-12 bg-white">
      <div className="max-w-[640px] mx-auto px-6">
        <h2 className="font-heading text-2xl font-bold text-navy text-center mb-2">
          Vérifiez votre déclaration de revenus
        </h2>
        <p className="text-slate-muted text-sm text-center mb-8">
          Répondez à ces questions en 3 minutes. Vérification gratuite et immédiate.
        </p>

        {/* Steps indicator */}
        <div id="form-steps" className="flex items-center justify-center gap-4 mb-8 scroll-mt-24">
          {(['profil', 'revenus', 'deductions'] as Step[]).map((s, i) => (
            <button key={s} onClick={() => setStep(s)} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s ? 'bg-emerald text-white' :
                (['profil', 'revenus', 'deductions'].indexOf(step) > i ? 'bg-emerald/20 text-emerald' : 'bg-slate-100 text-slate-muted')
              }`}>{i + 1}</div>
              <span className={`text-xs font-medium hidden sm:inline ${step === s ? 'text-navy' : 'text-slate-muted'}`}>
                {s === 'profil' ? 'Profil fiscal' : s === 'revenus' ? 'Revenus' : 'Déductions'}
              </span>
            </button>
          ))}
        </div>

        {/* Step 1: Profil */}
        {step === 'profil' && (
          <div className="space-y-5">
            {initialData && (
              <div className="text-sm bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700">
                📄 Données pré-remplies depuis votre avis. Vérifiez et corrigez si nécessaire.
              </div>
            )}
            <div>
              <label className={labelCls}>
                Situation familiale *
                {initialData && situation && <span className="text-emerald-500 text-xs font-normal ml-2">✓ extrait</span>}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: 'celibataire', l: 'Célibataire' }, { v: 'marie_pacse', l: 'Marié(e)/Pacsé(e)' },
                  { v: 'divorce_separe', l: 'Divorcé(e)/Séparé(e)' }, { v: 'veuf', l: 'Veuf/Veuve' },
                ].map(o => (
                  <button key={o.v} type="button" onClick={() => setSituation(o.v)} className={toggleCls(situation === o.v)}>{o.l}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={vivezSeul} onChange={e => setVivezSeul(e.target.checked)} className="accent-emerald" id="seul" />
              <label htmlFor="seul" className="text-sm text-navy">Je vis seul(e)</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Enfants mineurs à charge
                  {initialData && <span className="text-emerald-500 text-xs font-normal ml-2">✓ extrait</span>}
                </label>
                <input type="text" inputMode="numeric" value={String(enfantsMineurs)} onChange={e => setEnfantsMineurs(parseInput(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Enfants majeurs rattachés</label>
                <input type="text" inputMode="numeric" value={String(enfantsMajeurs)} onChange={e => setEnfantsMajeurs(parseInput(e.target.value) || 0)} className={inputCls} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={eleveSeul5ans} onChange={e => setEleveSeul5ans(e.target.checked)} className="accent-emerald" id="eleve" />
              <label htmlFor="eleve" className="text-sm text-navy">J'ai élevé seul(e) un enfant pendant 5 ans ou plus (case L)</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Votre âge *
                  {initialData && (age === '' || age === undefined) && (
                    <span className="text-amber-500 text-xs font-normal ml-2">⚠ Non disponible sur l\u2019avis \u2014 \u00e0 remplir</span>
                  )}
                </label>
                <input type="text" inputMode="numeric" value={age === "" ? "" : String(age)} onChange={e => setAge(parseInput(e.target.value))} placeholder="ex: 45" className={`${inputCls} ${initialData && (age === '' || age === undefined) ? needInputCls : initialData ? importedCls : ''}`} />
              </div>
              <div className="flex items-center gap-3 pt-7">
                <input type="checkbox" checked={invalidite} onChange={e => setInvalidite(e.target.checked)} className="accent-emerald" id="inv" />
                <label htmlFor="inv" className="text-sm text-navy">Invalidité reconnue</label>
              </div>
            </div>
            {(!situation || age === '' || age === undefined) && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                {!situation ? '→ S\u00e9lectionnez votre situation familiale' : '→ Renseignez votre \u00e2ge (n\u00e9cessaire pour l\u2019abattement seniors)'}
              </p>
            )}
            <button onClick={() => { track({ event: 'form_step_completed', brique: 'monimpot', step: 'profil' }); setStep('revenus'); setTimeout(() => document.getElementById('form-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100) }} disabled={!situation || age === '' || age === undefined} className="cta-primary w-full justify-center !py-3.5 disabled:opacity-50">
              Continuer →
            </button>
          </div>
        )}

        {/* Step 2: Revenus */}
        {step === 'revenus' && (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>
                Revenu net imposable (dernier avis) *
                {initialData && revenuNet !== '' && revenuNet !== undefined && <span className="text-emerald-500 text-xs font-normal ml-2">✓ extrait</span>}
              </label>
              <input type="text" inputMode="numeric" value={fmtInput(revenuNet)} onChange={e => setRevenuNet(parseInput(e.target.value))} placeholder="ex: 32000" className={`${inputCls} ${initialData && revenuNet !== '' && revenuNet !== undefined ? importedCls : ''}`} />
              <p className="text-[11px] text-slate-muted mt-1">Ligne "Revenu net imposable" de votre avis d'imposition</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Nombre de parts fiscales *
                  {initialData && nbParts !== '' && nbParts !== undefined && <span className="text-emerald-500 text-xs font-normal ml-2">✓ extrait</span>}
                </label>
                <input type="text" inputMode="numeric" value={nbParts === "" ? "" : String(nbParts)} onChange={e => setNbParts(parseInput(e.target.value))} placeholder="ex: 2.5" className={`${inputCls} ${initialData && nbParts !== '' && nbParts !== undefined ? importedCls : ''}`} />
              </div>
              <div>
                <label className={labelCls}>
                  Impôt payé (€) *
                  {initialData && impotPaye !== '' && impotPaye !== undefined && <span className="text-emerald-500 text-xs font-normal ml-2">✓ extrait</span>}
                </label>
                <input type="text" inputMode="numeric" value={fmtInput(impotPaye)} onChange={e => setImpotPaye(parseInput(e.target.value))} placeholder="ex: 3200" className={`${inputCls} ${initialData && impotPaye !== '' && impotPaye !== undefined ? importedCls : ''}`} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Type de revenus principal</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: 'salaires', l: 'Salaires' }, { v: 'retraite', l: 'Retraite' },
                  { v: 'mixte', l: 'Mixte' }, { v: 'independant', l: 'Indépendant' },
                ].map(o => (
                  <button key={o.v} type="button" onClick={() => setTypeRevenus(o.v as "salaires"|"retraite"|"mixte"|"independant")} className={toggleCls(typeRevenus === o.v)}>{o.l}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep('profil'); setTimeout(() => document.getElementById('form-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100) }} className="px-5 py-3 border border-slate-200 text-slate-muted text-sm font-medium rounded-xl hover:bg-slate-50">← Retour</button>
              <button onClick={() => { track({ event: 'form_step_completed', brique: 'monimpot', step: 'revenus' }); setStep('deductions'); setTimeout(() => document.getElementById('form-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100) }} disabled={revenuNet === '' || revenuNet === undefined || nbParts === '' || nbParts === undefined || impotPaye === '' || impotPaye === undefined} className="cta-primary flex-1 justify-center !py-3.5 disabled:opacity-50">
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Déductions */}
        {step === 'deductions' && (
          <div className="space-y-5">
            {initialData ? (
              <div className="text-sm bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-navy font-bold mb-1">💰 Cherchons vos économies</p>
                <p className="text-slate-600">Vos revenus et impôt sont déjà importés. Les questions ci-dessous portent sur des <strong>avantages fiscaux non détectés</strong> sur votre avis. Répondez <strong>Oui</strong> si vous en bénéficiez déjà, ou renseignez un montant pour vérifier si vous y avez droit.</p>
              </div>
            ) : (
              <p className="text-sm text-slate-muted bg-slate-bg rounded-xl p-4">
                Cochez <strong>Oui</strong> si vous déclarez déjà cet avantage. Si vous répondez <strong>Non</strong> mais renseignez un montant, nous vérifierons si vous y avez droit.
              </p>
            )}

            {/* Frais réels */}
            <div className="p-4 border border-slate-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-navy">Déclarez-vous vos frais réels ?</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFraisReels(true)} className={toggleCls(fraisReels)}>Oui</button>
                  <button type="button" onClick={() => setFraisReels(false)} className={toggleCls(!fraisReels)}>Non</button>
                </div>
              </div>
              {!fraisReels && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-slate-muted">Distance domicile-travail (km aller)</label>
                    <input type="text" inputMode="numeric" value={distance === "" ? "" : String(distance)} onChange={e => setDistance(parseInput(e.target.value))} className={inputCls} placeholder="ex: 25" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-muted">Puissance fiscale véhicule</label>
                    <select value={puissance} onChange={e => setPuissance(+e.target.value)} className={inputCls}>
                      {[3,4,5,6,7].map(p => <option key={p} value={p}>{p} CV</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <input type="checkbox" checked={teletravail} onChange={e => setTeletravail(e.target.checked)} className="accent-emerald" id="tele" />
                    <label htmlFor="tele" className="text-xs text-navy">Télétravail</label>
                    {teletravail && (
                      <select value={joursTele} onChange={e => setJoursTele(+e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs">
                        {[1,2,3,4,5].map(j => <option key={j} value={j}>{j} j/sem</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Toggle items rapides */}
            {[
              { label: 'Versez-vous une pension alimentaire ?', checked: pensionAli, toggle: setPensionAli, show: !pensionAli, field: <input type="text" inputMode="numeric" value={fmtInput(pensionMois)} onChange={e => setPensionMois(parseInput(e.target.value))} placeholder="Montant/mois (€)" className={inputCls} /> },
              { label: 'Faites-vous des dons à des associations ?', checked: dons, toggle: setDons, show: !dons, field: <input type="text" inputMode="numeric" value={fmtInput(donsMontant)} onChange={e => setDonsMontant(parseInput(e.target.value))} placeholder="Montant/an (€)" className={inputCls} /> },
              { label: 'Employez-vous quelqu\'un à domicile ?', checked: emploiDom, toggle: setEmploiDom, show: !emploiDom, field: <input type="text" inputMode="numeric" value={fmtInput(emploiMontant)} onChange={e => setEmploiMontant(parseInput(e.target.value))} placeholder="Montant/an (€)" className={inputCls} /> },
              { label: 'Frais de garde d\'enfants < 6 ans ?', checked: garde, toggle: setGarde, show: !garde && enfantsMineurs > 0, field: <input type="text" inputMode="numeric" value={fmtInput(gardeMontant)} onChange={e => setGardeMontant(parseInput(e.target.value))} placeholder="Montant/an (€)" className={inputCls} /> },
              { label: 'Payez-vous un EHPAD pour un parent ?', checked: ehpad, toggle: setEhpad, show: !ehpad, field: <input type="text" inputMode="numeric" value={fmtInput(ehpadMontant)} onChange={e => setEhpadMontant(parseInput(e.target.value))} placeholder="Montant/an (€)" className={inputCls} /> },
              { label: 'Versez-vous sur un PER ?', checked: per, toggle: setPer, show: !per, field: <input type="text" inputMode="numeric" value={fmtInput(perMontant)} onChange={e => setPerMontant(parseInput(e.target.value))} placeholder="Montant/an (€)" className={inputCls} /> },
            ].map((item, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-navy">{item.label}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => item.toggle(true)} className={toggleCls(item.checked)}>Oui</button>
                    <button type="button" onClick={() => item.toggle(false)} className={toggleCls(!item.checked)}>Non</button>
                  </div>
                </div>
                {item.show && <div className="pt-1">{item.field}</div>}
              </div>
            ))}

            {/* Email */}
            <div>
              <label className={labelCls}>Votre email <span className="text-slate-400 font-normal">(optionnel)</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jean.dupont@email.fr" className={inputCls} />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setStep('revenus'); setTimeout(() => document.getElementById('form-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100) }} className="px-5 py-3 border border-slate-200 text-slate-muted text-sm font-medium rounded-xl hover:bg-slate-50">← Retour</button>
              <button onClick={handleSubmit} disabled={loading} className="cta-primary flex-1 justify-center !py-3.5 disabled:opacity-50">
                {loading ? 'Analyse en cours...' : 'Analyser ma déclaration →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
