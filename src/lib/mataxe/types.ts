// ============================================================
// MATAXE — Types TypeScript
// ============================================================

// ─── Bien immobilier ───

export type PropertyType = 'appartement' | 'maison' | 'autre'

export type HeatingType = 'central_collectif' | 'central_individuel' | 'individuel' | 'aucun'

export type ConditionRating = 'tres_bon' | 'bon' | 'passable' | 'mediocre' | 'mauvais'

export type YesNoNa = 'oui' | 'non' | 'na'

export type YesNoIdk = 'oui' | 'non' | 'ne_sais_pas'

/** Catégorie cadastrale (1 à 8) */
export type CadastralCategory = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

// ─── Formulaire (23 champs, 4 sections) ───

export interface MataxeFormData {
  // Section 1 — Votre bien
  propertyType: PropertyType
  constructionYear: number
  surfaceHabitable: number       // m² réels
  roomCount: number              // pièces principales
  floor: number | null           // étage (null si maison)
  elevator: YesNoNa
  bathroomCount: number          // salles de bain / salles d'eau
  wcCount: number
  heating: HeatingType
  hasGarage: boolean
  hasCave: boolean
  hasBalcony: boolean
  balconySurface: number | null  // m² si hasBalcony

  // Section 2 — État du bien
  buildingCondition: ConditionRating | 'na'  // copro ou NA si maison
  propertyCondition: ConditionRating
  removedEquipment: YesNoIdk
  removedEquipmentDetail: string | null

  // Section 3 — Taxe foncière
  taxAmount: number              // montant dernier avis (€)
  commune: string
  vlcKnown: boolean
  vlcAmount: number | null       // VLC si connue
  has6675M: boolean              // formulaire 6675-M disponible
  baseNette: number | null       // base nette d'imposition (ligne "Base" sur l'avis TF)

  // Section 4 — Situation personnelle
  ownerAge: number
  beneficiaryAspaAah: boolean    // ASPA / AAH / ASI
  isMainResidence: boolean
  email: string
}

// ─── Calculs JS purs ───

export interface MataxeCalculations {
  // Surface pondérée
  surfacePrincipale: number         // surface habitable × 1.00
  surfaceEquipements: number        // m² fictifs équipements (sanitaire, chauffage...)
  surfaceDependances: number        // m² pondérés (garage, cave, balcon)
  surfacePondereeEstimee: number    // total estimé

  // Catégorie estimée
  categorieEstimee: CadastralCategory
  categorieLabel: string

  // Coefficient d'entretien
  coeffEntretien: number
  coeffEntretienLabel: string

  // VLC estimée
  tarifCategorie: number            // €/m² (tarif moyen catégorie)
  vlcEstimee: number                // surface pondérée × tarif × coeff entretien × coeff situation
  baseImposition: number            // VLC × 50%

  // Comparaison
  vlcDeclaree: number | null        // VLC renseignée par l'utilisateur
  ecartVlc: number | null           // différence VLC déclarée vs estimée (%)

  // Exonérations
  eligibleExonerationTotale: boolean
  eligibleExonerationPartielle: boolean
  exonerationMotif: string | null

  // Estimation taxe théorique
  taxeEstimee: number               // base × taux moyen communes
  ecartTaxe: number                 // taxe payée - taxe estimée
  ecartTaxePct: number              // en %
  remboursement4ans: number         // écart × 4 (rétroactif)

  // Données déduites de la base nette (quand disponible)
  baseNetteDisponible: boolean
  tauxReelCommune: number | null    // taux déduit = taxe / baseNette
  vlcAdminDeduite: number | null    // VLC admin = baseNette × 2
  ecartVlcPrecis: number | null     // écart VLC estimée vs admin (%)
}

// ─── Anomalies ───

export type MataxeAnomalyType =
  | 'coefficient_entretien'
  | 'equipements_supprimes'
  | 'surface_ponderee'
  | 'categorie_surevaluee'
  | 'dependances_fictives'
  | 'exoneration_manquante'

export type AnomalySeverity = 'confirmed' | 'probable' | 'to_verify'

export interface MataxeAnomaly {
  type: MataxeAnomalyType
  severity: AnomalySeverity
  title: string
  summary: string                    // pour le teaser gratuit
  detail: string                     // pour le rapport payant
  impactAnnualMin: number            // €/an min
  impactAnnualMax: number            // €/an max
  confidence: number                  // 0-100 fiabilité de cette anomalie
  confirmableWith: string | null      // ce qui permettrait de confirmer
  legalReference: string
}

// ─── Résultat pré-diagnostic (Claude API) ───

export interface MataxePreDiagResult {
  anomalies: MataxeAnomaly[]
  totalImpactAnnualMin: number
  totalImpactAnnualMax: number
  totalImpact4Years: number
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: string
}

// ─── Réponses API ───

export interface MataxePreDiagResponse {
  success: true
  diagnosticId: string
  anomaliesCount: number
  impactAnnualMin: number
  impactAnnualMax: number
  impact4Years: number
  riskLevel: 'low' | 'medium' | 'high'
  anomalies: Array<{
    type: MataxeAnomalyType
    severity: AnomalySeverity
    title: string
    summary: string
    impactAnnualMax: number
    confidence: number
    confirmableWith: string | null
  }>
  recommendation: string
  calculations: MataxeCalculations
  reliability: {
    level: 'bronze' | 'argent' | 'or' | 'platine'
    score: number
    label: string
    description: string
    whatWeKnow: string[]
    whatWeDontKnow: string[]
    nextStep: string | null
    nextStepGain: number | null
  }
}

export interface ErrorResponse {
  success: false
  error: string
  details?: Record<string, string[]>
}

// ─── Rapport complet (après paiement) ───

export interface MataxeReportSection {
  id: string
  title: string
  content: string
}

export interface MataxeFullReport {
  title: string
  date: string
  reference: string
  sections: MataxeReportSection[]
}

// ─── Réclamation fiscale ───

export interface MataxeReclamation {
  courrier: string                   // texte de la réclamation
  destinataire: string               // centre des impôts fonciers
  guide6675M: string                 // guide pour obtenir le formulaire
  piecesJustificatives: string[]     // liste des pièces à joindre
}
