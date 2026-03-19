// ============================================================
// MABANQUE — Types TypeScript
// ============================================================

export type YesNoUnknown = 'yes' | 'no' | 'unknown'

// ─── Formulaire ───

export interface MabanqueFormData {
  // Banque
  banque: string
  typeCompte: 'courant' | 'joint'

  // Frais (dernier mois ou estimés)
  commissionsIntervention: number      // € total commissions d'intervention sur le mois
  commissionsNombre: number            // nombre d'opérations facturées
  rejetsPrelevement: number            // € total rejets de prélèvement
  rejetsPrelevementNombre: number      // nombre de rejets
  rejetsCheque: number                 // € total rejets de chèque
  agios: number                        // € agios / intérêts débiteurs
  lettresInformation: number           // € frais de lettre d'info (chèque sans provision)
  fraisTenueCompte: number             // € frais de tenue de compte mensuel
  autresFrais: number                  // € autres frais inexpliqués
  autresFraisDescription: string       // description libre
  totalFraisMois: number               // € total frais sur le dernier mois
  estimationAnnuelle: number | null    // € estimation annuelle si connue

  // Situation
  clientFragile: YesNoUnknown
  offreSpecifique: YesNoUnknown        // offre spécifique clientèle fragile (3€/mois)
  surendettement: YesNoUnknown
  incidentsMultiples: YesNoUnknown     // 5+ incidents en un mois
  inscritFCC: YesNoUnknown             // Fichier Central des Chèques

  // Contact
  email: string
}

// ─── Anomalies détectées ───

export type AnomalyType =
  | 'depassement_commission_operation'   // commission > 8€/op (ou 4€ si fragile)
  | 'depassement_commission_mensuel'     // total commissions > 80€/mois (ou 20€ si fragile)
  | 'depassement_rejet_prelevement'      // rejet > 20€
  | 'depassement_rejet_cheque'           // rejet > 30€ ou 50€
  | 'fragile_non_identifie'             // éligible fragile mais plafonds standard
  | 'offre_specifique_absente'          // fragile identifié mais pas d'offre à 3€/mois
  | 'double_facturation_probable'       // commission + rejet + agios + lettre pour même incident
  | 'frais_non_justifies'              // frais inexpliqués déclarés
  | 'virement_instantane_facture'       // dans autresFraisDescription

export type AnomalySeverity = 'high' | 'medium' | 'low'

export interface Anomaly {
  type: AnomalyType
  severity: AnomalySeverity
  label: string
  detail: string
  montantExces: number                  // € en trop sur le mois
}

// ─── Résultat pré-diagnostic (gratuit) ───

export interface MabanquePreDiagResponse {
  success: true
  diagnosticId: string
  anomalies: Anomaly[]
  totalAnomalies: number
  tropPercuMensuel: number
  tropPercuAnnuel: number
  tropPercu5ans: number
  isFragileEligible: boolean
  isFragileApplied: boolean
  banque: string
}

// ─── Résultat rapport complet (payant) ───

export interface MabanqueFullReportResponse {
  success: true
  diagnosticId: string
  anomalies: Anomaly[]
  tropPercuMensuel: number
  tropPercuAnnuel: number
  tropPercu5ans: number
  report: {
    title: string
    date: string
    reference: string
    sections: Array<{ id: string; title: string; content: string }>
  }
}

// ─── Courriers ───

export interface MabanqueLetters {
  reclamationServiceClient: string     // courrier réclamation au service clientèle
  saisineMediator: string              // courrier saisine médiateur bancaire
  guideSignalConso: string             // guide signalement DGCCRF
  guideProcedure: string               // guide étape par étape
}

// ─── Erreur ───

export interface ErrorResponse {
  success: false
  error: string
  details?: Record<string, string[]>
}
