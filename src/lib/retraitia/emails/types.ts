// ============================================================
// RETRAITIA — Types séquences email/SMS Brevo
// ============================================================

export type SequenceId =
  | 'S1' | 'S2' | 'S3' | 'S4' | 'S5'
  | 'S6' | 'S7' | 'S8' | 'S9' | 'S10'
  | 'S11' | 'S12' | 'S13' | 'S14' | 'S15'

export type StopCondition =
  | 'paiement_9'
  | 'paiement_49'
  | 'acces_fc_valide'
  | 'docs_complets'
  | 'anomalie_resolue'
  | 'client_agit'
  | 'none'

export interface EmailStep {
  etape: number               // E1, E2, E3...
  delayDays: number           // jours après le déclencheur
  channel: 'email' | 'sms' | 'email+sms'
  subject: (vars: EmailVars) => string
  htmlContent: (vars: EmailVars) => string
  smsContent?: (vars: EmailVars) => string
  /** Condition supplémentaire pour cet email spécifique */
  condition?: (vars: EmailVars) => boolean
}

export interface EmailSequence {
  id: SequenceId
  label: string
  steps: EmailStep[]
  stopCondition: StopCondition
  /** Variante réversion : ton sobre */
  hasReversionVariant?: boolean
}

export interface EmailVars {
  // Client
  prenom: string
  nom?: string
  email: string
  telephone?: string
  parcours: 'retraite' | 'preretraite' | 'reversion'

  // Flash
  niveauRisque?: string
  anneeNaissance?: number
  nbEnfants?: number
  typeCarriere?: string
  flashId?: string
  facteurs?: string

  // Dossier
  dossierId?: string
  lienEspaceClient: string
  lienPaiement9?: string
  lienPaiement49?: string
  lienRapportPdf?: string
  lienDemarches?: string
  lienTestFlash?: string
  lienGuideFC?: string
  lienGuideMdpAmeli?: string
  lienGuideMdpImpots?: string
  lienGuideRIS?: string
  lienMagicLink?: string
  lienUpsell?: string
  lienMataxe?: string
  lienMonimpot?: string

  // Documents
  nbDocsManquants?: number
  listeDocsManquants?: string
  listeDocsStatus?: string
  precisionAudit?: number
  nomDoc?: string
  resumeExtraction?: string
  risUploade?: boolean

  // Diagnostic
  nbAnomalies?: number
  nbNiveaux?: number
  scoreGlobal?: string
  impactMin?: number
  impactMax?: number
  impactCumuleMin?: number
  impactCumuleMax?: number
  anneeDepart?: number
  prixPackAction?: number
  montantDeduit?: number
  prixNet?: number

  // Anomalies / Démarches
  anomalieLabel?: string
  anomalieId?: string
  organisme?: string
  dateEnvoi?: string
  dateEcheance?: string
  delaiEstime?: string
  gain?: number
  gainAnnuel?: number
  gainRestant?: number
  gainTotal?: number
  nbAnomaliesRestantes?: number
  topAnomalies?: Array<{ label: string; impact: number; organisme: string }>

  // Réversion
  nbRegimes?: number

  // Proche
  prenomClient?: string
  prenomProche?: string

  // Cross-sell
  exonerationTF?: boolean
  creditImpot?: boolean
  aspaCss?: boolean
  impactTF?: number
  impactCI?: number

  // Pré-retraité
  dateDepart?: string
  nbCorrections?: number
  prixUpsell?: number

  // France Services
  adresseFranceServices?: string
  horairesFranceServices?: string
}

/** Log d'un email envoyé */
export interface EmailLog {
  sequence: SequenceId
  etape: number
  channel: 'email' | 'sms'
  sentAt: string
  subject?: string
  to: string
  success: boolean
  error?: string
}

/** État des séquences pour un dossier */
export interface EmailSequenceState {
  /** Séquences actives avec date de déclenchement */
  active: Record<string, {
    triggeredAt: string
    lastStepSent: number
    completedAt?: string
    stoppedReason?: string
  }>
  /** Historique de tous les envois */
  logs: EmailLog[]
  /** Préférence canal */
  channelPreference: 'email_only' | 'email_sms'
}
