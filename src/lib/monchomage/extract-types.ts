// ============================================================
// MONCHOMAGE — Types d'extraction (notification + bulletins)
// ============================================================

export type ExtractionMode = 'ocr_local' | 'vision_fallback'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface ExtractedDocument {
  type: 'notification_droits' | 'attestation_employeur' | 'bulletin_paie' | 'autre'
  confidence: ConfidenceLevel
  fileName: string
  summary: string
}

// ─── Données extraites ───

export interface MonchomageExtractionResult {
  mode: ExtractionMode
  ocrConfidence?: number
  documents: ExtractedDocument[]
  pageCount: number

  // Depuis la notification France Travail
  notification: {
    ajBrute: number | null
    sjr: number | null
    dureeIndemnisation: number | null
    degressivite: 'yes' | 'no' | 'unknown'
    dateNotification: string | null
    identifiantFT: string | null         // anonymisé
  }

  // Depuis l'attestation employeur ou bulletins
  emploi: {
    typeRupture: string | null
    typeContrat: string | null
    dateFinContrat: string | null
    employeur: string | null             // anonymisé
    salaireBrutMoyen: number | null
    primesDetectees: number | null       // total primes/13ème mois
    moisTravailles: number | null
  }

  // Depuis les bulletins de paie
  bulletins: {
    count: number
    salaires: Array<{ mois: string; brut: number }>
    totalBrut: number
    primesIdentifiees: Array<{ label: string; montant: number }>
    arretsMaladie: number | null         // jours détectés
    conventionCollective: string | null  // nom ou IDCC détecté sur les bulletins
  }

  warnings: string[]
}

// ─── API responses ───

export interface MonchomageExtractAPIResponse {
  success: true
  extraction: MonchomageExtractionResult
}

export interface MonchomageExtractAPIError {
  success: false
  error: string
  needsVisionConsent?: boolean
  ocrConfidence?: number
}
