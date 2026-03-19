'use client'
import { fmt } from '@/lib/format'
import type { AvisImpositionExtracted, MultiAvisData } from '@/lib/monimpot/extract-types'
import type { CaseVide } from '@/lib/monimpot/extract-mapper'

interface Props {
  // Mono ou multi
  extraction?: AvisImpositionExtracted
  multiAvis?: MultiAvisData
  casesVidesDetails: CaseVide[]
  onConfirm: () => void
  onEdit: () => void
}

const SITUATION_LABELS: Record<string, string> = {
  M: 'Marié(e)',
  O: 'Pacsé(e)',
  C: 'Célibataire',
  D: 'Divorcé(e)',
  V: 'Veuf/Veuve',
}

const CASE_LABELS: Record<string, string> = {
  fraisReels1AK: 'Frais réels (1AK)',
  pensionVersee6EL: 'Pension alimentaire (6EL)',
  dons7UF: 'Dons associations (7UF)',
  dons7UD: 'Dons aide personnes (7UD)',
  emploiDomicile7DB: 'Emploi à domicile (7DB)',
  gardeEnfant7GA: 'Garde enfant (7GA)',
  ehpad7CD: 'EHPAD (7CD)',
  per6NS: 'PER (6NS)',
  case2OP: 'Option barème (2OP)',
  investPME7CF: 'Investissement PME (7CF)',
}

