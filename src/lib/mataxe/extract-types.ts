// ============================================================
// MATAXE — Types pour l'extraction du formulaire 6675-M
// ============================================================

/** Confiance de l'extraction */
export type ExtractionConfidence = 'high' | 'medium' | 'low'

/** Type de document cadastral identifié */
export type MataxeDocumentType =
  | '6675m'              // Fiche d'évaluation cadastrale (formulaire 6675-M)
  | 'avis_tf'            // Avis de taxe foncière
  | 'releve_propriete'   // Relevé de propriété (extrait cadastral)
  | 'autre'

/** Mode d'extraction utilisé */
export type ExtractionMode = 'ocr_local' | 'vision_fallback'

/** Champ extrait avec confiance et source */
export interface ExtractedField<T> {
  value: T | null
  confidence: ExtractionConfidence
  source: string  // Ex: "6675-M page 1", "Avis TF page 2"
}

/** Document identifié dans l'upload */
export interface IdentifiedDocument {
  type: MataxeDocumentType
  confidence: ExtractionConfidence
  pageCount: number
  summary: string
  fileName: string
}

/** Équipement extrait du 6675-M avec ses m² fictifs */
export interface ExtractedEquipment {
  name: string                     // "Baignoire", "Chauffage central", etc.
  sqMetersAdded: number            // m² fictifs ajoutés
  confidence: ExtractionConfidence
}

/** Dépendance extraite du 6675-M */
export interface ExtractedDependency {
  name: string                     // "Garage", "Cave", "Balcon"
  rawSurface: number               // m² réels
  weightedSurface: number          // m² pondérés
  coefficient: number              // coeff de pondération appliqué
  confidence: ExtractionConfidence
}

/** Pièce / partie du local extraite du 6675-M */
export interface ExtractedRoom {
  name: string                     // "Pièce principale 1", "Cuisine", "Couloir"
  rawSurface: number               // m² réels
  coefficient: number              // 1.00 pièce principale, 0.50 secondaire
  weightedSurface: number          // m² pondérés
  confidence: ExtractionConfidence
}

/** Résultat complet de l'extraction du 6675-M */
export interface MataxeExtractionResult {
  mode: ExtractionMode

  /** Documents identifiés */
  documents: IdentifiedDocument[]

  /** Données extraites structurées */
  extracted: {
    // ─── Identifiants du bien ───
    communeCode: ExtractedField<string>         // Code commune INSEE
    communeName: ExtractedField<string>         // Nom de la commune
    parcelleRef: ExtractedField<string>         // Référence cadastrale (section + numéro)
    localRef: ExtractedField<string>            // Référence du local
    ownerName: ExtractedField<string>           // Nom du propriétaire
    address: ExtractedField<string>             // Adresse du bien

    // ─── Paramètres clés du calcul VLC ───
    cadastralCategory: ExtractedField<number>   // Catégorie 1-8
    categoryLabel: ExtractedField<string>       // "Ordinaire", "Confortable", etc.
    tarifM2: ExtractedField<number>             // Tarif au m² de la catégorie (€/m²)
    coeffEntretien: ExtractedField<number>      // Ex: 1.00, 1.10, 1.20
    coeffEntretienLabel: ExtractedField<string> // "Bon", "Passable", etc.
    coeffSituation: ExtractedField<number>      // Ex: 0.95, 1.00, 1.05

    // ─── Surfaces ───
    surfaceReelle: ExtractedField<number>       // Surface réelle totale (m²)
    surfacePonderee: ExtractedField<number>     // Surface pondérée totale (m²)
    surfaceEquipements: ExtractedField<number>  // m² fictifs équipements
    surfaceDependances: ExtractedField<number>  // m² pondérés dépendances

    // ─── VLC et base ───
    vlcBrute: ExtractedField<number>            // VLC brute (€)
    vlcRevisee: ExtractedField<number>          // VLC après révision/actualisation (€)
    baseNette: ExtractedField<number>           // Base nette d'imposition (€)

    // ─── Données de l'avis TF (si fourni en plus) ───
    taxAmount: ExtractedField<number>           // Montant total TF (€)
    tauxCommunal: ExtractedField<number>        // Taux communal (%)
    tauxIntercommunal: ExtractedField<number>   // Taux intercommunal (%)
    teom: ExtractedField<number>                // TEOM (€)
  }

  /** Détail des pièces / parties du local */
  rooms: ExtractedRoom[] | null

  /** Équipements listés sur le 6675-M */
  equipments: ExtractedEquipment[] | null

  /** Dépendances listées */
  dependencies: ExtractedDependency[] | null

  /** Documents manquants importants */
  missingDocuments: string[]

  /** Alertes et incohérences détectées */
  warnings: string[]

  /** Score de confiance OCR */
  ocrConfidence?: number
}

/** Réponse API /api/mataxe/extract */
export interface MataxeExtractAPIResponse {
  success: true
  extraction: MataxeExtractionResult
}

/** Erreur API /api/mataxe/extract */
export interface MataxeExtractAPIError {
  success: false
  error: string
  needsVisionConsent?: boolean
  ocrConfidence?: number
}
