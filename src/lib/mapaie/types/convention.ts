import type { ConventionCode, Percentage } from './index'

export type RuleSource = 'LOI' | 'DECRET' | 'CCN' | 'ACCORD_BRANCHE' | 'ACCORD_ENTREPRISE'

export type RuleUnit = 'EUR' | 'PERCENT' | 'HOURS' | 'DAYS' | 'COEFFICIENT'

export interface ConventionRule {
  code: string
  libelle: string
  valeur: number | string
  unite: RuleUnit
  dateApplication: string
  dateExpiration?: string
  legalReference: string
  source: RuleSource
}

export interface ConventionHeureSup {
  seuilDeclenchement: number
  tranche1Max: number
  tranche1Majoration: number
  tranche2Majoration: number
  contingentAnnuel: number
  reposCompensateurObligatoire: boolean
  seuilReposCompensateur?: number
  majorationNuit?: number
  majorationDimanche?: number
  majorationJourFerie?: number
}

export interface ConventionAnciennetePalier {
  anneesMin: number
  anneesMax: number | null
  tauxPrime: number
  baseCalcul: 'SALAIRE_BASE' | 'SALAIRE_BRUT' | 'MINIMUM_CONVENTIONNEL'
}

export interface ConventionAnciennete {
  paliers: ConventionAnciennetePalier[]
  periodiciteVersement: 'MENSUEL' | 'ANNUEL'
  inclureDansBase: boolean
}

export interface ConventionPrime {
  code: string
  libelle: string
  montant: number | null
  tauxSurBase?: number
  periodicite: 'MENSUEL' | 'TRIMESTRIEL' | 'SEMESTRIEL' | 'ANNUEL' | 'PONCTUEL'
  conditionAnciennete?: number
  conditionPresence?: boolean
  obligatoire: boolean
  legalReference: string
}

export interface ConventionClassification {
  niveau: string
  echelon: string
  coefficient: number
  salaireMinimum: number
  dateEffet: string
  description?: string
}

export interface ConventionCongesPayes {
  joursOuvrablesBase: number
  joursSupAnciennete: ConventionAnciennetePalier[]
  joursFractionnement: boolean
  methodeCalcul: 'MAINTIEN' | 'DIXIEME' | 'PLUS_FAVORABLE'
}

export interface ConventionAvantageNature {
  code: string
  libelle: string
  evaluationForfaitaire: number
  evaluationReelle: boolean
  legalReference: string
}

export interface ConventionIndemnite {
  code: string
  libelle: string
  montant: number
  unite: 'EUR' | 'PERCENT'
  conditionApplication: string
  legalReference: string
}

export interface ConventionConfig {
  code: ConventionCode
  idcc: string
  libelle: string
  branche: string
  dateExtension: string
  heuresSup: ConventionHeureSup
  anciennete: ConventionAnciennete
  primes: ConventionPrime[]
  classifications: ConventionClassification[]
  congesPayes: ConventionCongesPayes
  avantagesNature: ConventionAvantageNature[]
  indemnites: ConventionIndemnite[]
  reglesSpecifiques: ConventionRule[]
}

export interface ConventionMatch {
  code: ConventionCode
  libelle: string
  confidence: Percentage
  matchedOn: ('IDCC' | 'OPCO' | 'BRANCHE' | 'LIBELLE_BULLETIN')[]
}

export interface ConventionLookupResult {
  found: boolean
  match: ConventionMatch | null
  alternatives: ConventionMatch[]
}

export interface ConventionValidationResult {
  conventionCode: ConventionCode
  regleVerifiee: string
  conforme: boolean
  ecart?: number
  ecartUnite?: RuleUnit
  regleAttendue: ConventionRule
  valeurConstatee: number | string
  legalReference: string
  conventionReference: string
}