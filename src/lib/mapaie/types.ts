/**
 * RÉCUPÉO — Brique MAPAIE
 * Types et interfaces TypeScript complets
 * "On va récupérer ce qu'on vous doit."
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS & CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

export type ContratType =
  | 'CDI'
  | 'CDD'
  | 'Intérim'
  | 'Apprentissage'
  | 'Professionnalisation'
  | 'Stage'
  | 'Autre'

export type TempsTravailType =
  | '35h'
  | '39h'
  | 'Temps partiel'
  | 'Forfait jours'
  | 'Autre'

export type AnomalieType =
  | 'HEURES_SUP_NON_PAYEES'
  | 'MAJORATION_INCORRECTE'
  | 'TAUX_HORAIRE_INFERIEUR_MINIMUM_CC'
  | 'PRIME_ANCIENNETE_MANQUANTE'
  | 'PRIME_ANCIENNETE_INCORRECTE'
  | 'PRIME_CONVENTIONNELLE_MANQUANTE'
  | 'TREIZIEME_MOIS_MANQUANT'
  | 'CLASSIFICATION_INCORRECTE'
  | 'ANCIENNETE_MAL_CALCULEE'
  | 'COTISATION_TAUX_INCORRECT'
  | 'CONGES_PAYES_INCORRECTS'
  | 'REPOS_COMPENSATEUR_MANQUANT'
  | 'SALAIRE_BASE_INCORRECT'
  | 'INDEMNITE_MANQUANTE'
  | 'AUTRE'

export type AnomalieSeverite = 'CRITIQUE' | 'MAJEURE' | 'MINEURE' | 'INFO'

export type AnomalieStatut =
  | 'DETECTEE'
  | 'CONFIRMEE'
  | 'CONTESTEE'
  | 'RESOLUE'
  | 'IGNOREE'

export type ReclamationStatut =
  | 'BROUILLON'
  | 'GENEREE'
  | 'ENVOYEE'
  | 'ACCUSEE_RECEPTION'
  | 'EN_NEGOCIATION'
  | 'ACCEPTEE'
  | 'REFUSEE'
  | 'CONTENTIEUX'

export type PeriodeAudit = '3_MOIS' | '6_MOIS' | '12_MOIS' | 'PERSONNALISEE'

export type BrancheCC =
  | 'BTP'
  | 'HCR'
  | 'COMMERCE'
  | 'INDUSTRIE'
  | 'TRANSPORT'
  | 'SANTE'
  | 'BANQUE_ASSURANCE'
  | 'NETTOYAGE'
  | 'GARDIENNAGE'
  | 'METALLURGIE'
  | 'CHIMIE'
  | 'AGROALIMENTAIRE'
  | 'AUTRE'

export type OffreAudit = 'AUDIT_3_MOIS' | 'AUDIT_12_MOIS'

// ─────────────────────────────────────────────────────────────────────────────
// CONVENTION COLLECTIVE
// ─────────────────────────────────────────────────────────────────────────────

export interface ConventionCollective {
  idcc: string
  libelle: string
  branche: BrancheCC
  contingentHSAnnuel?: number // heures, défaut 220
  tauxMajorationHS1?: number  // % pour 36-43ème heure, défaut 25
  tauxMajorationHS2?: number  // % à partir 44ème heure, défaut 50
  primeAncienneteBareme?: PrimeAncienneteBareme[]
  minima?: MinimaConventionnel[]
  primesObligatoires?: PrimeConventionnelle[]
}

export interface PrimeAncienneteBareme {
  anneeMin: number
  anneeMax: number | null
  tauxPourcentage: number // % du salaire de base
}

export interface MinimaConventionnel {
  niveau: string
  coefficient?: number
  tauxHoraireMinimum: number
  salaireMinimumMensuel?: number
  annee: number
}

export interface PrimeConventionnelle {
  code: string
  libelle: string
  obligatoire: boolean
  conditionAnciennete?: number // années requises
  montantFixe?: number
  tauxPourcentage?: number
  periodicite: 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE'
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEUR & SALARIÉ
// ─────────────────────────────────────────────────────────────────────────────

export interface Employeur {
  nom: string
  siret?: string
  adresse?: string
  conventionCollective?: ConventionCollective
  effectif?: '<10' | '10-49' | '50-249' | '250-999' | '1000+'
}

export interface Anciennete {
  annees: number
  mois: number
  dateReference: string // ISO date
  dateEntreeReelle?: string // si différente de dateEntree
}

export interface Classification {
  niveau?: string
  echelon?: number
  coefficient?: number
  libelle?: string
  posteOccupe?: string
}

export interface Salarie {
  nom?: string
  prenom?: string
  numeroSS?: string // anonymisé côté client
  dateEntree: string // ISO date
  anciennete: Anciennete
  classification: Classification
  contrat: ContratType
  tempsTravail: TempsTravailType
  heuresContractuelles?: number // ex: 151.67 pour 35h, 169 pour 39h
  forfaitJours?: number // si forfait jours
}

// ─────────────────────────────────────────────────────────────────────────────
// BULLETIN DE PAIE — STRUCTURE DÉTAILLÉE
// ─────────────────────────────────────────────────────────────────────────────

export interface HeuresSupplementaires {
  tranche: '25%' | '50%' | 'CC_SPECIFIQUE'
  nombreHeures: number
  tauxMajoration: number // en %
  tauxHoraire: number
  montantBrut: number
  montantAttendu?: number // calculé par nos soins
}

export interface SalaireBase {
  tauxHoraire: number
  heuresContractuelles: number
  montant: number
  commentaire?: string // anomalie détectée à l'OCR
}

export interface Prime {
  code: string
  libelle: string
  montant: number
  base?: number
  taux?: number
  commentaire?: string
}

export interface Remuneration {
  salaireBase: SalaireBase
  heuresSupplementaires?: HeuresSupplementaires[]
  primes?: Prime[]
  avantagesNature?: AvantageNature[]
  indemnitesExclusion?: Indemnite[] // non soumises cotisations
  totalBrutImposable: number
  totalBrut: number
}

export interface AvantageNature {
  libelle: string
  valeur: number
  type: 'NOURRITURE' | 'LOGEMENT' | 'VEHICULE' | 'AUTRE'
}

export interface Indemnite {
  libelle: string
  montant: number
  type:
    | 'TRANSPORT'
    | 'REPAS'
    | 'CONGES_PAYES'
    | 'LICENCIEMENT'
    | 'DEPART_RETRAITE'
    | 'AUTRE'
  soumiseCotisations: boolean
}

export interface LigneCotisation {
  libelle: string
  code?: string
  base: number
  tauxSalarial: number // en %
  montantSalarial: number
  tauxPatronal?: number // en %
  montantPatronal?: number
  tauxAttendu?: number // si anomalie détectée
}

export interface Cotisations {
  lignes: LigneCotisation[]
  totalSalarial: number
  totalPatronal?: number
}

export interface CongesPayes {
  soldeDebut?: number
  acquis: number
  pris: number
  soldeFin?: number
  indemniteCP?: number
  commentaire?: string
}

export interface ReposCompensateur {
  heuresAcquises?: number
  heuresPrises?: number
  solde?: number
  contingentDepasse?: boolean
}

export interface BulletinDePaie {
  id?: string
  meta: {
    mois: string // format YYYY-MM
    employeur: Employeur
    salarie: Salarie
  }
  remuneration: Remuneration
  cotisations: Cotisations
  congesPayes?: CongesPayes
  reposCompensateur?: ReposCompensateur
  netAPayer: number
  netImposable: number
  netAvantImpot?: number
  commentairesBulletin?: string[]
  sourceOCR?: boolean
  fiabiliteOCR?: number // 0-100
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMULAIRE UTILISATEUR
// ─────────────────────────────────────────────────────────────────────────────

export interface FormulaireEtape1 {
  // Informations personnelles
  prenom: string
  nom: string
  email: string
  telephone?: string
  // Situation professionnelle
  secteurActivite: BrancheCC
  contrat: ContratType
  tempsTravail: TempsTravailType
  heuresHebdomadaires?: number
  dateEntree: string // ISO date
  // Convention collective
  idccConnu: boolean
  idcc?: string
  libelleCC?: string
}

export interface FormulaireEtape2 {
  // Période d'audit
  periodeAudit: PeriodeAudit
  moisDebut: string // YYYY-MM
  moisFin: string   // YYYY-MM
  // Problèmes suspectés (pré-sélection utilisateur)
  problemesSupectes: AnomalieType[]
  // Informations complémentaires
  heuresSuppEffectuees: boolean
  heuresSuppMoyenneHebdo?: number
  primesRecues: boolean
  typesPrimesRecues?: string[]
  // Bulletins
  nombreBulletins: number
}

export interface FormulaireEtape3 {
  // Upload des bulletins
  bulletinsUploades: BulletinUpload[]
  // Consentements
  consentementTraitement: boolean
  consentementCGU: boolean
  consentementMarketing?: boolean
}

export interface BulletinUpload {
  id: string
  fichierNom: string
  fichierTaille: number
  fichierType: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp'
  mois: string // YYYY-MM
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TRAITE' | 'ERREUR'
  urlStockage?: string
  bulletinExtrait?: BulletinDePaie
  erreurOCR?: string
}

export interface FormulaireComplet {
  etape1: FormulaireEtape1
  etape2: FormulaireEtape2
  etape3: FormulaireEtape3
  offre: OffreAudit
  sessionId?: string
  createdAt?: string
  updatedAt?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// ANOMALIES DÉTECTÉES
// ─────────────────────────────────────────────────────────────────────────────

export interface AnomalieBase {
  id: string
  type: AnomalieType
  severite: AnomalieSeverite
  statut: AnomalieStatut
  moisConcerne: string // YYYY-MM
  bulletinId?: string
  titre: string
  description: string
  articleReference?: string // ex: "Art. L.3121-28 Code du travail"
  ccReference?: string      // ex: "Art. 13 CCN HCR"
}

export interface AnomalieHeuresSupplementaires extends AnomalieBase {
  type: 'HEURES_SUP_NON_PAYEES' | 'MAJORATION_INCORRECTE'
  detail: {
    heuresDeclarees: number
    heuresEffectuees?: number
    heuresNonPayees?: number
    tauxMajorationApplique: number
    tauxMajorationDu: number
    montantPaye: number
    montantDu: number
    ecart: number
  }
}

export interface AnomalieTauxHoraire extends AnomalieBase {
  type: 'TAUX_HORAIRE_INFERIEUR_MINIMUM_CC' | 'SALAIRE_BASE_INCORRECT'
  detail: {
    tauxApplique: number
    tauxMinimumCC: number
    ecartParHeure: number
    heuresMensuelles: number
    ecartMensuel: number
    niveauClassification: string
  }
}

export interface AnomaliePrimeAnciennete extends AnomalieBase {
  type: 'PRIME_ANCIENNETE_MANQUANTE' | 'PRIME_ANCIENNETE_INCORRECTE'
  detail: {
    ancienneteAnnees: number
    tauxDu: number
    tauxApplique: number
    salaireBase: number
    montantDu: number
    montantPaye: number
    ecart: number
  }
}

export interface AnomaliePrimeConventionnelle extends AnomalieBase {
  type: 'PRIME_CONVENTIONNELLE_MANQUANTE' | 'TREIZIEME_MOIS_MANQUANT'
  detail: {
    primeCode: string
    primeLibelle: string
    montantDu: number
    montantPaye: number
    ecart: number
    conditionRemplie: boolean
    conditionDetail?: string
  }
}

export interface AnomalieClassification extends AnomalieBase {
  type: 'CLASSIFICATION_INCORRECTE'
  detail: {
    niveauActuel: string
    niveauAttendu?: string
    coefficientActuel?: number
    coefficientAttendu?: number
    impactMensuelEstime: number
    posteOccupe?: string
  }
}

export interface AnomalieAnciennete extends AnomalieBase {
  type: 'ANCIENNETE_MAL_CALCULEE'
  detail: {
    dateEntreeDeclaree: string
    dateEntreeReelle?: string
    ancienneteDeclaree: number
    ancienneteReelle?: number
    impactPrimeAnciennete?: number
    impactIndemnites?: number
  }
}

export interface AnomalieCotisation extends AnomalieBase {
  type: 'COTISATION_TAUX_INCORRECT'
  detail: {
    libelleCotisation: string
    codeCotisation?: string
    tauxApplique: number
    tauxAttendu: number
    baseCalcul: number
    ecartMontant: number
    sensEcart: 'TROP_ELEVE' | 'TROP_BAS'
  }
}

export interface AnomalieCongesPayes extends AnomalieBase {
  type: 'CONGES_PAYES_INCORRECTS'
  detail: {
    joursAcquisDeclaresParMois: number
    joursAcquisDusParMois: number
    ecartJours: number
    impactMontant?: number
  }
}

export interface AnomalieReposCompensateur extends AnomalieBase {
  type: 'REPOS_COMPENSATEUR_MANQUANT'
  detail: {
    heuresHSSurPeriode: number
    contingentAnnuel: number
    heuresAuDela: number
    reposCompensateurDu: number // en heures
    valeurMonetaireEstimee: number
  }
}

export type Anomalie =
  | AnomalieHeuresSupplementaires
  | AnomalieTauxHoraire
  | AnomaliePrimeAnciennete
  | AnomaliePrimeConventionnelle
  | AnomalieClassification
  | AnomalieAnciennete
  | AnomalieCotisation
  | AnomalieCongesPayes
  | AnomalieReposCompensateur
  | AnomalieBase

// ─────────────────────────────────────────────────────────────────────────────
// CALCULS & RAPPELS
// ─────────────────────────────────────────────────────────────────────────────

export interface RappelMensuel {
  mois: string // YYYY-MM
  anomalies: string[] // ids des anomalies
  montantBrut: number
  montantNet: number // estimation après charges ~77%
  detail: RappelDetail[]
}

export interface RappelDetail {
  anomalieId: string
  anomalieType: AnomalieType
  libelle: string
  montantBrut: number
  montantNet: number
  baseCalcul?: string
}

export interface RecapitulatifCalcul {
  periodeDebut: string // YYYY-MM
  periodeFin: string   // YYYY-MM
  nombreMoisAnalyses: number
  nombreBulletinsAnalyses: number
  nombreAnomaliesDetectees: number
  anomaliesParSeverite: Record<AnomalieSeverite, number>
  anomaliesParType: Partial<Record<AnomalieType, number>>
  rappelsMensuels: RappelMensuel[]
  totalBrutRecuperable: number
  totalNetEstime: number
  // Prescription
  dateFinPrescription: string // 3 ans à partir du dernier bulletin
  montantPrescrit?: number    // si certains mois > 3 ans
  // Confiance
  scoreConfiance: number // 0-100
  niveauConfiance: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'TRES_ELEVE'
  facteurConfiance: string[]
}

export interface SimulateurRapide {
  salaireNetMensuel: number
  ancienneteAnnees: number
  heuresSuppHebdo: number
  secteur: BrancheCC
  // Résultat estimatif avant audit complet
  estimationBasse: number
  estimationHaute: number
  probabiliteErreur: number // 0-100
  principauxRisques: AnomalieType[]
}

// ─────────────────────────────────────────────────────────────────────────────
// RAPPORT D'AUDIT
// ─────────────────────────────────────────────────────────────────────────────

export interface RapportAudit {
  id: string
  userId?: string
  sessionId: string
  createdAt: string
  offre: OffreAudit
  statut: 'EN_COURS' | 'TERMINE' | 'ERREUR'
  // Données source
  formulaire: FormulaireComplet
  bulletins: BulletinDePaie[]
  // Résultats
  anomalies: Anomalie[]
  calcul: RecapitulatifCalcul
  // Recommandations
  recommandations: Recommandation[]
  // Réclamation
  reclamation?: Reclamation
  // Métadonnées
  versionAlgorithme: string
  tempsTraitement?: number // ms
}

export interface Recommandation {
  priorite: number // 1 = plus urgent
  titre: string
  description: string
  actionRequise: string
  delaiRecommande?: string
  anomaliesLiees: string[] // ids
  impactEstime: number
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉCLAMATION
// ─────────────────────────────────────────────────────────────────────────────

export interface Reclamation {
  id: string
  rapportId: string
  statut: ReclamationStatut
  createdAt: string
  updatedAt: string
  // Destinataire
  destinataire: DestinataireReclamation
  // Contenu
  objet: string
  corpsLettre: string
  anomaliesIncluces: string[] // ids
  montantReclame: number
  periodeReclamee: {
    debut: string
    fin: string
  }
  // Pièces jointes
  piecesJointes: PieceJointe[]
  // Suivi
  historique: EvenementReclamation[]
  // Résultat
  montantObtenu?: number
  dateResolution?: string
  commentaireResolution?: string
}

export interface DestinataireReclamation {
  type: 'EMPLOYEUR' | 'RH' | 'DREETS' | 'CONSEIL_PRUDHOMMES'
  nom: string
  adresse?: string
  email?: string
  referenceInterne?: string
}

export interface PieceJointe {
  id: string
  libelle: string
  type: 'BULLETIN_PAIE' | 'CALCUL_RAPPEL' | 'REFERENCE_CC' | 'AUTRE'
  urlFichier?: string
  genereAutomatiquement: boolean
}

export interface EvenementReclamation {
  id: string
  date: string
  type:
    | 'CREATION'
    | 'ENVOI'
    | 'ACCUSEE_RECEPTION'
    | 'REPONSE_EMPLOYEUR'
    | 'RELANCE'
    | 'RESOLUTION'
    | 'CONTENTIEUX'
  description: string
  auteur: 'SYSTEME' | 'UTILISATEUR' | 'EMPLOYEUR'
  pieceJointeId?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// API — REQUÊTES & RÉPONSES
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyseBulletinRequest {
  bulletinId: string
  urlFichier: string
  mois: string
  conventionCollective?: ConventionCollective
  salarie?: Partial<Salarie>
}

export interface AnalyseBulletinResponse {
  success: boolean
  bulletinExtrait?: BulletinDePaie
  anomaliesDetectees?: Anomalie[]
  erreur?: string
  fiabiliteOCR?: number
}

export interface LancerAuditRequest {
  formulaire: FormulaireComplet
  bulletinIds: string[]
}

export interface LancerAuditResponse {
  success: boolean
  rapportId?: string
  statut?: 'EN_COURS' | 'TERMINE' | 'ERREUR'
  estimationTemps?: number // secondes
  erreur?: string
}

export interface GetRapportResponse {
  success: boolean
  rapport?: RapportAudit
  erreur?: string
}

export interface GenererReclamationRequest {
  rapportId: string
  anomaliesSelectionnees: string[] // ids
  destinataire: DestinataireReclamation
  tonReclamation: 'AMIABLE' | 'FERME' | 'MISE_EN_DEMEURE'
}

export interface GenererReclamationResponse {
  success: boolean
  reclamation?: Reclamation
  erreur?: string
}

export interface SimulateurRequest {
  salaireNetMensuel: number
  ancienneteAnnees: number
  heuresSuppHebdo: number
  secteur: BrancheCC
  contrat: ContratType
}

export interface SimulateurResponse {
  success: boolean
  simulation?: SimulateurRapide
  erreur?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOAD CMS — COLLECTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface MapaieAuditDocument {
  id: string
  userId?: string
  sessionId: string
  email: string
  offre: OffreAudit
  statut: RapportAudit['statut']
  formulaire: FormulaireComplet
  rapport?: RapportAudit
  paiementStatut: 'EN_ATTENTE' | 'PAYE' | 'REMBOURSE' | 'ECHEC'
  paiementSessionId?: string
  montantPaye?: number
  createdAt: string
  updatedAt: string
}

export interface MapaieConventionDocument {
  id: string
  idcc: string
  libelle: string
  branche: BrancheCC
  donnees: ConventionCollective
  dateMAJ: string
  actif: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL — STORE
// ─────────────────────────────────────────────────────────────────────────────

export interface MapaieStore {
  // Navigation
  etapeCourante: 1 | 2 | 3 | 4
  etapesValidees: Set<number>
  // Formulaire
  formulaire: Partial<FormulaireComplet>
  // Upload
  bulletinsUploades: BulletinUpload[]
  uploadEnCours: boolean
  // Audit
  auditEnCours: boolean
  rapportId?: string
  rapport?: RapportAudit
  // Erreurs
  erreurs: Record<string, string>
  // Actions
  setEtape: (etape: MapaieStore['etapeCourante']) => void
  setFormulaireEtape1: (data: FormulaireEtape1) => void
  setFormulaireEtape2: (data: FormulaireEtape2) => void
  ajouterBulletin: (bulletin: BulletinUpload) => void
  supprimerBulletin: (id: string) => void
  mettreAJourBulletin: (id: string, updates: Partial<BulletinUpload>) => void
  lancerAudit: () => Promise<void>
  reset: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES DE TYPE
// ─────────────────────────────────────────────────────────────────────────────

export type AnomalieAvecCalcul = Anomalie & {
  montantBrut: number
  montantNet: number
  inclureDansReclamation: boolean
}

export type BulletinAvecAnomalies = BulletinDePaie & {
  anomalies: Anomalie[]
  scoreConformite: number // 0-100
}

export type ResultatAnalyseCC = {
  ccTrouvee: boolean
  convention?: ConventionCollective
  source: 'IDCC' | 'LIBELLE' | 'BRANCHE' | 'DEFAUT'
  fiabilite: number // 0-100
}

export type EcartCalcule = {
  montantPaye: number
  montantDu: number
  ecartBrut: number
  ecartNet: number
  pourcentageEcart: number
  sensEcart: 'TROP_PAYE' | 'SOUS_PAYE' | 'CONFORME'
}

export type ValidationFormulaire<T> = {
  valide: boolean
  donnees?: T
  erreurs: Partial<Record<keyof T, string>>
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES EXPORTÉES
// ─────────────────────────────────────────────────────────────────────────────

export const TAUX_MAJORATION_HS_LEGAL = {
  TRANCHE_1: 25, // 36ème à 43ème heure
  TRANCHE_2: 50, // à partir de la 44ème heure
} as const

export const CONTINGENT_HS_ANNUEL_LEGAL = 220 as const

export const PRESCRIPTION_RAPPEL_SALAIRE_ANS = 3 as const

export const TAUX_CHARGES_SALARIALES_MOYEN = 0.23 as const // ~23% pour estimer net

export const HEURES_MENSUELLES: Record<string, number> = {
  '35h': 151.67,
  '39h': 169.0,
} as const

export const OFFRES_MAPAIE: Record<OffreAudit, { prix: number; label: string; mois: number }> = {
  AUDIT_3_MOIS: {
    prix: 49,
    label: 'Audit 3 mois',
    mois: 3,
  },
  AUDIT_12_MOIS: {
    prix: 129,
    label: 'Audit 12 mois + réclamation',
    mois: 12,
  },
} as const

export const SEVERITE_ORDRE: Record<AnomalieSeverite, number> = {
  CRITIQUE: 4,
  MAJEURE: 3,
  MINEURE: 2,
  INFO: 1,
} as const

export const ANOMALIE_LABELS: Record<AnomalieType, string> = {
  HEURES_SUP_NON_PAYEES: 'Heures supplémentaires non payées',
  MAJORATION_INCORRECTE: 'Majoration heures sup incorrecte',
  TAUX_HORAIRE_INFERIEUR_MINIMUM_CC: 'Taux horaire inférieur au minimum conventionnel',
  PRIME_ANCIENNETE_MANQUANTE: "Prime d'ancienneté manquante",
  PRIME_ANCIENNETE_INCORRECTE: "Prime d'ancienneté incorrecte",
  PRIME_CONVENTIONNELLE_MANQUANTE: 'Prime conventionnelle manquante',
  TREIZIEME_MOIS_MANQUANT: '13ème mois manquant',
  CLASSIFICATION_INCORRECTE: 'Classification / coefficient incorrect',
  ANCIENNETE_MAL_CALCULEE: 'Ancienneté mal calculée',
  COTISATION_TAUX_INCORRECT: 'Taux de cotisation incorrect',
  CONGES_PAYES_INCORRECTS: 'Congés payés incorrects',
  REPOS_COMPENSATEUR_MANQUANT: 'Repos compensateur manquant',
  SALAIRE_BASE_INCORRECT: 'Salaire de base incorrect',
  INDEMNITE_MANQUANTE: 'Indemnité manquante',
  AUTRE: 'Autre anomalie',
} as const
