// ============================================================
// MONLOYER — Types TypeScript
// ============================================================

// ─── Territoires et villes ───

export type Territory =
  | 'paris'
  | 'lille'
  | 'plaine_commune'
  | 'lyon_villeurbanne'
  | 'est_ensemble'
  | 'montpellier'
  | 'bordeaux'
  | 'pays_basque'
  | 'grenoble'

export type ConstructionEra =
  | 'before_1946'
  | '1946_1970'
  | '1971_1990'
  | 'after_1990'

export type LocationType = 'vide' | 'meuble'

export type RoomCount = 1 | 2 | 3 | 4

export type DPE = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'unknown'

// ─── Commune éligible ───

export interface EligibleCity {
  name: string
  slug: string
  territory: Territory
  since: string // date ISO "YYYY-MM"
  simulatorUrl: string
}

// ─── Territoire ───

export interface TerritoryInfo {
  id: Territory
  label: string
  since: string
  cities: string[] // noms des communes
  simulatorUrl: string
}

// ─── Formulaire ───

export interface MonloyerFormData {
  city: string
  address: string
  locationType: LocationType
  rooms: RoomCount
  constructionEra: ConstructionEra
  surface: number
  currentRent: number // loyer HC actuel
  hasComplement: 'yes' | 'no' | 'unknown'
  complementAmount?: number
  bailDate: string // YYYY-MM-DD
  dpe: DPE
  referenceRentMajore: number // loyer de référence majoré (saisi par l'utilisateur)
  email: string
}

// ─── Résultat du check ───

export type CheckStatus = 'conforme' | 'depassement' | 'complement_abusif'

export interface MonloyerCheckResult {
  status: CheckStatus
  territory: Territory
  territoryLabel: string
  referenceRentMajore: number
  currentRent: number
  excessMonthly: number // trop-perçu mensuel HC
  complementAmount: number
  totalRecoverable: number // trop-perçu total (mois × excès)
  monthsSinceBail: number
  maxRecoverableMonths: number // plafonné à 36 (prescription 3 ans)
  bailDate: string
  surface: number
  pricePerSqm: number // loyer au m²
  referencePricePerSqm: number // référence majorée au m²
  dpeWarning: boolean // DPE F/G = pas de complément possible
}

// ─── Réponse API ───

export interface MonloyerCheckResponse {
  success: true
  data: MonloyerCheckResult
  diagnosticId: string
}

export interface MonloyerErrorResponse {
  success: false
  error: string
  details?: Record<string, string[]>
}

// ─── Courriers (Phase C) ───

export interface MonloyerLetterData {
  tenantName: string
  tenantAddress: string
  landlordName: string
  landlordAddress: string
  propertyAddress: string
  bailDate: string
  currentRent: number
  referenceRentMajore: number
  excessMonthly: number
  totalRecoverable: number
  territory: string
}

export interface MonloyerLetters {
  miseEnDemeure: string
  saisineCDC: string
  signalementPrefecture: string
}
