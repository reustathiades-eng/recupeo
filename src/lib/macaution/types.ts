// ============================================================
// MACAUTION — Types TypeScript
// ============================================================

/** Type de location */
export type LocationType = 'vide' | 'meuble'

/** Statut de restitution du dépôt */
export type DepositReturnStatus = 'total' | 'partial' | 'none'

/** Statut des justificatifs fournis */
export type InvoiceStatus = 'yes' | 'no' | 'partial'

/** Dégradations à l'entrée */
export type EntryDamageStatus = 'yes' | 'no' | 'no_edl'

/** Motifs de retenue possibles */
export type DeductionReason =
  | 'peintures_murs'
  | 'sols'
  | 'sanitaires_plomberie'
  | 'equipements_cuisine'
  | 'menuiseries_portes'
  | 'nettoyage'
  | 'loyers_impayes'
  | 'charges_impayees'
  | 'autre'

/** Données du formulaire MACAUTION */
export interface MacautionFormData {
  locationType: LocationType
  rentAmount: number
  depositAmount: number
  entryDate: string          // YYYY-MM-DD
  exitDate: string           // YYYY-MM-DD
  depositReturned: DepositReturnStatus
  returnedAmount?: number
  returnDate?: string        // YYYY-MM-DD
  deductions: DeductionReason[]
  deductionAmount: number
  hasInvoices: InvoiceStatus
  entryDamages: EntryDamageStatus
  email: string
  otherDeduction?: string
}

/** Résultat des calculs purs JS */
export interface MacautionCalculations {
  /** Durée d'occupation en mois */
  occupationMonths: number
  /** Délai légal de restitution (1 ou 2 mois) */
  legalDeadlineDays: number
  /** Date limite légale de restitution */
  legalDeadlineDate: string
  /** Nombre de jours de retard */
  daysLate: number
  /** Nombre de mois de retard (arrondi au mois commencé) */
  monthsLate: number
  /** Montant des pénalités de retard (10% loyer HC / mois) */
  latePenalties: number
  /** Le dépôt dépasse-t-il le plafond légal ? */
  depositExcessive: boolean
  /** Plafond légal du dépôt */
  depositLegalMax: number
  /** Montant excédentaire du dépôt */
  depositExcess: number
  /** Montant retenu par le bailleur */
  amountWithheld: number
  /** Estimation vétusté (si applicable) */
  vetuste?: VetusteResult[]
}

/** Résultat du calcul de vétusté pour un poste */
export interface VetusteResult {
  element: string
  category: string
  lifespanYears: number
  franchiseYears: number
  annualRate: number
  occupationYears: number
  vetustePercent: number
  tenantShare: number
  landlordAbuse: number
}

/** Type d'anomalie détectable */
export type AnomalyType =
  | 'retard_restitution'
  | 'retenue_abusive'
  | 'penalites'
  | 'depot_excessif'
  | 'absence_justificatif'
  | 'vetuste_non_appliquee'
  | 'absence_edl'

/** Sévérité d'une anomalie */
export type AnomalySeverity = 'confirmed' | 'probable'

/** Niveau de risque global */
export type RiskLevel = 'low' | 'medium' | 'high'

/** Anomalie détectée par l'IA */
export interface Anomaly {
  type: AnomalyType
  severity: AnomalySeverity
  title: string
  summary: string
  detail: string
  amount: number
  legal_reference: string
}

/** Réponse IA du pré-diagnostic */
export interface PreDiagnosticResult {
  anomalies: Anomaly[]
  total_recoverable: number
  risk_level: RiskLevel
  recommendation: string
}

/** Réponse API pré-diagnostic (envoyée au frontend) */
export interface PreDiagnosticResponse {
  success: true
  diagnosticId: string
  anomaliesCount: number
  estimatedAmount: number
  riskLevel: RiskLevel
  anomalies: Array<{
    type: AnomalyType
    severity: AnomalySeverity
    title: string
    summary: string
    amount: number
  }>
  recommendation: string
  calculations: MacautionCalculations
}

/** Réponse erreur */
export interface ErrorResponse {
  success: false
  error: string
  details?: Record<string, string[]>
}
