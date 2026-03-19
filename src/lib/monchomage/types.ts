// ============================================================
// MONCHOMAGE — Types TypeScript
// ============================================================

export type YesNoUnknown = 'yes' | 'no' | 'unknown'

export type TypeRupture = 'licenciement' | 'rupture_conv' | 'fin_cdd' | 'demission' | 'autre'
export type TypeContrat = 'cdi' | 'cdd' | 'interim' | 'autre'

// ─── Formulaire ───

export interface MonchomageFormData {
  // Situation
  ageFinContrat: number
  dateFinContrat: string              // YYYY-MM-DD
  typeRupture: TypeRupture
  typeContrat: TypeContrat

  // Rémunérations
  salaireBrutMoyen: number            // €/mois
  hasPrimes: boolean
  primesTotal: number                 // € total sur la période
  hasMaladie: boolean
  maladieDuree: number                // jours
  hasActivitePartielle: boolean
  apDuree: number                     // jours
  multiEmployeurs: boolean

  // Notification France Travail
  ajBrute: number                     // allocation journalière brute notifiée (€)
  dureeIndemnisation: number          // jours
  sjrNotification: number | null      // SJR notifié si connu (€)
  degressiviteAppliquee: YesNoUnknown

  // Contact
  email: string
}

// ─── Calculs ───

export interface MonchomageCalculations {
  // SJR théorique
  salaireReference: number            // salaire de référence total (€)
  joursCalendaires: number            // nombre de jours de la PRC
  sjrTheorique: number                // SJR recalculé

  // Allocation journalière théorique
  ajFormule1: number                  // 40,4% × SJR + partie fixe
  ajFormule2: number                  // 57% × SJR
  ajTheorique: number                 // max des deux, plafonnée
  ajTheoriqueBrute: number            // avant plafond 75%
  ajNette: number                     // après prélèvements sociaux

  // Durée
  dureeTheoriqueMax: number           // jours
  trancheAge: 'moins53' | 'de53a54' | 'plus55'

  // Dégressivité
  degressiviteApplicable: boolean     // théoriquement applicable ?
  degressiviteExemptAge: boolean      // exempté car ≥ 55 ans ?
  ajApresDegressivite: number         // AJ après 7ème mois si applicable

  // Mensuel
  areMensuelleBrute: number           // AJ × 30
  areMensuelleNette: number

  // Écarts
  ecartAJ: number                     // AJ théorique - AJ notifiée
  ecartMensuel: number                // écart × 30
  ecartTotal: number                  // écart × durée indemnisation
  ecartSJR: number | null             // SJR théorique - SJR notifié (si connu)
}

// ─── Anomalies ───

export type AnomalyType =
  | 'sjr_sous_estime'
  | 'primes_omises'
  | 'neutralisation_maladie'
  | 'degressivite_injustifiee'
  | 'duree_sous_estimee'
  | 'multi_contrats_agregation'
  | 'attestation_a_verifier'
  | 'trop_percu_possible'

export type AnomalySeverity = 'high' | 'medium' | 'low' | 'info'

export interface Anomaly {
  type: AnomalyType
  severity: AnomalySeverity
  label: string
  detail: string
  impact: number                      // €/jour d'écart estimé
}

// ─── Réponse pré-diagnostic (gratuit) ───

export interface MonchomagePreDiagResponse {
  success: true
  diagnosticId: string
  anomalies: Anomaly[]
  totalAnomalies: number
  sjrTheorique: number
  ajTheorique: number
  ajNotifiee: number
  ecartJournalier: number
  ecartMensuel: number
  ecartTotal: number
  dureeNotifiee: number
  hasAnomalies: boolean
  tropPercuRisque: boolean            // true si on pense que l'ARE est trop haute
}

// ─── Réponse rapport complet (payant) ───

export interface MonchomageFullReportResponse {
  success: true
  diagnosticId: string
  calculations: MonchomageCalculations
  anomalies: Anomaly[]
  report: {
    title: string
    date: string
    reference: string
    sections: Array<{ id: string; title: string; content: string }>
  }
}

// ─── Courriers ───

export interface MonchomageLetters {
  reclamationAgence: string           // courrier réclamation France Travail
  saisineMediator: string             // courrier médiateur
  guideProcedure: string              // guide étape par étape
}

// ─── Erreur ───

export interface ErrorResponse {
  success: false
  error: string
  details?: Record<string, string[]>
}
