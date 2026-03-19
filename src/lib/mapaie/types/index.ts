export type ConventionCode =
  | 'IDCC_2216'
  | 'IDCC_1979'
  | 'IDCC_1596'
  | 'IDCC_3248'
  | 'IDCC_0573'
  | 'AUTRE'

export type AnomalyType =
  | 'HEURES_SUP_NON_PAYEES'
  | 'MAJORATION_HS_INCORRECTE'
  | 'CONVENTION_MAL_APPLIQUEE'
  | 'PRIME_OUBLIEE'
  | 'ANCIENNETE_INCORRECTE'
  | 'CLASSIFICATION_ERRONEE'
  | 'COTISATION_TAUX_OBSOLETE'
  | 'CONGES_PAYES_INCORRECTS'
  | 'REPOS_COMPENSATEUR_MANQUANT'

export type AnomalySeverity = 'CRITIQUE' | 'MAJEURE' | 'MINEURE'

export type AuditPeriod = 'THREE_MONTHS' | 'TWELVE_MONTHS'

export type ReportStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'COMPLETE' | 'SENT'

export type Percentage = number & { readonly __brand: 'Percentage' }

export type Pii<T> = T & { readonly __brand: 'Pii' }

export type Url = string & { readonly __brand: 'Url' }

export function pii<T>(value: T): Pii<T> {
  return value as Pii<T>
}

export function percentage(value: number): Percentage {
  if (value < 0 || value > 1) {
    throw new RangeError(`Percentage must be between 0 and 1, got ${value}`)
  }
  return value as Percentage
}

export function url(value: string): Url {
  try {
    new URL(value)
  } catch {
    throw new TypeError(`Invalid URL: ${value}`)
  }
  return value as Url
}

export type { BulletinLine, BulletinPeriod, BulletinEmployee, BulletinEmployer, Bulletin } from './bulletin'
export type { Payslip } from './bulletin'

export type {
  AnomalyEvidence,
  AnomalyCalculation,
  Anomaly,
  AnomalyGroup,
} from './anomaly'

export type {
  ConventionRule,
  ConventionHeureSup,
  ConventionAnciennetePalier,
  ConventionPrime,
  ConventionClassification,
  ConventionConfig,
} from './convention'

export interface AuditRequest {
  userId: string
  bulletins: string[]
  conventionCode: ConventionCode
  period: AuditPeriod
  dateEntree: string
  tempsPartiel: boolean
  heuresContractuelles: number
}

export interface AuditResult {
  id: string
  userId: string
  createdAt: string
  period: AuditPeriod
  conventionCode: ConventionCode
  bulletinCount: number
  anomalyCount: number
  totalRappelEstime: number
  confidence: Percentage
  status: ReportStatus
}

export interface RappelSalaire {
  anomalyId: string
  type: AnomalyType
  mois: number
  annee: number
  montantBrut: number
  montantNet: number
  prescrit: boolean
  dateLimit: string
}

export interface ReclamationData {
  auditId: string
  employeNom: Pii<string>
  employePrenom: Pii<string>
  employeur: string
  siret: Pii<string>
  adresseEmployeur: string
  rappels: RappelSalaire[]
  totalBrut: number
  totalNet: number
  conventionCode: ConventionCode
  referencesLegales: string[]
  dateGeneration: string
}

export interface MaPayslipUpload {
  fileId: string
  userId: string
  fileName: string
  mimeType: 'application/pdf' | 'image/png' | 'image/jpeg'
  uploadedAt: string
  ocrStatus: 'PENDING' | 'PROCESSING' | 'DONE' | 'ERROR'
  extractedText?: Pii<string>
  bulletinId?: string
}

export interface PricingTier {
  id: AuditPeriod
  label: string
  price: number
  bulletinCount: number
  includesReclamation: boolean
}

export const PRICING: Record<AuditPeriod, PricingTier> = {
  THREE_MONTHS: {
    id: 'THREE_MONTHS',
    label: 'Audit 3 mois',
    price: 4900,
    bulletinCount: 3,
    includesReclamation: false,
  },
  TWELVE_MONTHS: {
    id: 'TWELVE_MONTHS',
    label: 'Audit 12 mois + réclamation',
    price: 12900,
    bulletinCount: 12,
    includesReclamation: true,
  },
}