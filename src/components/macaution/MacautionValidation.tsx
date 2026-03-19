'use client'
import { useState } from 'react'
import type { ExtractionResult, ExtractionConfidence } from '@/lib/macaution/extract-types'
import type { MacautionFormData, DeductionReason } from '@/lib/macaution/types'

const DEDUCTION_OPTIONS: { value: DeductionReason; label: string }[] = [
  { value: 'peintures_murs', label: 'Peintures / murs' },
  { value: 'sols', label: 'Sols' },
  { value: 'sanitaires_plomberie', label: 'Sanitaires / plomberie' },
  { value: 'equipements_cuisine', label: 'Équipements cuisine' },
  { value: 'menuiseries_portes', label: 'Menuiseries / portes' },
  { value: 'nettoyage', label: 'Nettoyage' },
  { value: 'loyers_impayes', label: 'Loyers impayés' },
  { value: 'charges_impayees', label: 'Charges impayées' },
  { value: 'autre', label: 'Autre' },
]

interface MacautionValidationProps {
  extraction: ExtractionResult
  onValidate: (data: MacautionFormData) => void
  onBack: () => void
}

export function MacautionValidation({ extraction, onValidate, onBack }: MacautionValidationProps) {
  const e = extraction.extracted

  // État du formulaire pré-rempli
  const [form, setForm] = useState({
    locationType: e.locationType.value || '',
    rentAmount: e.rentAmount.value ?? '',
    depositAmount: e.depositAmount.value ?? '',
    entryDate: e.entryDate.value || '',
    exitDate: e.exitDate.value || '',
    depositReturned: e.depositReturned.value || '',
    returnedAmount: e.returnedAmount.value ?? '',
    returnDate: e.returnDate.value || '',
    deductions: (e.deductions.value || []) as string[],
    deductionAmount: e.deductionAmount.value ?? '',
    hasInvoices: e.hasInvoices.value || '',
    entryDamages: e.entryDamages.value || '',
    email: '',
    otherDeduction: '',
  })

  const [error, setError] = useState<string | null>(null)

  const update = (key: string, value: string | number | string[]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const toggleDeduction = (d: string) => {
    const current = form.deductions
    if (current.includes(d)) {
      update('deductions', current.filter(x => x !== d))
    } else {
      update('deductions', [...current, d])
    }
  }

  const handleSubmit = () => {
    setError(null)

    // Validations minimales
    if (!form.locationType) { setError('Veuillez sélectionner le type de location.'); return }
    if (!form.rentAmount || Number(form.rentAmount) <= 0) { setError('Veuillez saisir le loyer.'); return }
    if (!form.depositAmount || Number(form.depositAmount) <= 0) { setError('Veuillez saisir le montant du dépôt.'); return }
    if (!form.entryDate) { setError("Veuillez saisir la date d'entrée."); return }
    if (!form.exitDate) { setError('Veuillez saisir la date de sortie.'); return }
    if (!form.depositReturned) { setError('Veuillez indiquer le statut de restitution.'); return }
    if (!form.hasInvoices) { setError('Veuillez indiquer si des justificatifs ont été fournis.'); return }
    if (!form.entryDamages) { setError("Veuillez indiquer l'état de l'EDL d'entrée."); return }
    if (!form.email || !form.email.includes('@')) { setError('Veuillez saisir votre email.'); return }

    const data: MacautionFormData = {
      locationType: form.locationType as 'vide' | 'meuble',
      rentAmount: Number(form.rentAmount),
      depositAmount: Number(form.depositAmount),
      entryDate: form.entryDate,
      exitDate: form.exitDate,
      depositReturned: form.depositReturned as 'total' | 'partial' | 'none',
      returnedAmount: form.returnedAmount ? Number(form.returnedAmount) : undefined,
      returnDate: form.returnDate || undefined,
      deductions: form.deductions as DeductionReason[],
      deductionAmount: Number(form.deductionAmount) || 0,
      hasInvoices: form.hasInvoices as 'yes' | 'no' | 'partial',
      entryDamages: form.entryDamages as 'yes' | 'no' | 'no_edl',
      email: form.email,
      otherDeduction: form.otherDeduction || undefined,
    }

    onValidate(data)
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[800px] mx-auto px-6">
        {/* En-tête */}
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-3">
            Vérifiez les informations extraites
          </h2>
          <p className="text-slate-muted text-sm max-w-[500px] mx-auto">
            Notre IA a extrait ces données de vos documents. Corrigez ce qui est incorrect, complétez les champs manquants.
          </p>
        </div>

        {/* Documents identifiés */}
        {extraction.documents.length > 0 && (
          <div className="mb-8 p-5 bg-slate-bg rounded-xl">
            <p className="text-xs font-semibold text-slate-text uppercase tracking-wider mb-3">
              Documents identifiés
            </p>
            <div className="space-y-2">
              {extraction.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span>{docIcon(doc.type)}</span>
                  <span className="text-slate-text font-medium">{docLabel(doc.type)}</span>
                  <ConfBadge level={doc.confidence} />
                  {doc.summary && (
                    <span className="text-slate-muted text-xs truncate ml-1">— {doc.summary}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alertes documents manquants */}
        {extraction.missingDocuments.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Documents manquants</p>
            {extraction.missingDocuments.map((msg, i) => (
              <p key={i} className="text-sm text-amber-700">• {msg}</p>
            ))}
          </div>
        )}

        {/* Warnings / incohérences */}
        {extraction.warnings.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Points d&apos;attention</p>
            {extraction.warnings.map((msg, i) => (
              <p key={i} className="text-sm text-blue-700">• {msg}</p>
            ))}
          </div>
        )}

        {/* Formulaire pré-rempli */}
        <div className="space-y-8">

          {/* Section Logement */}
          <FieldSection title="Logement">
            <FieldRow label="Type de location" conf={e.locationType.confidence} source={e.locationType.source}>
              <div className="flex gap-3">
                {(['vide', 'meuble'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => update('locationType', v)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.locationType === v
                        ? 'bg-emerald text-white border-emerald'
                        : 'bg-white text-slate-text border-slate-border hover:border-emerald/50'
                    }`}
                  >
                    {v === 'vide' ? 'Location vide' : 'Location meublée'}
                  </button>
                ))}
              </div>
            </FieldRow>
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldRow label="Loyer mensuel HC (€)" conf={e.rentAmount.confidence} source={e.rentAmount.source}>
                <input
                  type="number"
                  value={form.rentAmount}
                  onChange={ev => update('rentAmount', ev.target.value)}
                  className={fieldClass(e.rentAmount.confidence)}
                  placeholder="850"
                />
              </FieldRow>
              <FieldRow label="Dépôt de garantie (€)" conf={e.depositAmount.confidence} source={e.depositAmount.source}>
                <input
                  type="number"
                  value={form.depositAmount}
                  onChange={ev => update('depositAmount', ev.target.value)}
                  className={fieldClass(e.depositAmount.confidence)}
                  placeholder="850"
                />
              </FieldRow>
            </div>
          </FieldSection>

          {/* Section Dates */}
          <FieldSection title="Dates">
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldRow label="Date d'entrée" conf={e.entryDate.confidence} source={e.entryDate.source}>
                <input
                  type="date"
                  value={form.entryDate}
                  onChange={ev => update('entryDate', ev.target.value)}
                  className={fieldClass(e.entryDate.confidence)}
                />
              </FieldRow>
              <FieldRow label="Date de sortie" conf={e.exitDate.confidence} source={e.exitDate.source}>
                <input
                  type="date"
                  value={form.exitDate}
                  onChange={ev => update('exitDate', ev.target.value)}
                  className={fieldClass(e.exitDate.confidence)}
                />
              </FieldRow>
            </div>
          </FieldSection>

          {/* Section Restitution */}
          <FieldSection title="Restitution du dépôt">
            <FieldRow label="Le dépôt a-t-il été restitué ?" conf={e.depositReturned.confidence} source={e.depositReturned.source}>
              <div className="flex gap-2 flex-wrap">
                {([
                  { v: 'total', l: 'Oui, en totalité' },
                  { v: 'partial', l: 'Partiellement' },
                  { v: 'none', l: 'Non, rien reçu' },
                ] as const).map(({ v, l }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => update('depositReturned', v)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.depositReturned === v
                        ? 'bg-emerald text-white border-emerald'
                        : 'bg-white text-slate-text border-slate-border hover:border-emerald/50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </FieldRow>
            {form.depositReturned === 'partial' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldRow label="Montant restitué (€)" conf={e.returnedAmount.confidence} source={e.returnedAmount.source}>
                  <input
                    type="number"
                    value={form.returnedAmount}
                    onChange={ev => update('returnedAmount', ev.target.value)}
                    className={fieldClass(e.returnedAmount.confidence)}
                    placeholder="200"
                  />
                </FieldRow>
                <FieldRow label="Date de restitution" conf={e.returnDate.confidence} source={e.returnDate.source}>
                  <input
                    type="date"
                    value={form.returnDate}
                    onChange={ev => update('returnDate', ev.target.value)}
                    className={fieldClass(e.returnDate.confidence)}
                  />
                </FieldRow>
              </div>
            )}
            {form.depositReturned === 'none' && (
              <FieldRow label="Date du courrier de retenue (si connue)" conf={e.returnDate.confidence} source={e.returnDate.source}>
                <input
                  type="date"
                  value={form.returnDate}
                  onChange={ev => update('returnDate', ev.target.value)}
                  className={fieldClass(e.returnDate.confidence)}
                />
              </FieldRow>
            )}
          </FieldSection>

          {/* Section Retenues */}
          <FieldSection title="Retenues du bailleur">
            <FieldRow label="Motifs de retenue invoqués" conf={e.deductions.confidence} source={e.deductions.source}>
              <div className="grid sm:grid-cols-2 gap-2">
                {DEDUCTION_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-sm cursor-pointer border transition-colors ${
                      form.deductions.includes(opt.value)
                        ? 'bg-emerald/10 border-emerald/30 text-slate-text'
                        : 'bg-white border-slate-border/50 text-slate-muted hover:border-emerald/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.deductions.includes(opt.value)}
                      onChange={() => toggleDeduction(opt.value)}
                      className="accent-emerald"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </FieldRow>
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldRow label="Montant total retenu (€)" conf={e.deductionAmount.confidence} source={e.deductionAmount.source}>
                <input
                  type="number"
                  value={form.deductionAmount}
                  onChange={ev => update('deductionAmount', ev.target.value)}
                  className={fieldClass(e.deductionAmount.confidence)}
                  placeholder="650"
                />
              </FieldRow>
              <FieldRow label="Justificatifs fournis ?" conf={e.hasInvoices.confidence} source={e.hasInvoices.source}>
                <select
                  value={form.hasInvoices}
                  onChange={ev => update('hasInvoices', ev.target.value)}
                  className={fieldClass(e.hasInvoices.confidence)}
                >
                  <option value="">— Sélectionnez —</option>
                  <option value="yes">Oui, factures/devis fournis</option>
                  <option value="partial">Partiellement</option>
                  <option value="no">Non, aucun justificatif</option>
                </select>
              </FieldRow>
            </div>
          </FieldSection>

          {/* Section EDL */}
          <FieldSection title="État des lieux">
            <FieldRow label="Dégradations à l'entrée ?" conf={e.entryDamages.confidence} source={e.entryDamages.source}>
              <select
                value={form.entryDamages}
                onChange={ev => update('entryDamages', ev.target.value)}
                className={fieldClass(e.entryDamages.confidence)}
              >
                <option value="">— Sélectionnez —</option>
                <option value="yes">Oui, des dégradations existaient à l&apos;entrée</option>
                <option value="no">Non, le logement était en bon état</option>
                <option value="no_edl">Pas d&apos;état des lieux d&apos;entrée</option>
              </select>
            </FieldRow>
          </FieldSection>

          {/* Comparaison EDL (si disponible) */}
          {extraction.edlComparison && extraction.edlComparison.length > 0 && (
            <div className="p-5 bg-slate-bg rounded-xl">
              <p className="text-xs font-semibold text-slate-text uppercase tracking-wider mb-4">
                Comparaison état des lieux (entrée vs sortie)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-muted border-b border-slate-border">
                      <th className="pb-2 pr-3">Pièce</th>
                      <th className="pb-2 pr-3">Entrée</th>
                      <th className="pb-2 pr-3">Sortie</th>
                      <th className="pb-2">Observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraction.edlComparison.map((row, i) => (
                      <tr key={i} className={`border-b border-slate-border/30 ${row.degradation ? 'bg-red-50/50' : ''}`}>
                        <td className="py-2 pr-3 font-medium text-slate-text">{row.room}</td>
                        <td className="py-2 pr-3 text-slate-muted">{row.entryState}</td>
                        <td className="py-2 pr-3 text-slate-muted">{row.exitState}</td>
                        <td className="py-2 text-xs">
                          {row.degradation ? (
                            <span className="text-red-600">{row.comment}</span>
                          ) : (
                            <span className="text-green-600">RAS</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Email (toujours à saisir) */}
          <FieldSection title="Votre email">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-medium text-slate-text">Adresse email</label>
                <span className="text-xs px-1.5 py-0.5 rounded bg-emerald/10 text-emerald-dark">Requis</span>
              </div>
              <input
                type="email"
                value={form.email}
                onChange={ev => update('email', ev.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-border text-slate-text text-sm focus:outline-none focus:border-emerald transition-colors"
                placeholder="votre@email.fr"
              />
              <p className="text-xs text-slate-muted mt-1">
                Nécessaire pour recevoir votre rapport. Jamais partagé.
              </p>
            </div>
          </FieldSection>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <button type="button" onClick={handleSubmit} className="cta-primary !text-[17px] !py-[16px] !px-10">
            Valider et lancer l&apos;analyse →
          </button>
          <button type="button" onClick={onBack} className="text-sm text-slate-muted hover:text-emerald-dark transition-colors">
            ← Retour
          </button>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Sous-composants
// ============================================================

function FieldSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-heading font-bold text-slate-text text-base mb-4 pb-2 border-b border-slate-border">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function FieldRow({
  label, conf, source, children,
}: {
  label: string; conf: ExtractionConfidence; source: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-sm font-medium text-slate-text">{label}</label>
        <ConfBadge level={conf} />
        {source && <span className="text-[10px] text-slate-muted">({source})</span>}
      </div>
      {children}
    </div>
  )
}

function ConfBadge({ level }: { level: ExtractionConfidence }) {
  if (level === 'high') return <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">✓</span>
  if (level === 'medium') return <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">À vérifier</span>
  return <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">À compléter</span>
}

function fieldClass(conf: ExtractionConfidence): string {
  const base = 'w-full px-3.5 py-2.5 rounded-lg border-2 text-slate-text text-sm focus:outline-none focus:border-emerald transition-colors'
  if (conf === 'high') return `${base} border-slate-border bg-white`
  if (conf === 'medium') return `${base} border-amber-300 bg-amber-50/30`
  return `${base} border-red-300 bg-red-50/30`
}

function docIcon(type: string): string {
  const icons: Record<string, string> = {
    bail: '📄', edl_entree: '📋', edl_sortie: '📋',
    courrier_bailleur: '✉️', facture: '🧾', photo: '📸', autre: '📎',
  }
  return icons[type] || '📎'
}

function docLabel(type: string): string {
  const labels: Record<string, string> = {
    bail: 'Bail', edl_entree: "État des lieux d'entrée", edl_sortie: 'État des lieux de sortie',
    courrier_bailleur: 'Courrier bailleur', facture: 'Facture / Devis', photo: 'Photo', autre: 'Autre',
  }
  return labels[type] || 'Document'
}
