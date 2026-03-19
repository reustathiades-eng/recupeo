"use client"
import { useState, useEffect } from 'react'
import { useDossier } from '@/lib/retraitia/DossierContext'

type Block = 'identite' | 'enfants' | 'carriere'

const BLOCKS: Array<{ id: Block; label: string; icon: string }> = [
  { id: 'identite', label: 'Identite & situation', icon: '\U0001F464' },
  { id: 'enfants', label: 'Enfants & famille', icon: '\U0001F476' },
  { id: 'carriere', label: 'Carriere & specificites', icon: '\U0001F4BC' },
]

interface FormState {
  nom: string; prenom: string; dateNaissance: string; sexe: string
  situationFamiliale: string; conjointDecede: boolean
  nombreEnfants: number; enfantsACharge: number; parentIsole: boolean
  serviceMilitaire: boolean; serviceMilitaireDureeMois: number
  periodesChomage: boolean; periodesChomageDureeMois: number
  periodesMaladie: boolean; periodesEtranger: boolean; paysEtranger: string
  apprentissageAvant2014: boolean; cadreAvant2019: boolean
  ancienCombattant: boolean; invalidite: boolean
  emploiDomicile: boolean; proprietaire: boolean
  retraiteDateDepart: string; pensionBaseBrute: string
  pensionComplementaireBrute: string
}

