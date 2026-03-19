import type { AnomalyType, AnomalySeverity, Percentage } from './index'

export interface AnomalyEvidence {
  bulletinLineCode?: string
  bulletinLineLibelle?: string
  expectedValue: number | string
  actualValue: number | string
  delta?: number
  legalReference: string
  conventionReference?: string
  articleCode?: string
  sourceDocument?: string
}

export interface AnomalyCalculation {
  montantMensuel: number
  montantTotal: number
  moisConcernes: number[]
  anneesConcernees: number[]
  methodologie: string
  tauxMajoration?: number
  heuresManquantes?: number
  baseCalcul?: number
  detailParMois?: AnomalyMonthlyDetail[]
}

export interface AnomalyMonthlyDetail {
  mois: number
  annee: number
  montantDu: number
  montantPaye: number
  ecart: number
}

export interface AnomalyPrescription {
  dateDebutPrescription: string
  dateFinPrescription: string
  estPrescrit: boolean
  moisRecuperables: number
}

export interface AnomalyRecommendation {
  action: 'RECLAMATION_EMPLOYEUR' | 'SAISINE_PRUDHOMMES' | 'INSPECTION_TRAVAIL' | 'MEDIATION'
  priorite: 1 | 2 | 3
  description: string
  delaiConseil?: string
}

export interface Anomaly {
  id: string
  type: AnomalyType
  severity: AnomalySeverity
  titre: string
  description: string
  explication: string
  evidence: AnomalyEvidence
  calculation: AnomalyCalculation
  prescription: AnomalyPrescription
  confidence: Percentage
  bulletinIds: string[]
  recommendations: AnomalyRecommendation[]
  createdAt: string
  updatedAt: string
}

export interface AnomalyGroup {
  type: AnomalyType
  anomalies: Anomaly[]
  montantTotalGroupe: number
  severiteMax: AnomalySeverity
  count: number
}

export interface AnomalySummary {
  totalAnomalies: number
  parSeverite: Record<AnomalySeverity, number>
  parType: Record<AnomalyType, number>
  montantTotalRecuperable: number
  montantPrescrit: number
  montantNonPrescrit: number
  groupes: AnomalyGroup[]
  confidenceMoyenne: Percentage
  periodeAnalysee: {
    dateDebut: string
    dateFin: string
    nombreBulletins: number
  }
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[]
  summary: AnomalySummary
  analyseDuree: number
  version: string
}