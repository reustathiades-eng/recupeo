interface MethodologyNoteProps {
  lines: string[]
}

export function MethodologyNote({ lines }: MethodologyNoteProps) {
  return (
    <div className="bg-slate-bg border border-slate-border rounded-xl p-4 mt-6">
      <div className="flex items-start gap-2.5">
        <span className="text-base mt-0.5 shrink-0">📐</span>
        <div>
          <div className="text-xs font-bold text-slate-text mb-1">Notre méthodologie</div>
          {lines.map((line, i) => (
            <p key={i} className="text-xs text-slate-muted leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

/* Configs par brique */
export const MACAUTION_METHODOLOGY = [
  "Montant initial − abattement vétusté (grille FNAIM) − dégradations justifiées = montant récupérable.",
  "Un bailleur qui ne respecte pas les délais légaux doit restituer + pénalités de 10%/mois de retard (loi ALUR).",
]

export const RETRAITIA_METHODOLOGY = [
  "Chaque trimestre est vérifié : cotisations, salaires portés au compte, durée d'assurance.",
  "Les anomalies sont classées par impact financier estimé sur votre pension mensuelle.",
]

export const MONLOYER_METHODOLOGY = [
  "Loyer de référence = barème préfectoral × surface habitable. Le loyer ne peut dépasser le loyer de référence majoré (+20%).",
  "En cas de dépassement, le locataire peut exiger une baisse de loyer et le remboursement du trop-perçu.",
]

export const MATAXE_METHODOLOGY = [
  "Valeur locative cadastrale × taux communaux = taxe théorique. Comparaison avec votre avis réel.",
  "Les écarts sont analysés par catégorie : taux, valeur locative, abattements, exonérations.",
]

export const MAPENSION_METHODOLOGY = [
  "Montant initial × (Nouvel indice INSEE / Indice de référence) = montant revalorisé.",
  "La revalorisation est automatique chaque année. Les arriérés sont récupérables sur 5 ans (prescription quinquennale).",
]

export const MABANQUE_METHODOLOGY = [
  "Vos frais sont comparés aux plafonds du Code monétaire et financier (art. R.312-4-1, D.131-25).",
  "Le trop-perçu est calculé sur 1 mois, extrapolé sur 1 an et 5 ans (prescription quinquennale, art. 2224 du Code civil).",
]

export const MONCHOMAGE_METHODOLOGY = [
  "SJR = Salaire de référence / Jours calendaires de la PRC. AJ = max(40,4% × SJR + 13,18€, 57% × SJR), plafonnée à 75% du SJR.",
  "Si vous uploadez vos documents (notification, bulletins, attestation), l'IA extrait les données réelles pour un calcul précis. Le mode manuel reste disponible.",
]

export const MAPAIE_METHODOLOGY = [
  "Chaque bulletin est comparé au SMIC en vigueur, aux taux légaux de majoration des heures supplémentaires et aux minima de votre convention collective.",
  "Les rappels de salaire sont calculés sur 3 ans maximum, conformément à la prescription des salaires (art. L.3245-1 du Code du travail).",
]
