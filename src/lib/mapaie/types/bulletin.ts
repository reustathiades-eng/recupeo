import type { ConventionCode, Pii, Percentage } from './index'

export interface BulletinLine {
  code: string
  libelle: string
  base: number | null
  taux: number | null
  montantSalarial: number
  montantPatronal: number | null
  nature: 'GAIN' | 'COTISATION' | 'RETENUE' | 'INFO'
}

export interface BulletinPeriod {
  mois: number
  annee: number
  dateDebut: string
  dateFin: string
}

export interface BulletinEmployee {
  nom: Pii<string>
  prenom: Pii<string>
  matricule: Pii<string>
  numeroSecu: Pii<string | null>
  dateEntree: string
  dateNaissance: Pii<string | null>
  qualification: string | null
  coefficient: number | null
  classification: string | null
}

export interface BulletinEmployer {
  raisonSociale: string
  siret: Pii<string>
  codeNAF: string
  adresse: string
  conventionCollective: ConventionCode
  idcc: string
}

export interface BulletinHeures {
  heuresNormales: number
  heuresSup25: number
  heuresSup50: number
  heuresNuit: number
  heuresDimanche: number
  heuresFeriees: number
  totalHeures: number
}

export interface BulletinConges {
  acquisMois: number
  prisMois: number
  soldeConges: number
  compteurRTT: number | null
  compteurReposCompensateur: number | null
}

export interface BulletinRemuneration {
  salaireBase: number
  brutAvantCotisations: number
  totalCotisationsSalariales: number
  totalCotisationsPatronales: number
  netImposable: number
  netAPayer: number
  prelevement: number | null
  netVerse: number
}

export interface BulletinCumuls {
  brutCumule: number
  netImposableCumule: number
  heuresSupCumulees: number
  congesAcquisCumules: number
  congesPrisCumules: number
}

export interface BulletinMetadata {
  sourceDocumentId: string
  ocrConfidence: Percentage
  extractedAt: string
  verifiedAt: string | null
  pageCount: number
  rawTextHash: string
}

export interface Bulletin {
  id: string
  periode: BulletinPeriod
  salarie: BulletinEmployee
  employeur: BulletinEmployer
  heures: BulletinHeures
  conges: BulletinConges
  lignes: BulletinLine[]
  remuneration: BulletinRemuneration
  cumuls: BulletinCumuls
  metadata: BulletinMetadata
  ancienneteAnnees: number
  tempsTravail: 'TEMPS_PLEIN' | 'TEMPS_PARTIEL'
  tauxActivite: Percentage | null
}

export type Payslip = Bulletin

export interface BulletinSet {
  bulletins: Bulletin[]
  salarie: BulletinEmployee
  employeur: BulletinEmployer
  periodeDebut: BulletinPeriod
  periodeFin: BulletinPeriod
  nombreMois: number
  conventionDetectee: ConventionCode
  fiabiliteGlobale: Percentage
}