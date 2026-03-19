// ============================================================
// MABANQUE — Types d'extraction de relevé bancaire
// ============================================================

export type ExtractionMode = 'ocr_local' | 'vision_fallback'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

// ─── Ligne de frais extraite ───

export interface ExtractedFee {
  date: string                        // "JJ/MM/AAAA" ou "AAAA-MM-JJ"
  label: string                       // libellé tel qu'il apparaît sur le relevé
  amount: number                      // montant en €
  category: ExtractedFeeCategory
  confidence: ConfidenceLevel
}

export type ExtractedFeeCategory =
  | 'commission_intervention'
  | 'rejet_prelevement'
  | 'rejet_cheque'
  | 'agios'
  | 'lettre_information'
  | 'frais_tenue_compte'
  | 'virement_instantane'
  | 'frais_autre'
  | 'non_frais'                       // opérations normales (exclues du calcul)

// ─── Résultat d'extraction ───

export interface MabanqueExtractionResult {
  mode: ExtractionMode
  ocrConfidence?: number

  // Infos du relevé
  banqueDetectee: string | null
  periodeDebut: string | null         // "AAAA-MM-JJ"
  periodeFin: string | null
  titulaire: string | null            // sera anonymisé

  // Frais extraits ligne par ligne
  fees: ExtractedFee[]

  // Résumé catégorisé (pour auto-remplir le formulaire)
  summary: {
    commissionsIntervention: number
    commissionsNombre: number
    rejetsPrelevement: number
    rejetsPrelevementNombre: number
    rejetsCheque: number
    agios: number
    lettresInformation: number
    fraisTenueCompte: number
    autresFrais: number
    autresFraisLabels: string[]
    totalFraisMois: number
    virementInstantaneFacture: boolean
  }

  // Méta
  warnings: string[]
  pageCount: number
}

// ─── Réponse API ───

export interface MabanqueExtractAPIResponse {
  success: true
  extraction: MabanqueExtractionResult
}

export interface MabanqueExtractAPIError {
  success: false
  error: string
  needsVisionConsent?: boolean
  ocrConfidence?: number
}
