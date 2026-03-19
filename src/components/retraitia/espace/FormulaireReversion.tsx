'use client'
import { useState } from 'react'
import type { DefuntInfo, SurvivantInfo, BaseRegime } from '@/lib/retraitia/types'

interface FormulaireReversionProps {
  onComplete: (data: { defunt: DefuntInfo; survivant: SurvivantInfo }) => void
  initialDefunt?: Partial<DefuntInfo>
  initialSurvivant?: Partial<SurvivantInfo>
}

type Step = 'survivant' | 'defunt' | 'ressources'

const REGIMES_OPTIONS: { value: BaseRegime; label: string }[] = [
  { value: 'cnav', label: 'Salarié du privé' },
  { value: 'sre', label: `Fonctionnaire d'État` },
  { value: 'cnracl', label: 'Fonctionnaire territorial/hospitalier' },
  { value: 'msa_salarie', label: 'Agriculteur salarié' },
  { value: 'msa_exploitant', label: 'Agriculteur exploitant' },
  { value: 'ssi', label: 'Indépendant / commerçant / artisan' },
  { value: 'cnavpl', label: 'Profession libérale' },
]

export function FormulaireReversion({ onComplete, initialDefunt, initialSurvivant }: FormulaireReversionProps) {
  const [step, setStep] = useState<Step>('survivant')

  // Bloc A — Survivant
  const [dateNaissanceSurv, setDateNaissanceSurv] = useState(initialSurvivant?.estRetraite !== undefined ? '' : '')
  const [estRetraite, setEstRetraite] = useState<boolean | null>(initialSurvivant?.estRetraite ?? null)
  const [pensionPropre, setPensionPropre] = useState(initialSurvivant?.pensionPropre?.toString() || '')
  const [remarie, setRemarie] = useState<boolean | null>(initialSurvivant?.remarie ?? null)
  const [pacse, setPacse] = useState<boolean | null>(initialSurvivant?.pacse ?? null)
  const [enfantsACharge, setEnfantsACharge] = useState(initialSurvivant?.enfantsACharge?.toString() || '0')

  // Bloc B — Défunt
  const [prenomDefunt, setPrenomDefunt] = useState(initialDefunt?.prenom || '')
  const [nomDefunt, setNomDefunt] = useState(initialDefunt?.nom || '')
  const [nirDefunt, setNirDefunt] = useState(initialDefunt?.nir || '')
  const [dateDeces, setDateDeces] = useState(initialDefunt?.dateDeces || '')
  const [etaitRetraite, setEtaitRetraite] = useState<boolean | null>(initialDefunt?.etaitRetraite ?? null)
  const [pensionBase, setPensionBase] = useState(initialDefunt?.pensionBase?.toString() || '')
  const [pensionCompl, setPensionCompl] = useState(initialDefunt?.pensionComplementaire?.toString() || '')
  const [regimes, setRegimes] = useState<BaseRegime[]>(initialDefunt?.regimes || [])
  const [dateMariage, setDateMariage] = useState(initialSurvivant?.dateMariage || '')

  // Bloc C — Ressources
  const [ressources, setRessources] = useState(initialSurvivant?.ressourcesAnnuelles?.toString() || '')
  const [percRevActuelle, setPercRevActuelle] = useState<boolean | null>(null)
  const [proprietaire, setProprietaire] = useState<boolean | null>(null)

  const [alerteRemariage, setAlerteRemariage] = useState(false)

  // ── Navigation ──
  const goNext = () => {
    if (step === 'survivant') {
      if (remarie) setAlerteRemariage(true)
      setStep('defunt')
    } else if (step === 'defunt') setStep('ressources')
  }
  const goBack = () => {
    if (step === 'defunt') setStep('survivant')
    else if (step === 'ressources') setStep('defunt')
  }

  const handleSubmit = () => {
    const defunt: DefuntInfo = {
      prenom: prenomDefunt,
      nom: nomDefunt,
      nir: nirDefunt,
      dateDeces,
      etaitRetraite: etaitRetraite ?? false,
      pensionBase: pensionBase ? parseFloat(pensionBase) : undefined,
      pensionComplementaire: pensionCompl ? parseFloat(pensionCompl) : undefined,
      regimes,
      polypensionne: regimes.length > 1,
    }
    const survivant: SurvivantInfo = {
      estRetraite: estRetraite ?? false,
      pensionPropre: pensionPropre ? parseFloat(pensionPropre) : undefined,
      ressourcesAnnuelles: parseFloat(ressources) || 0,
      remarie: remarie ?? false,
      pacse: pacse ?? false,
      enfantsACharge: parseInt(enfantsACharge) || 0,
      dateMariage,
    }
    onComplete({ defunt, survivant })
  }

  const STEPS: { key: Step; label: string; num: number }[] = [
    { key: 'survivant', label: 'Votre situation', num: 1 },
    { key: 'defunt', label: 'Votre conjoint', num: 2 },
    { key: 'ressources', label: 'Ressources', num: 3 },
  ]

  return (
    <div>
      {/* Stepper */}
      <div className="flex gap-2 mb-6">
        {STEPS.map(s => (
          <div key={s.key} className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${
            step === s.key ? 'bg-emerald/10 text-emerald-dark border border-emerald/20'
              : STEPS.findIndex(x => x.key === step) > STEPS.findIndex(x => x.key === s.key) ? 'bg-emerald/5 text-emerald' : 'bg-slate-50 text-slate-400'
          }`}>
            {s.num}. {s.label}
          </div>
        ))}
      </div>

      {/* Alerte remariage */}
      {alerteRemariage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-amber-800 mb-1">Information importante</p>
          <p className="text-xs text-amber-700">
            Le remariage (ou le PACS pour les fonctionnaires) entraîne la perte du droit à réversion dans la plupart des régimes. Nous allons quand même vérifier votre situation précise.
          </p>
        </div>
      )}

      {/* Bloc A — Survivant */}
      {step === 'survivant' && (
        <div className="space-y-4">
          <h2 className="font-bold text-slate-900">Votre situation</h2>

          <Field label="Êtes-vous vous-même retraité(e) ?">
            <YesNo value={estRetraite} onChange={setEstRetraite} />
          </Field>

          {estRetraite && (
            <Field label="Montant de votre pension mensuelle (€)">
              <input type="number" value={pensionPropre} onChange={e => setPensionPropre(e.target.value)}
                className="input-field" placeholder="Ex : 1200" />
            </Field>
          )}

          <Field label="Vous êtes-vous remarié(e) depuis le décès ?">
            <YesNo value={remarie} onChange={setRemarie} />
          </Field>

          <Field label="Avez-vous contracté un PACS depuis le décès ?">
            <YesNo value={pacse} onChange={setPacse} />
          </Field>

          <Field label="Enfants à charge de moins de 21 ans">
            <input type="number" value={enfantsACharge} onChange={e => setEnfantsACharge(e.target.value)}
              className="input-field" min="0" max="10" />
          </Field>
        </div>
      )}

      {/* Bloc B — Défunt */}
      {step === 'defunt' && (
        <div className="space-y-4">
          <h2 className="font-bold text-slate-900">Votre conjoint décédé</h2>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom">
              <input type="text" value={prenomDefunt} onChange={e => setPrenomDefunt(e.target.value)}
                className="input-field" />
            </Field>
            <Field label="Nom">
              <input type="text" value={nomDefunt} onChange={e => setNomDefunt(e.target.value)}
                className="input-field" />
            </Field>
          </div>

          <Field label="N° de sécurité sociale du défunt">
            <input type="text" value={nirDefunt} onChange={e => setNirDefunt(e.target.value)}
              className="input-field" placeholder="1 XX XX XX XXX XXX XX" maxLength={15} />
          </Field>

          <Field label="Date du décès">
            <input type="date" value={dateDeces} onChange={e => setDateDeces(e.target.value)}
              className="input-field" />
          </Field>

          <Field label="Date de votre mariage">
            <input type="date" value={dateMariage} onChange={e => setDateMariage(e.target.value)}
              className="input-field" />
          </Field>

          <Field label="Le défunt était-il retraité au moment du décès ?">
            <YesNo value={etaitRetraite} onChange={setEtaitRetraite} />
          </Field>

          {etaitRetraite && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pension base (€/mois)">
                <input type="number" value={pensionBase} onChange={e => setPensionBase(e.target.value)}
                  className="input-field" placeholder="Ex : 1200" />
              </Field>
              <Field label="Pension complémentaire (€/mois)">
                <input type="number" value={pensionCompl} onChange={e => setPensionCompl(e.target.value)}
                  className="input-field" placeholder="Ex : 450" />
              </Field>
            </div>
          )}

          <Field label="Activité professionnelle principale du défunt">
            <div className="space-y-2">
              {REGIMES_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={regimes.includes(opt.value)}
                    onChange={e => {
                      if (e.target.checked) setRegimes([...regimes, opt.value])
                      else setRegimes(regimes.filter(r => r !== opt.value))
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-emerald focus:ring-emerald"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Field>
        </div>
      )}

      {/* Bloc C — Ressources */}
      {step === 'ressources' && (
        <div className="space-y-4">
          <h2 className="font-bold text-slate-900">Vos ressources</h2>

          <Field label="Vos ressources annuelles (hors réversion, €/an)">
            <input type="number" value={ressources} onChange={e => setRessources(e.target.value)}
              className="input-field" placeholder="Ex : 18000" />
            <p className="text-xs text-slate-400 mt-1">Revenus nets imposables, hors pension de réversion</p>
          </Field>

          <Field label="Percevez-vous déjà une pension de réversion ?">
            <YesNo value={percRevActuelle} onChange={setPercRevActuelle} />
          </Field>

          <Field label="Êtes-vous propriétaire de votre logement ?">
            <YesNo value={proprietaire} onChange={setProprietaire} />
          </Field>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step !== 'survivant' && (
          <button onClick={goBack}
            className="px-5 py-3 rounded-xl font-medium text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            ← Retour
          </button>
        )}
        {step !== 'ressources' ? (
          <button onClick={goNext}
            className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald text-[#060D1B] hover:bg-emerald-dark transition-colors">
            Suivant →
          </button>
        ) : (
          <button onClick={handleSubmit}
            disabled={regimes.length === 0 || !dateDeces || !dateMariage}
            className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald text-[#060D1B] hover:bg-emerald-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Valider le formulaire
          </button>
        )}
      </div>
    </div>
  )
}

// ── Sous-composants ──

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => onChange(true)}
        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${value === true ? 'bg-emerald/10 border-emerald text-emerald-dark' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
        Oui
      </button>
      <button onClick={() => onChange(false)}
        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${value === false ? 'bg-emerald/10 border-emerald text-emerald-dark' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
        Non
      </button>
    </div>
  )
}
