// ============================================================
// MONIMPÔT — Types
// ============================================================

export type SituationFamiliale = 'celibataire' | 'marie_pacse' | 'divorce_separe' | 'veuf'
export type TypeRevenus = 'salaires' | 'retraite' | 'mixte' | 'independant'

export interface MonimpotFormData {
  // Profil fiscal
  situation: SituationFamiliale
  vivezSeul: boolean
  enfantsMineurs: number
  enfantsMajeurs: number
  eleveSeul5ans: boolean  // case L
  age: number
  invalidite: boolean

  // Revenus
  revenuNetImposable: number
  nbParts: number
  impotPaye: number
  typeRevenus: TypeRevenus

  // Check-list déductions
  fraisReels: boolean
  distanceTravail?: number
  puissanceFiscale?: number
  teletravail?: boolean
  joursTeletravail?: number

  pensionAlimentaire: boolean
  pensionMontantMois?: number

  dons: boolean
  donsMontantAn?: number

  emploiDomicile: boolean
  emploiDomicileMontantAn?: number

  gardeEnfant: boolean
  gardeMontantAn?: number

  ehpad: boolean
  ehpadMontantAn?: number

  per: boolean
  perMontantAn?: number

  revenusCapitaux: boolean
  case2op?: boolean | null  // null = "je ne sais pas"

  // Champs Phase 3
  enfantsCollege?: number
  enfantsLycee?: number
  enfantsSuperieur?: number
  cotisationsSyndicales?: number
  pinelMontant?: number
  outreMerMontant?: number
  investForestier?: number
  renovationEnergetique?: number
  borneElectriqueMontant?: number
  pretEtudiantMontant?: number
  loyersBruts?: number
  chargesLocatives?: number
  locationMeubleeCA?: number
  csgDeductibleMontant?: number
  prestationCompensatoireMontant?: number
  domTom?: boolean
  deficitsFonciersAnterieurs?: number

  email?: string

  // Champs V2 (extraction)
  rfr?: number
  isFromExtraction?: boolean
  extractedCases?: Record<string, number | boolean>
  extractedRevenusCapitaux?: number
  multiAvis?: unknown[]
}

export interface Optimisation {
  type: string
  label: string
  description: string
  economie: number
  priorite: 'haute' | 'moyenne' | 'basse'
  caseConcernee?: string
}

export interface ProfilResume {
  situation: string
  age: number
  nbParts: number
  revenuNetImposable: number
  impotEstime: number
  tmi: number
}

export interface SuggestionFuture {
  id: string
  titre: string
  description: string
  economieEstimee: number
  difficulte: 'facile' | 'moyen' | 'avance'
  icone: string
}

export interface MonimpotPreDiagResponse {
  success: boolean
  diagnosticId: string
  optimisations: Optimisation[]
  totalOptimisations: number
  impotActuel: number
  impotOptimise: number
  economieAnnuelle: number
  economie3ans: number
  hasOptimisations: boolean
  profil?: ProfilResume
  suggestions?: SuggestionFuture[]
}

export interface ErrorResponse {
  success: false
  error: string
  details?: Record<string, string[]>
}