const INITIAL: FormState = {
  nom: '', prenom: '', dateNaissance: '', sexe: '', situationFamiliale: '',
  conjointDecede: false, nombreEnfants: 0, enfantsACharge: 0, parentIsole: false,
  serviceMilitaire: false, serviceMilitaireDureeMois: 0, periodesChomage: false,
  periodesChomageDureeMois: 0, periodesMaladie: false, periodesEtranger: false,
  paysEtranger: '', apprentissageAvant2014: false, cadreAvant2019: false,
  ancienCombattant: false, invalidite: false, emploiDomicile: false,
  proprietaire: false, retraiteDateDepart: '', pensionBaseBrute: '',
  pensionComplementaireBrute: '',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-text mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${checked ? 'bg-emerald' : 'bg-slate-200'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <span className="text-sm text-slate-text">{label}</span>
    </label>
  )
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-text focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20'
const selectCls = inputCls

export default function InformationsPage() {
  const { dossier, loading, refetch } = useDossier()
  const [block, setBlock] = useState<Block>('identite')
  const [form, setForm] = useState<FormState>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Pre-remplir le formulaire depuis le dossier
  useEffect(() => {
    if (dossier?.formulaire && !initialized) {
      const f = dossier.formulaire as any
      setForm(prev => ({
        ...prev,
        ...f,
        nombreEnfants: f.nombreEnfants ?? 0,
        enfantsACharge: f.enfantsACharge ?? 0,
        serviceMilitaireDureeMois: f.serviceMilitaireDureeMois ?? 0,
        periodesChomageDureeMois: f.periodesChomageDureeMois ?? 0,
      }))
      setInitialized(true)
    }
  }, [dossier, initialized])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <p className="text-sm text-slate-muted">Aucun dossier.</p>
      </div>
    )
  }

  const u = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/retraitia/formulaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossierId: String(dossier.id), formulaire: form }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        await refetch()
      }
    } catch (err) {
      console.error('[Formulaire] Erreur sauvegarde:', err)
    } finally {
      setSaving(false)
    }
  }

  const blockIndex = BLOCKS.findIndex(b => b.id === block)

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-slate-text mb-1">Informations complementaires</h1>
      <p className="text-sm text-slate-muted mb-6">
        Ces informations nous permettent de personnaliser votre diagnostic. Vous pouvez modifier vos reponses a tout moment.
      </p>

      <div className="flex gap-1 mb-6 overflow-x-auto">
        {BLOCKS.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setBlock(b.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              block === b.id
                ? 'bg-emerald/10 text-emerald'
                : 'bg-slate-50 text-slate-muted hover:bg-slate-100'
            }`}
          >
            <span>{b.icon}</span>
            <span>{b.label}</span>
            {i < blockIndex && <span className="text-xs ml-1">\u2705</span>}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">

        {block === 'identite' && (
          <div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nom" required>
                <input className={inputCls} value={form.nom} onChange={e => u('nom', e.target.value)} placeholder="Dupont" />
              </Field>
              <Field label="Prenom" required>
                <input className={inputCls} value={form.prenom} onChange={e => u('prenom', e.target.value)} placeholder="Marie" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Date de naissance" required>
                <input type="date" className={inputCls} value={form.dateNaissance} onChange={e => u('dateNaissance', e.target.value)} />
              </Field>
              <Field label="Sexe" required>
                <select className={selectCls} value={form.sexe} onChange={e => u('sexe', e.target.value)}>
                  <option value="">Selectionner</option>
                  <option value="F">Femme</option>
                  <option value="M">Homme</option>
                </select>
              </Field>
            </div>
            <Field label="Situation familiale" required>
              <select className={selectCls} value={form.situationFamiliale} onChange={e => u('situationFamiliale', e.target.value)}>
                <option value="">Selectionner</option>
                <option value="marie">Marie(e)</option>
                <option value="pacse">Pacse(e)</option>
                <option value="concubin">Concubin(e)</option>
                <option value="celibataire">Celibataire</option>
                <option value="divorce">Divorce(e)</option>
                <option value="veuf">Veuf / Veuve</option>
              </select>
            </Field>
            {form.situationFamiliale === 'veuf' && (
              <Toggle label="Mon conjoint est decede \u2014 je souhaite verifier mes droits a la reversion" checked={form.conjointDecede} onChange={v => u('conjointDecede', v)} />
            )}
          </div>
        )}

        {block === 'enfants' && (
          <div>
            <Field label="Nombre total d'enfants eleves" required>
              <input type="number" className={inputCls} min={0} max={20} value={form.nombreEnfants} onChange={e => u('nombreEnfants', parseInt(e.target.value) || 0)} />
            </Field>
            <Field label="Dont enfants encore a charge au moment de la liquidation">
              <input type="number" className={inputCls} min={0} max={20} value={form.enfantsACharge} onChange={e => u('enfantsACharge', parseInt(e.target.value) || 0)} />
            </Field>
            <Toggle label="J'ai eleve seul(e) un enfant pendant au moins 5 ans" checked={form.parentIsole} onChange={v => u('parentIsole', v)} />
            {form.nombreEnfants >= 3 && (
              <div className="bg-emerald/5 border border-emerald/20 rounded-lg p-3 mt-2">
                <p className="text-sm text-emerald font-medium">
                  \u2705 3+ enfants = majoration de 10% sur la pension de base et la complementaire. On verifiera.
                </p>
              </div>
            )}
          </div>
        )}

        {block === 'carriere' && (
          <div className="space-y-1">
            <Toggle label="Service militaire effectue" checked={form.serviceMilitaire} onChange={v => u('serviceMilitaire', v)} />
            {form.serviceMilitaire && (
              <Field label="Duree du service militaire (mois)">
                <input type="number" className={inputCls} min={0} max={36} value={form.serviceMilitaireDureeMois} onChange={e => u('serviceMilitaireDureeMois', parseInt(e.target.value) || 0)} />
              </Field>
            )}
            <Toggle label="Periodes de chomage indemnise" checked={form.periodesChomage} onChange={v => u('periodesChomage', v)} />
            {form.periodesChomage && (
              <Field label="Duree totale approximative (mois)">
                <input type="number" className={inputCls} min={0} value={form.periodesChomageDureeMois} onChange={e => u('periodesChomageDureeMois', parseInt(e.target.value) || 0)} />
              </Field>
            )}
            <Toggle label="Arrets maladie de longue duree (+60 jours)" checked={form.periodesMaladie} onChange={v => u('periodesMaladie', v)} />
            <Toggle label="Periodes de travail a l'etranger" checked={form.periodesEtranger} onChange={v => u('periodesEtranger', v)} />
            {form.periodesEtranger && (
              <Field label="Pays concerne(s)">
                <input className={inputCls} value={form.paysEtranger} onChange={e => u('paysEtranger', e.target.value)} placeholder="Ex: Algerie, Italie" />
              </Field>
            )}
            <Toggle label="Apprentissage avant 2014" checked={form.apprentissageAvant2014} onChange={v => u('apprentissageAvant2014', v)} />
            <Toggle label="Cadre avant 2019 (pour la GMP Agirc)" checked={form.cadreAvant2019} onChange={v => u('cadreAvant2019', v)} />
            <Toggle label="Ancien combattant (carte du combattant)" checked={form.ancienCombattant} onChange={v => u('ancienCombattant', v)} />
            <Toggle label="Invalidite reconnue (80%+)" checked={form.invalidite} onChange={v => u('invalidite', v)} />
            <Toggle label="Emploi a domicile (aide menagere, garde...)" checked={form.emploiDomicile} onChange={v => u('emploiDomicile', v)} />
            <Toggle label="Proprietaire de votre residence principale" checked={form.proprietaire} onChange={v => u('proprietaire', v)} />

            <div className="border-t border-slate-100 mt-4 pt-4">
              <h3 className="font-medium text-slate-text text-sm mb-3">Donnees de pension (si disponibles)</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Date de depart en retraite">
                  <input type="date" className={inputCls} value={form.retraiteDateDepart} onChange={e => u('retraiteDateDepart', e.target.value)} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Pension de base brute (euros/mois)">
                  <input type="number" className={inputCls} value={form.pensionBaseBrute} onChange={e => u('pensionBaseBrute', e.target.value)} placeholder="Ex: 1200" />
                </Field>
                <Field label="Pension complementaire brute (euros/mois)">
                  <input type="number" className={inputCls} value={form.pensionComplementaireBrute} onChange={e => u('pensionComplementaireBrute', e.target.value)} placeholder="Ex: 450" />
                </Field>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
          <div>
            {blockIndex > 0 && (
              <button onClick={() => setBlock(BLOCKS[blockIndex - 1].id)} className="text-sm text-slate-muted hover:text-slate-text">
                \u2190 {BLOCKS[blockIndex - 1].label}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-emerald font-medium">\u2705 Enregistre</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald text-[#060D1B] font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-emerald-light transition-colors disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            {blockIndex < BLOCKS.length - 1 && (
              <button
                onClick={() => { handleSave(); setBlock(BLOCKS[blockIndex + 1].id) }}
                className="text-sm text-emerald font-medium hover:underline"
              >
                {BLOCKS[blockIndex + 1].label} \u2192
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
