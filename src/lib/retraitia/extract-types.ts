// ============================================================
// RETRAITIA — Types pour l'extraction documentaire
// ============================================================

/** Confiance de l'extraction */
export type ExtractionConfidence = 'high' | 'medium' | 'low'

/** Type de document retraite identifié */
export type RetraitiaDocumentType =
  | 'ris'               // Relevé Individuel de Situation
  | 'eig'               // Estimation Indicative Globale
  | 'agirc_arrco'       // Relevé de points Agirc-Arrco
  | 'notification'      // Notification de retraite (CNAV/CARSAT)
  | 'bulletin_salaire'  // Bulletin de salaire
  | 'attestation_pe'    // Attestation Pôle Emploi / France Travail
  | 'livret_militaire'  // Livret militaire / ESS
  | 'autre'

/** Mode d'extraction utilisé */
export type ExtractionMode = 'ocr_local' | 'vision_fallback'

/** Champ extrait avec confiance et source */
export interface ExtractedField<T> {
  value: T | null
  confidence: ExtractionConfidence
  source: string  // Ex: "RIS page 1", "EIG page 2"
}

/** Document identifié dans l'upload */
export interface IdentifiedDocument {
  type: RetraitiaDocumentType
  confidence: ExtractionConfidence
  pageCount: number
  summary: string
  fileName: string
}

/** Détail d'un trimestre par année (extrait du RIS) */
export interface YearDetail {
  year: number
  regime: string           // ex: "CNAV", "MSA"
  trimestresCotises: number
  trimestresAssimiles: number
  trimestresValides: number
  salaireBrut?: number
}


/** Informations personnelles du client (extraites des documents) */
export interface ClientInfo {
  lastName: string | null      // Nom de famille
  firstName: string | null     // Prénom
  fullName: string | null      // Nom complet
  address: string | null       // Adresse postale
  city: string | null          // Ville
  postalCode: string | null    // Code postal
  nir: string | null           // N° de Sécurité Sociale
  carsat: string | null        // CARSAT de rattachement
  phone: string | null         // Téléphone
}

/** Résultat complet de l'extraction documentaire RETRAITIA */
export interface RetraitiaExtractionResult {
  mode: ExtractionMode

  /** Documents identifiés */
  documents: IdentifiedDocument[]

  /** Données extraites structurées — correspondent aux champs du formulaire */
  extracted: {
    // Profil
    birthDate: ExtractedField<string>          // YYYY-MM-DD
    sex: ExtractedField<'M' | 'F'>
    
    // Carrière
    regimes: ExtractedField<string[]>          // RetirementRegime[]
    totalTrimesters: ExtractedField<number>
    cotisedTrimesters: ExtractedField<number>
    careerStartYear: ExtractedField<number>    // première année d'activité
    careerStartAge: ExtractedField<number>
    militaryService: ExtractedField<boolean>
    militaryDuration: ExtractedField<number>   // mois

    // Pension
    basePension: ExtractedField<number>        // mensuel brut CNAV
    complementaryPension: ExtractedField<number> // mensuel brut Agirc-Arrco
    retirementDate: ExtractedField<string>     // YYYY-MM-DD
    hasChildrenBonus: ExtractedField<boolean>
    hasDecote: ExtractedField<boolean>
    tauxLiquidation: ExtractedField<number>    // ex: 50, 47.5

    // Points Agirc-Arrco
    totalPointsAgircArrco: ExtractedField<number>
  }

  /** Détail carrière année par année (si RIS disponible) */
  yearDetails: YearDetail[] | null

  /** Périodes problématiques détectées (trous, incohérences) */
  careerGaps: Array<{
    startYear: number
    endYear: number
    type: 'gap' | 'low_salary' | 'missing_trimester'
    comment: string
  }> | null

  /** Documents manquants importants */
  missingDocuments: string[]

  /** Alertes et incohérences */
  warnings: string[]

  /** Informations personnelles du client */
  clientInfo: ClientInfo

  /** Score de confiance OCR */
  ocrConfidence?: number
}

/** Réponse API /api/retraitia/extract */
export interface RetraitiaExtractAPIResponse {
  success: true
  extraction: RetraitiaExtractionResult
}

/** Erreur API /api/retraitia/extract */
export interface RetraitiaExtractAPIError {
  success: false
  error: string
  needsVisionConsent?: boolean
  ocrConfidence?: number
}