export function MonimpotExtraction({ extraction, multiAvis, casesVidesDetails, onConfirm, onEdit }: Props) {
  // Déterminer les avis à afficher
  const avisToShow: AvisImpositionExtracted[] = multiAvis?.avis ?? (extraction ? [extraction] : [])
  const isMulti = avisToShow.length > 1
  const comparaison = multiAvis?.comparaison

  if (avisToShow.length === 0) return null

  return (
    <section className="py-16 bg-slate-bg">
      <div className="max-w-[720px] mx-auto px-6">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">✅</div>
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-2">
            {isMulti
              ? `${avisToShow.length} avis d'imposition analysés`
              : `Avis ${avisToShow[0].annee} analysé avec succès`
            }
          </h2>
          <p className="text-slate-muted text-sm">
            Vérifiez les données extraites avant de continuer.
          </p>
        </div>

        {/* Récapitulatif par année */}
        {avisToShow.map((avis, idx) => (
          <div key={avis.annee} className={`bg-white rounded-2xl border border-slate-border p-6 ${idx < avisToShow.length - 1 ? 'mb-4' : 'mb-6'}`}>
            {/* En-tête année */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-navy text-lg">
                Revenus {avis.annee}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  avis.confidence >= 80 ? 'bg-emerald' : avis.confidence >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-xs text-slate-muted">
                  Fiabilité {avis.confidence}%
                </span>
              </div>
            </div>

            {/* Grille données principales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <DataCell label="Situation" value={SITUATION_LABELS[avis.situationFamiliale] || avis.situationFamiliale} />
              <DataCell label="Parts fiscales" value={String(avis.nbPartsDeclarees)} />
              <DataCell label="Revenu net imposable" value={`${fmt(avis.revenuNetImposable)}€`} />
              <DataCell label="Impôt annuel" value={`${fmt(avis.impotNet)}€`} />
              {avis.soldeAPayer !== 0 && (
                <DataCell
                  label={avis.soldeAPayer < 0 ? 'Restitution' : 'Reste à payer'}
                  value={`${avis.soldeAPayer < 0 ? '+' : ''}${fmt(Math.abs(avis.soldeAPayer))}€`}
                  highlight={avis.soldeAPayer < 0 ? 'green' : undefined}
                />
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <DataCell label="RFR" value={`${fmt(avis.rfr)}€`} />
              {avis.salairesTraitements ? <DataCell label="Salaires (1AJ)" value={`${fmt(avis.salairesTraitements)}€`} /> : null}
              {avis.pensionsRetraite ? <DataCell label="Pensions (1AS)" value={`${fmt(avis.pensionsRetraite)}€`} /> : null}
              {avis.nbPersonnesCharge > 0 && <DataCell label="Pers. à charge" value={String(avis.nbPersonnesCharge)} />}
              {avis.caseT && <DataCell label="Case T" value="✅ Cochée" highlight="green" />}
              {avis.caseL && <DataCell label="Case L" value="✅ Cochée" highlight="green" />}
            </div>

            {/* Cases renseignées */}
            <CasesDisplay cases={avis.casesRenseignees} />

            {/* Warnings techniques masqués en production */}
          </div>
        ))}

        {/* Cases perdues (multi-avis) */}
        {comparaison?.casesPerduees && comparaison.casesPerduees.length > 0 && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl mb-6">
            <h3 className="font-heading font-bold text-red-700 text-base mb-3">
              🚨 {comparaison.casesPerduees.length} case{comparaison.casesPerduees.length > 1 ? 's' : ''} perdue{comparaison.casesPerduees.length > 1 ? 's' : ''} d&apos;une année à l&apos;autre
            </h3>
            <div className="space-y-2">
              {comparaison.casesPerduees.map((cp, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="mt-0.5">❌</span>
                  <span>{cp.description}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-600 mt-3">
              Ces cases oubliées représentent potentiellement des centaines d&apos;euros de manque à gagner !
            </p>
          </div>
        )}

        {/* Évolution multi-années */}
        {comparaison?.evolution && comparaison.evolution.length > 1 && (
          <div className="bg-white rounded-2xl border border-slate-border p-5 mb-6">
            <h3 className="font-heading font-bold text-slate-text text-base mb-3">📈 Évolution sur {comparaison.evolution.length} ans</h3>
            <div className="flex gap-2 justify-center">
              {comparaison.evolution.map((ev, i) => (
                <div key={ev.annee} className="flex-1 text-center">
                  <div className="text-xs text-slate-muted mb-1">{ev.annee}</div>
                  <div className="text-base font-bold text-navy">{fmt(ev.impot)}€</div>
                  <div className="text-[10px] text-slate-muted">RFR: {fmt(ev.rfr)}€</div>
                  {i > 0 && (() => {
                    const prev = comparaison.evolution[i - 1]
                    const diff = ev.impot - prev.impot
                    return diff !== 0 ? (
                      <div className={`text-[10px] font-medium mt-1 ${diff > 0 ? 'text-red-500' : 'text-emerald'}`}>
                        {diff > 0 ? '+' : ''}{fmt(diff)}€
                      </div>
                    ) : null
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cases vides détectées */}
        {casesVidesDetails.length > 0 && (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
            <h3 className="font-heading font-bold text-amber-700 text-base mb-2">
              💡 {casesVidesDetails.length} piste{casesVidesDetails.length > 1 ? 's' : ''} d&apos;optimisation détectée{casesVidesDetails.length > 1 ? 's' : ''}
            </h3>
            <p className="text-xs text-amber-700 mb-3">
              Ces cases ne sont pas renseignées sur votre avis. Nous allons vous poser quelques questions pour vérifier si vous y avez droit.
            </p>
            <div className="flex flex-wrap gap-2">
              {casesVidesDetails.map(cv => (
                <span key={cv.key} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-amber-200 text-xs text-amber-800">
                  <span className="font-semibold">{cv.caseImpot}</span>
                  <span className="text-amber-600">·</span>
                  <span>{cv.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onConfirm} className="cta-primary flex-1 justify-center">
            C&apos;est correct — continuer →
          </button>
        </div>
        <div className="text-center mt-4">
          <button onClick={onEdit} className="text-sm text-slate-muted hover:text-slate-text underline transition-colors">
            Corriger manuellement ces données
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Sous-composants ───

function DataCell({ label, value, highlight }: { label: string; value: string; highlight?: 'green' }) {
  return (
    <div className="bg-slate-bg rounded-xl p-3 text-center">
      <div className="text-[10px] text-slate-muted mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${highlight === 'green' ? 'text-emerald' : 'text-navy'}`}>{value}</div>
    </div>
  )
}

function CasesDisplay({ cases }: { cases: AvisImpositionExtracted['casesRenseignees'] }) {
  const entries = Object.entries(cases).filter(([key, val]) => {
    if (key === 'case2OP') return val === true
    return typeof val === 'number' && val > 0
  })

  if (entries.length === 0) {
    return (
      <div className="text-xs text-slate-muted italic p-2 bg-slate-bg rounded-xl text-center">
        Aucune case de déduction/réduction détectée sur cet avis
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold text-slate-text mb-2">Cases renseignées :</p>
      <div className="flex flex-wrap gap-2">
        {entries.map(([key, val]) => (
          <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald/5 border border-emerald/20 rounded-lg text-xs text-emerald-dark">
            ✅ {CASE_LABELS[key] || key}
            {typeof val === 'number' && val > 0 && <span className="font-bold ml-1">{fmt(val)}€</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
