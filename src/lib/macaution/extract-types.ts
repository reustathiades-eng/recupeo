// ============================================================
// MACAUTION V2 — Types pour l'extraction documentaire
// ============================================================

/** Confiance de l'extraction */
export type ExtractionConfidence = 'high' | 'medium' | 'low'

/** Type de document identifié */
export type DocumentType = 'bail' | 'edl_entree' | 'edl_sortie' | 'courrier_bailleur' | 'facture' | 'photo' | 'autre'

/** Mode d'extraction utilisé */
export type ExtractionMode = 'ocr_local' | 'vision_fallback'

/** Champ extrait avec confiance et source */
export interface ExtractedField<T> {
  value: T | null
  confidence: ExtractionConfidence
  source: string  // Ex: "Bail page 1", "EDL sortie page 3"
}

/** Document identifié dans l'upload */
export interface IdentifiedDocument {
  type: DocumentType
  confidence: ExtractionConfidence
  pageCount: number
  summary: string  // Ex: "Bail signé le 15/03/2018, location vide, loyer 850€"
  fileName: string
}

/** Comparaison EDL entrée ↔ sortie, pièce par pièce */
export interface EDLComparison {
  room: string            // "Salon", "Cuisine", "Chambre 1"...
  entryState: string      // "Bon état, peinture blanche propre"
  exitState: string       // "Traces sur les murs, trou rebouché"
  degradation: boolean
  vetusteApplicable: boolean
  comment: string         // "Usure normale après 7 ans"
}

/** Résultat complet de l'extraction documentaire */
export interface ExtractionResult {
  /** Mode utilisé pour l'extraction */
  mode: ExtractionMode

  /** Documents identifiés */
  documents: IdentifiedDocument[]

  /** Données extraites structurées */
  extracted: {
    locationType: ExtractedField<'vide' | 'meuble'>
    rentAmount: ExtractedField<number>
    depositAmount: ExtractedField<number>
    entryDate: ExtractedField<string>       // YYYY-MM-DD
    exitDate: ExtractedField<string>        // YYYY-MM-DD
    depositReturned: ExtractedField<'total' | 'partial' | 'none'>
    returnedAmount: ExtractedField<number>
    returnDate: ExtractedField<string>      // YYYY-MM-DD
    deductions: ExtractedField<string[]>    // DeductionReason[]
    deductionAmount: ExtractedField<number>
    hasInvoices: ExtractedField<'yes' | 'no' | 'partial'>
    entryDamages: ExtractedField<'yes' | 'no' | 'no_edl'>
  }

  /** Comparaison EDL (si les 2 sont fournis) */
  edlComparison: EDLComparison[] | null

  /** Documents manquants importants */
  missingDocuments: string[]

  /** Alertes et incohérences */
  warnings: string[]

  /** Score de confiance OCR (mode ocr_local uniquement) */
  ocrConfidence?: number
}

/** Réponse API /api/macaution/extract */
export interface ExtractAPIResponse {
  success: true
  extraction: ExtractionResult
}

/** Erreur API /api/macaution/extract */
export interface ExtractAPIError {
  success: false
  error: string
  /** true si l'OCR n'est pas fiable et que la Vision est nécessaire */
  needsVisionConsent?: boolean
  ocrConfidence?: number
}

/** Requête pour retenter avec Vision (après consentement) */
export interface VisionRetryRequest {
  consentGiven: true
  files: File[]
}
