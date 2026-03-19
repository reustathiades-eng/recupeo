// ============================================================
// MAPENSION — Types TypeScript
// ============================================================

// ─── Indice INSEE ───

export type IndexType =
  | 'ensemble_hors_tabac'     // Ensemble des ménages — hors tabac (défaut)
  | 'ouvriers_hors_tabac'     // Ménages urbains ouvriers/employés — hors tabac
  | 'ensemble_tabac'          // Ensemble des ménages — y compris tabac
  | 'ouvriers_tabac'          // Ménages urbains — y compris tabac

export type UserRole = 'creditor' | 'debtor'

export type YesNoUnknown = 'yes' | 'no' | 'unknown'

// ─── Formulaire ───

export interface MapensionFormData {
  // Pension
  initialAmount: number           // montant initial (jugement) en €/mois
  judgmentDate: string             // YYYY-MM-DD
  childrenCount: number
  indexType: IndexType
  referenceIndex: number | null    // indice de référence si connu
  revaluationMonth: number         // mois de revalorisation annuelle (1-12, défaut: mois du jugement)

  // Historique
  alreadyRevalued: YesNoUnknown
  lastRevaluedAmount: number | null
  lastRevaluedDate: string | null  // YYYY-MM-DD
  currentAmountPaid: number        // montant actuellement versé

  // Situation
  userRole: UserRole
  usesARIPA: YesNoUnknown

  // Contact
  email: string
}

// ─── Calcul année par année ───

export interface YearlyArrear {
  year: number
  month: number                    // mois de revalorisation
  indexDate: string                // "YYYY-MM" de l'indice utilisé
  indexValue: number               // valeur de l'indice
  amountDue: number                // montant mensuel qui aurait dû être versé
  amountPaid: number               // montant effectivement versé
  monthlyGap: number               // écart mensuel
  monthsInYear: number             // nombre de mois dans cette année (peut être < 12)
  yearlyArrear: number             // arriéré total pour cette année
}

// ─── Résultat calcul ───

export interface MapensionCalculations {
  // Revalorisation actuelle
  currentRevaluedAmount: number    // pension revalorisée au dernier indice connu
  referenceIndexDate: string       // "YYYY-MM" indice de référence
  referenceIndexValue: number      // valeur indice de référence
  currentIndexDate: string         // "YYYY-MM" dernier indice
  currentIndexValue: number        // valeur dernier indice
  revaluationPct: number           // % de hausse depuis le jugement

  // Comparaison
  monthlyGap: number               // écart mensuel actuel (dû - payé)
  annualGap: number                // écart annuel (× 12)

  // Arriérés
  arrearsByYear: YearlyArrear[]    // détail année par année
  totalArrears: number             // total arriérés récupérables
  arrearsYears: number             // nombre d'années couvertes (max 5)
  prescriptionDate: string         // date limite de prescription

  // Statut
  hasArrears: boolean
  usesARIPA: boolean
  isCreditor: boolean
}

// ─── Réponse API calculate (gratuit) ───

export interface MapensionCalculateResponse {
  success: true
  diagnosticId: string
  initialAmount: number
  revaluedAmount: number
  revaluationPct: number
  monthlyGap: number
  estimatedTotalArrears: number
  arrearsYears: number
  hasArrears: boolean
  usesARIPA: boolean
  isCreditor: boolean
  // Teaser : on ne montre PAS le détail année par année
}

// ─── Réponse API full-report (payant) ───

export interface MapensionFullReportResponse {
  success: true
  calculations: MapensionCalculations
  report: {
    title: string
    date: string
    reference: string
    sections: Array<{ id: string; title: string; content: string }>
  }
}

// ─── Courriers ───

export interface MapensionLetters {
  reclamationAmiable: string       // courrier amiable
  miseEnDemeure: string            // mise en demeure LRAR
  guideAripa: string               // guide pour saisir l'ARIPA
  guideProcedure: string           // guide étape par étape
}

// ─── Erreur ───

export interface ErrorResponse {
  success: false
  error: string
  details?: Record<string, string[]>
}
