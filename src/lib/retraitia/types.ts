// ============================================================
// RETRAITIA V2 — Types TypeScript
// ============================================================
// Refonte complète pour RETRAITIA V2.
// Source : briefs MASTER, PARCOURS_RETRAITE, ANOMALY_DETECTION, MOTEUR_CALCUL
// ============================================================

// ─────────────────────────────────────────────
// 1. Enums et types de base
// ─────────────────────────────────────────────

/** Parcours client */
export type RetirementPath = 'retraite' | 'preretraite' | 'reversion'

/** Statut du client dans son parcours */
export type ClientStatus =
  | 'retired'       // Retraité actuel (pension versée)
  | 'pre_retired'   // Pré-retraité (pas encore parti)
  | 'surviving'     // Conjoint survivant (parcours réversion)

/** Sexe */
export type Sex = 'M' | 'F'

/** Situation familiale */
export type MaritalStatus =
  | 'marie'
  | 'pacse'
  | 'concubin'
  | 'celibataire'
  | 'divorce'
  | 'veuf'

/** Régimes de base */
export type BaseRegime =
  | 'cnav'           // Régime général (CNAV / CARSAT)
  | 'sre'            // Fonctionnaires d'État
  | 'cnracl'         // Fonctionnaires territoriaux/hospitaliers
  | 'ssi'            // Indépendants (ex-RSI, intégré CNAV depuis 2020)
  | 'msa_salarie'    // MSA salariés agricoles
  | 'msa_exploitant' // MSA exploitants agricoles
  | 'cnavpl'         // Professions libérales (base)
  | 'cnbf'           // Avocats (base)

/** Régimes complémentaires */
export type ComplementaryRegime =
  | 'agirc_arrco'    // Salariés privés
  | 'rafp'           // Fonctionnaires (additionnelle)
  | 'ircantec'       // Contractuels FP
  | 'rci'            // Indépendants (complémentaire)
  | 'msa_compl'      // MSA exploitants (complémentaire)
  | 'cipav'          // Architectes, ingénieurs…
  | 'carmf'          // Médecins
  | 'carpimko'       // Infirmiers, kinés…
  | 'carcdsf'        // Dentistes, sages-femmes
  | 'cavp'           // Pharmaciens
  | 'cnbf_compl'     // Avocats (complémentaire)
  | 'crn'            // Notaires
  | 'cavec'          // Experts-comptables
  | 'cavom'          // Officiers ministériels
  | 'carpv'          // Vétérinaires
  | 'cprn'           // Agents généraux d'assurance

/** Tout régime (base ou complémentaire) */
export type Regime = BaseRegime | ComplementaryRegime

/** Régimes spéciaux (non couverts — détection uniquement) */
export type SpecialRegime =
  | 'cnieg' | 'crpcen' | 'ratp' | 'sncf' | 'enim'
  | 'canssm' | 'fspoeie' | 'banque_france' | 'cavimac'

// ─────────────────────────────────────────────
// 2. Flash (mini-diagnostic gratuit)
// ─────────────────────────────────────────────

/** 4 questions du flash + email */
export interface FlashInput {
  status: ClientStatus
  birthYear: number
  childrenCount: number
  careerType: 'simple_prive' | 'simple_public' | 'independant' | 'mixte' | 'agricole' | 'liberal'
  email: string
}

/** Niveau de risque flash */
export type FlashRiskLevel = 'FAIBLE' | 'MODERE' | 'ELEVE' | 'TRES_ELEVE'

/** Facteur de risque détecté par le flash */
export interface FlashRiskFactor {
  id: string
  label: string
  weight: number  // 0-10
}

/** Résultat du flash */
export interface FlashResult {
  riskLevel: FlashRiskLevel
  riskScore: number           // 0-100
  factors: FlashRiskFactor[]
  headline: string            // ex: "Votre profil présente un risque élevé d'erreurs"
  subline: string             // ex: "3 facteurs de risque identifiés"
}

// ─────────────────────────────────────────────
// 3. Dossier client (post-paiement 9€)
// ─────────────────────────────────────────────

/** Statut global du dossier */
export type DossierStatus =
  | 'created'              // Dossier créé, en attente de documents
  | 'collecting'           // Collecte en cours
  | 'documents_complete'   // Tous les docs obligatoires reçus
  | 'extracting'           // Extraction en cours
  | 'extracted'            // Extraction terminée
  | 'analyzing'            // Moteur de calcul + détection en cours
  | 'diagnostic_ready'     // Diagnostic serré prêt
  | 'report_paid'          // 49€ payé, rapport en génération
  | 'report_ready'         // Rapport PDF + interactif prêts
  | 'actions_in_progress'  // Démarches en cours
  | 'completed'            // Toutes les anomalies traitées

/** Statut d'un document dans la checklist */
export type DocumentStatus =
  | 'missing'        // Pas encore uploadé
  | 'uploading'      // Upload en cours
  | 'uploaded'       // Uploadé, en attente d'extraction
  | 'extracting'     // Extraction en cours
  | 'extracted'      // Extraction réussie
  | 'error'          // Extraction échouée
  | 'rejected'       // Document incorrect (mauvais type)
  | 'optional_skip'  // Document optionnel, le client a choisi de ne pas le fournir

/** Type de document attendu */
export type DocumentType =
  | 'ris'                     // Relevé Individuel de Situation
  | 'notification_cnav'       // Notification de pension CNAV/CARSAT
  | 'notification_sre'        // Titre de pension SRE
  | 'notification_cnracl'     // Notification CNRACL
  | 'releve_agirc_arrco'      // Relevé de points Agirc-Arrco
  | 'releve_mensualites'      // Relevé de mensualités (paiements)
  | 'paiements_agirc_arrco'   // Relevé paiements Agirc-Arrco
  | 'avis_imposition'         // Avis d'imposition
  | 'attestation_fiscale'     // Attestation fiscale retraite
  | 'eig'                     // Estimation Indicative Globale (≥55 ans)
  | 'notification_msa'        // Notification MSA
  | 'releve_cnavpl'           // Relevé CNAVPL / section
  | 'autre'                   // Autre document

/** Métadonnées d'un document uploadé */
export interface DossierDocument {
  type: DocumentType
  status: DocumentStatus
  fileName?: string
  fileUrl?: string
  uploadedAt?: string          // ISO date
  extractedAt?: string         // ISO date
  extractionConfidence?: number // 0-100
  extractionId?: string        // ref vers retraitia-extractions
  rejectionReason?: string     // si rejeté
}

// ─────────────────────────────────────────────
// 4. Formulaire complémentaire (3 blocs / 16 questions)
// ─────────────────────────────────────────────

/** Bloc 1 — Identité & situation */
export interface FormIdentite {
  nom: string
  prenom: string
  dateNaissance: string        // YYYY-MM-DD
  sexe: Sex
  nir?: string                 // N° SS (optionnel, jamais envoyé à Claude)
  situationFamiliale: MaritalStatus
  conjointDecede?: boolean     // pour détecter le parcours réversion
  dateDecesConjoint?: string
}

/** Bloc 2 — Enfants & vie familiale */
export interface FormEnfants {
  nombreEnfants: number
  enfants?: Array<{
    dateNaissance: string
    elevePar: 'mere' | 'pere' | 'deux'
    dureeElevage: 'moins_9_ans' | '9_ans_ou_plus'
  }>
  enfantsACharge: number       // encore à charge au moment de la liquidation
  parentIsole?: boolean        // a élevé seul(e) un enfant 5+ ans
}

/** Bloc 3 — Carrière & spécificités */
export interface FormCarriere {
  regimes: BaseRegime[]
  regimesComplementaires?: ComplementaryRegime[]
  regimesSpeciaux?: SpecialRegime[]      // si détecté → message
  premierEmploiAnnee?: number
  premierEmploiAge?: number
  serviceMilitaire: boolean
  serviceMilitaireDureeMois?: number
  periodesChomage: boolean
  periodesChomageDureeMois?: number
  chomageNonIndemnise?: boolean
  periodesMaladie: boolean
  periodesMaladieDureeMois?: number
  periodesEtranger: boolean
  paysEtranger?: string[]
  periodesApprentissage?: boolean
  apprentissageAvant2014?: boolean
  parentAuFoyer?: boolean                // AVPF
  cadreAvant2019?: boolean               // pour GMP
  fonctionnaireGrade?: string
  fonctionnaireEchelon?: number
  fonctionnaireIndiceMajore?: number
  fonctionnaireCategorieActive?: boolean
  fonctionnaireServicesOutreMer?: boolean
  ancienCombattant?: boolean
  invalidite?: boolean
  tauxInvalidite?: number                // pourcentage
  emploiDomicile?: boolean
  locataire?: boolean
  proprietaire?: boolean
  retraiteDateDepart?: string            // YYYY-MM-DD (si retraité)
  preretraiteDateSouhaitee?: string      // YYYY-MM-DD (si pré-retraité)
  // Montants déclarés (si pas encore de documents)
  pensionBaseBrute?: number
  pensionComplementaireBrute?: number
  totalPensionsMensuelles?: number
  // Champs specifiques pre-retraite
  salaireBrutMensuel?: number              // salaire actuel (estimation SAM futur)
  anneesEtudesSupérieures?: number         // rachat de trimestres
  ageDepartSouhaite?: number               // 60-67
  tempsPartielPrevu?: boolean              // retraite progressive
  cumulEmploiPrevu?: boolean               // cumul emploi-retraite
}

// ─────────────────────────────────────────────
// Simulation pre-retraite
// ─────────────────────────────────────────────

/** Scenario de depart a un age donne */
export interface ScenarioDepart {
  age: number
  annee: number
  trimestresTotal: number
  trimestresRequis: number
  trimestresManquants: number
  taux: number                    // % (ex: 50, 47.5)
  decotePct: number               // 0 si taux plein
  surcotePct: number              // 0 si pas de surcote
  pensionBaseMensuelle: number
  pensionComplementaireMensuelle: number
  pensionTotaleMensuelle: number
  recommande?: boolean
  note?: string
}

/** Resultat de la simulation multi-scenarios */
export interface SimulationResult {
  scenarios: ScenarioDepart[]
  scenarioRecommande?: ScenarioDepart
  trimestresActuels: number
  ageTauxPlein: number
  anneeTauxPlein: number
}

/** Scenario de rachat de trimestres */
export interface ScenarioRachat {
  nbTrimestres: number
  option: 'taux' | 'taux_duree'
  coutEstime: number
  gainMensuel: number
  tempsRetourAnnees: number
  rentable: boolean
  ageRentabilite?: number
}

/** Resultat de l'analyse rachat */
export interface RachatResult {
  trimestresManquants: number
  trimestresRachetables: number       // max 12 (etudes) ou trimestres manquants
  anneesEtudes: number
  scenarios: ScenarioRachat[]
  recommandation: string
}

// ─────────────────────────────────────────────
// Reversion
// ─────────────────────────────────────────────

/** Informations sur le conjoint decede */
export interface DefuntInfo {
  prenom: string
  nom: string
  nir: string                       // N SS du defunt
  dateNaissance?: string
  dateDeces: string
  etaitRetraite: boolean
  pensionBase?: number              // mensuelle brute
  pensionComplementaire?: number    // mensuelle brute
  regimes: BaseRegime[]
  regimesComplementaires?: ComplementaryRegime[]
  polypensionne: boolean
}

/** Informations sur le conjoint survivant */
export interface SurvivantInfo {
  estRetraite: boolean
  pensionPropre?: number            // mensuelle brute
  ressourcesAnnuelles: number       // revenus hors reversion
  remarie: boolean
  pacse?: boolean                   // perte pour FP
  enfantsACharge: number            // <21 ans
  dateMariage: string               // avec le defunt
}

/** Eligibilite et estimation pour un regime */
export interface ReversionRegime {
  regime: string                    // 'cnav', 'agirc_arrco', 'sre', 'cnracl', etc.
  label: string
  taux: number                      // 50%, 54%, 60%
  conditionRessources: boolean
  conditionAge: boolean
  conditionAgeMin?: number
  conditionMariage: boolean
  conditionMariageDureeMin?: number // annees
  eligible: boolean
  motifIneligibilite?: string
  montantEstime: { min: number; max: number }
  retroactiviteMois: number         // mois de retroactivite possibles
  retroactiviteIllimitee: boolean   // FP
  canal: string                     // 'info-retraite.fr', 'agirc-arrco.fr', etc.
  status: 'todo' | 'sent' | 'waiting' | 'granted' | 'refused' | 'contested'
}

/** Resultat complet de l'analyse reversion */
export interface ReversionResult {
  eligibleGlobal: boolean
  regimes: ReversionRegime[]
  totalEstimeMensuel: { min: number; max: number }
  retroactiviteTotale: { min: number; max: number }
  alerteRemariage: boolean
  alerteRetroactivite: boolean      // si deces > 12 mois
  moisDepuisDeces: number
}

/** Formulaire complet V2 (3 blocs / 16 questions) */
export interface DossierFormulaire {
  identite: FormIdentite
  enfants: FormEnfants
  carriere: FormCarriere
}

// ─────────────────────────────────────────────
// 5. Extraction — Données extraites des documents
// ─────────────────────────────────────────────

/** Niveau de l'extraction pipeline */
export type ExtractionMethod = 'pdf_parse' | 'regex' | 'claude_text' | 'claude_vision'

/** Score de confiance extraction */
export type ExtractionConfidence = 'high' | 'medium' | 'low'

/** Trimestre extrait du RIS */
export interface TrimestreRIS {
  annee: number
  regime: string               // code régime tel qu'il apparaît sur le RIS
  trimestresValides: number    // 0-4
  trimestresCotises: number    // 0-4
  trimestresAssimiles: number  // 0-4 (chômage, maladie…)
  salaire?: number             // salaire reporté (si disponible)
  plafonne?: boolean           // salaire plafonné au PASS
}

/** Données extraites du RIS */
export interface ExtractionRIS {
  trimestres: TrimestreRIS[]
  totalTrimestresValides: number
  totalTrimestresCotises: number
  regimesPresents: string[]
  premiereAnnee: number
  derniereAnnee: number
}

/** Données extraites de la notification CNAV */
export interface ExtractionNotificationCNAV {
  montantMensuelBrut: number
  montantMensuelNet: number
  sam: number                  // Salaire Annuel Moyen
  taux: number                 // % (ex: 50, 37.5)
  trimestresRetenus: number    // trimestres retenus au régime
  trimestresRequis: number     // trimestres requis pour cette génération
  proratisation: number        // ratio trimRetenus/trimRequis
  majorationEnfants: boolean
  majorationEnfantsMontant?: number
  decote: boolean
  decoteTrimestres?: number
  surcote: boolean
  surcoteTrimestres?: number
  minimumContributif: boolean
  dateEffet: string            // date d'effet de la pension
  tauxCSG?: number
}

/** Données extraites du relevé Agirc-Arrco */
export interface ExtractionAgircArrco {
  totalPoints: number
  pointsParAnnee: Array<{
    annee: number
    points: number
    type: 'cotises' | 'gratuits' | 'gmp'
  }>
  valeurPoint: number          // valeur de service utilisée
  pensionAnnuelle: number
  majorationEnfants: boolean
  majorationEnfantsMontant?: number
  malus: boolean
  malusDateFin?: string
  // Points pré-fusion
  pointsArrcoTotal?: number
  pointsAgircTotal?: number
}

/** Données extraites de l'avis d'imposition */
export interface ExtractionAvisImposition {
  annee: number                // année de revenus (N-1)
  rfr: number                  // Revenu Fiscal de Référence
  nombreParts: number          // nb de parts fiscales
  impotNet: number
  revenuDeclarePensions?: number
  creditImpotEmploiDomicile?: number
}

/** Données extraites du relevé de mensualités */
export interface ExtractionMensualites {
  mois: Array<{
    date: string               // YYYY-MM
    montantBrut: number
    montantNet: number
    tauxCSG: number            // % appliqué
    prelevementsSociaux: number
  }>
}

/** Conteneur global d'extraction pour un dossier */
export interface DossierExtractions {
  ris?: ExtractionRIS
  notificationCnav?: ExtractionNotificationCNAV
  agircArrco?: ExtractionAgircArrco
  avisImposition?: ExtractionAvisImposition
  avisImpositionN1?: ExtractionAvisImposition  // année N-1 (pour CSG variation)
  mensualites?: ExtractionMensualites
  // Métadonnées d'extraction
  extractionMethods: Record<DocumentType, ExtractionMethod>
  extractionConfidences: Record<DocumentType, ExtractionConfidence>
  notificationFP?: ExtractionNotificationFP
  notificationMSA?: Record<string, unknown>
  releveCNAVPL?: Record<string, unknown>
  releveRAFP?: Record<string, unknown>
  releveIrcantec?: Record<string, unknown>
  releveRCI?: Record<string, unknown>
}

// ─────────────────────────────────────────────
// 6. Moteur de calcul — Résultats
// ─────────────────────────────────────────────

/** Niveau de confiance d'une valeur calculée */
export type ConfidenceLevel = 'CERTAIN' | 'HAUTE_CONFIANCE' | 'ESTIMATION'

/** Valeur avec son niveau de confiance */
export interface ValueWithConfidence<T = number> {
  value: T
  confidence: ConfidenceLevel
  source: string               // ex: "Recalculé à partir du RIS + coefficients revalorisation"
}

/** Résultat du calcul CNAV */
export interface CalculCNAV {
  sam: ValueWithConfidence                // SAM recalculé
  samNotification?: number                // SAM de la notification (pour comparaison)
  meilleuresAnnees: Array<{ annee: number; salaire: number; salaireRevalorise: number }>
  taux: ValueWithConfidence               // taux de liquidation
  tauxNotification?: number
  trimestresRetenus: ValueWithConfidence<number>
  trimestresRequis: number
  proratisation: ValueWithConfidence
  pensionBruteAnnuelle: ValueWithConfidence
  pensionBruteMensuelle: ValueWithConfidence
  decote?: { trimestres: number; impact: number }
  surcote?: { trimestres: number; impact: number }
  majorationEnfants?: { applicable: boolean; montant: number }
  minimumContributif?: { eligible: boolean; type: 'simple' | 'majore'; montant: number }
}

/** Résultat du calcul Agirc-Arrco */
export interface CalculAgircArrco {
  totalPoints: ValueWithConfidence
  valeurPoint: number
  pensionAnnuelle: ValueWithConfidence
  pensionMensuelle: ValueWithConfidence
  majorationEnfants?: { applicable: boolean; montant: number }
  malus?: { actif: boolean; dateFin?: string; impact: number }
  // Vérification GMP
  gmpVerification?: { anneesConcernees: number[]; pointsManquants: number }
  // Vérification fusion 2019
  fusionVerification?: { ecart: number; confiance: ConfidenceLevel }
}

/** Résultat du calcul CSG */
export interface CalculCSG {
  rfr: number
  nombreParts: number
  tauxTheorique: number        // taux CSG qu'on devrait avoir
  tauxApplique?: number        // taux réellement appliqué (si relevé mensualités)
  ecart?: number               // différence
  impactMensuel?: number
}

/** Résultat du calcul Fonctionnaires (SRE ou CNRACL) */
export interface CalculFP {
  regime: 'sre' | 'cnracl'
  indiceMajore: ValueWithConfidence<number>
  traitementIndiciaireBrut: ValueWithConfidence
  tauxLiquidation: ValueWithConfidence         // 75% max
  trimestresServices: ValueWithConfidence<number>
  trimestresRequis: number
  bonifications?: { type: string; trimestres: number }[]
  proratisation: ValueWithConfidence
  pensionBruteAnnuelle: ValueWithConfidence
  pensionBruteMensuelle: ValueWithConfidence
  decote?: { trimestres: number; impact: number }
  surcote?: { trimestres: number; impact: number }
  majorationEnfants?: { applicable: boolean; montant: number }
  minimumGaranti?: { eligible: boolean; montant: number }
  nbi?: ValueWithConfidence<number>             // Nouvelle Bonification Indiciaire
}

/** Résultat du calcul MSA Exploitants */
export interface CalculMSAExploitant {
  forfaitaire: {
    montantAnnuel: ValueWithConfidence
    trimestresExploitant: number
    trimestresRequis: number
    proratisation: number
  }
  proportionnelle: {
    totalPoints: ValueWithConfidence<number>
    valeurPoint: number
    montantAnnuel: ValueWithConfidence
  }
  pensionTotaleBrute: ValueWithConfidence       // forfaitaire + proportionnelle
  pensionMensuelle: ValueWithConfidence
  chassaigne?: {
    eligible: boolean
    montantAvant: number
    montantApres: number
    complement: number
  }
  majorationEnfants?: { applicable: boolean; montant: number }
}

/** Résultat du calcul CNAVPL (base libéraux) */
export interface CalculCNAVPL {
  totalPoints: ValueWithConfidence<number>
  valeurPoint: number
  pensionBruteAnnuelle: ValueWithConfidence
  pensionBruteMensuelle: ValueWithConfidence
  decote?: { trimestres: number; impact: number }
  surcote?: { trimestres: number; impact: number }
  majorationEnfants?: { applicable: boolean; montant: number }
  section?: string                               // CIPAV, CARMF, etc.
}

/** Résultat du calcul régimes complémentaires (RAFP, Ircantec, RCI) */
export interface CalculComplementaire {
  regime: ComplementaryRegime
  totalPoints: ValueWithConfidence<number>
  valeurPoint: number
  pensionAnnuelle: ValueWithConfidence
  pensionMensuelle: ValueWithConfidence
  majorationEnfants?: { applicable: boolean; montant: number }
  versementCapital?: boolean                     // RAFP si < seuil
}

/** Données extraites d'un titre de pension FP (SRE/CNRACL) */
export interface ExtractionNotificationFP {
  regime: 'sre' | 'cnracl'
  nom?: string
  prenom?: string
  indiceMajore?: number
  traitementIndiciaireBrut?: number
  tauxLiquidation?: number
  trimestresServices?: number
  trimestresRequis?: number
  bonifications?: { type: string; trimestres: number }[]
  pensionBruteMensuelle?: number
  pensionBruteAnnuelle?: number
  dateEffet?: string
  nbi?: number
  montantRAFP?: number
}

/** Résultat complet du moteur de calcul */
export interface CalculResult {
  cnav?: CalculCNAV
  fonctionnaires?: CalculFP
  agircArrco?: CalculAgircArrco
  msaExploitant?: CalculMSAExploitant
  cnavpl?: CalculCNAVPL
  complementaires?: CalculComplementaire[]       // RAFP, Ircantec, RCI
  csg?: CalculCSG
  // Totaux
  pensionTotalRecalculee?: ValueWithConfidence
  pensionTotalNotification?: number
  ecartTotal?: ValueWithConfidence
  // Précision de l'audit (0-100%)
  precisionAudit: number
  // Documents utilisés
  documentsUtilises: DocumentType[]
}

// ─────────────────────────────────────────────
// 7. Anomalies
// ─────────────────────────────────────────────

/** Niveau d'anomalie (1-6) */
export type AnomalyLevel = 1 | 2 | 3 | 4 | 5 | 6

/** Catégorie d'anomalie */
export type AnomalyCategory = 'erreur' | 'oubli' | 'opportunite'

/** Facilité de correction */
export type CorrectionDifficulty = 'simple' | 'moyen' | 'complexe'

/** Fréquence estimée */
export type AnomalyFrequency = 'tres_frequent' | 'frequent' | 'occasionnel' | 'rare'

/** Identifiants de toutes les anomalies du catalogue */
export type AnomalyId =
  // N1 — Retraite de base (18)
  | 'N1_TRIM_COTISES_MANQUANTS'
  | 'N1_TRIM_MILITAIRE'
  | 'N1_TRIM_ENFANTS'
  | 'N1_TRIM_CHOMAGE'
  | 'N1_TRIM_MALADIE'
  | 'N1_TRIM_AVPF'
  | 'N1_TRIM_CHOMAGE_NON_INDEMNISE'
  | 'N1_TRIM_APPRENTISSAGE'
  | 'N1_TRIM_ETRANGER'
  | 'N1_SAM_INCORRECT'
  | 'N1_TAUX_INCORRECT'
  | 'N1_SURCOTE_ABSENTE'
  | 'N1_DECOTE_EXCESSIVE'
  | 'N1_MAJORATION_ENFANTS_ABSENTE'
  | 'N1_MINIMUM_CONTRIBUTIF'
  | 'N1_PRORATISATION_INCORRECTE'
  | 'N1_FP_TRAITEMENT_INCORRECT'
  | 'N1_FP_BONIFICATION_MANQUANTE'
  | 'N1_FP_MINIMUM_GARANTI'
  | 'N1_MSA_REVALORISATION'
  | 'N1_SSI_MIGRATION'
  | 'N1_JOBS_ETE'
  // N2 — Complémentaire (9)
  | 'N2_POINTS_MANQUANTS'
  | 'N2_POINTS_GRATUITS'
  | 'N2_MAJORATION_AA'
  | 'N2_MALUS_NON_LEVE'
  | 'N2_FUSION_2019'
  | 'N2_GMP'
  | 'N2_RAFP_MANQUANT'
  | 'N2_IRCANTEC_OUBLIE'
  | 'N2_RCI_CONVERSION'
  // N3 — Réversion (3)
  | 'N3_REVERSION_NON_DEMANDEE'
  | 'N3_REVERSION_COMPLEMENTAIRE_OUBLIEE'
  | 'N3_REVERSION_MONTANT_INCORRECT'
  // N4 — Aides (5)
  | 'N4_ASPA'
  | 'N4_CSS'
  | 'N4_APL'
  | 'N4_EXONERATION_TF'
  | 'N4_MAPRIME_ADAPT'
  // N5 — Fiscal (4)
  | 'N5_DEMI_PART_ANCIEN_COMBATTANT'
  | 'N5_DEMI_PART_INVALIDITE'
  | 'N5_DEMI_PART_PARENT_ISOLE'
  | 'N5_CREDIT_IMPOT_EMPLOI_DOMICILE'
  // N6 — CSG (2)
  | 'N6_CSG_TROP_ELEVEE'
  | 'N6_CSG_POST_VARIATION'
  // Pré-retraité (4)
  | 'NP_RACHAT_TRIMESTRES'
  | 'NP_DATE_DEPART_SUBOPTIMALE'
  | 'NP_CUMUL_EMPLOI_RETRAITE'
  | 'NP_CARRIERE_LONGUE'

/** Définition statique d'une anomalie (catalogue) */
export interface AnomalyDefinition {
  id: AnomalyId
  niveau: AnomalyLevel
  categorie: AnomalyCategory
  label: string
  description: string
  regimesConcernes: Regime[]
  donneesNecessaires: string[]
  impactTypique: { min: number; max: number }  // €/mois
  confianceParDefaut: ConfidenceLevel
  faciliteCorrection: CorrectionDifficulty
  frequenceEstimee: AnomalyFrequency
  organisme: string
  delaiEstime: string
  crossSell?: 'mataxe' | 'monimpot' | 'mesdroits' | 'mabanque'
}

/** Anomalie détectée dans un dossier */
export interface DetectedAnomaly {
  id: AnomalyId
  niveau: AnomalyLevel
  categorie: AnomalyCategory
  label: string
  description: string
  detail: string               // texte personnalisé avec les chiffres du client
  confiance: ConfidenceLevel
  source: string               // "RIS + formulaire", "notification + recalcul"…
  impactMensuel: { min: number; max: number }
  impactPasse?: number         // € depuis le départ
  impactFutur?: { min: number; max: number }  // € sur le reste de la retraite
  organisme: string
  faciliteCorrection: CorrectionDifficulty
  delaiEstime: string
  score: number                // 0-100, pour le tri
  // Statut du suivi (post-49€)
  statut?: AnomalyTrackingStatus
  crossSell?: string
}

/** Score global du dossier */
export type DossierScore = 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE'

/** Résultat du diagnostic complet */
export interface DiagnosticResult {
  anomalies: DetectedAnomaly[]
  scoreGlobal: DossierScore
  impactMensuelTotal: { min: number; max: number }
  impactCumulePasseTotal: number
  impactCumuleFuturTotal: { min: number; max: number }
  nbParNiveau: Record<AnomalyLevel, number>
  precisionAudit: number       // 0-100%
  seuilGratuit: boolean        // true si impact total < 30€/mois
  documentsUtilises: DocumentType[]
  dateGeneration: string
}

// ─────────────────────────────────────────────
// 8. Suivi des démarches
// ─────────────────────────────────────────────

/** Étapes d'escalade */
export type EscaladeStep =
  | 'message_en_ligne'     // Étape 1 : copier-coller le message
  | 'relance'              // Étape 2 : relance après 2 mois
  | 'lrar'                 // Étape 3 : LRAR si pas de réponse
  | 'cra'                  // Étape 4 : saisine CRA
  | 'mediateur'            // Étape 5 : saisine médiateur
  | 'tribunal'             // Étape 6 : tribunal (pack 29€)

/** Statut d'une anomalie dans le suivi */
export type AnomalyTrackingStatus =
  | 'a_traiter'            // Pas encore commencé
  | 'message_envoye'       // Message copié-collé / envoyé
  | 'en_attente_reponse'   // En attente de réponse de l'organisme
  | 'reponse_recue'        // Réponse reçue
  | 'corrige'              // Anomalie corrigée ✅
  | 'refuse'               // Refus de l'organisme → escalade
  | 'escalade'             // En cours d'escalade
  | 'non_anomalie'         // Le client a marqué "pas d'erreur"
  | 'abandonne'            // Le client a abandonné cette démarche

/** Suivi d'une démarche pour une anomalie */
export interface DemarcheTracking {
  anomalyId: AnomalyId
  etapeActuelle: EscaladeStep
  statut: AnomalyTrackingStatus
  historique: Array<{
    etape: EscaladeStep
    date: string
    action: string              // "Message envoyé", "LRAR postée"…
    note?: string
  }>
  prochainRappel?: string       // ISO date
  montantRecupere?: number
}

// ─────────────────────────────────────────────
// 9. Proche aidant
// ─────────────────────────────────────────────

export interface ProcheAidant {
  email: string
  nom?: string
  lien: string                  // "fils", "fille", "conjoint", "autre"
  magicToken: string
  createdAt: string
  lastAccessAt?: string
  permissions: {
    voirDossier: boolean        // toujours true
    uploader: boolean           // toujours true
    remplirFormulaire: boolean  // toujours true
    payer: boolean              // toujours true
    signerCourriers: boolean    // toujours false
  }
}

// ─────────────────────────────────────────────
// 10. Messages et courriers
// ─────────────────────────────────────────────

/** Catégorie de template de message */
export type MessageCategory =
  | 'correction_carriere'       // A
  | 'reclamation_pension'       // B
  | 'majoration_enfants'        // C
  | 'points_complementaire'     // D
  | 'saisine_cra'               // E
  | 'saisine_mediateur'         // F
  | 'demande_reversion'         // G
  | 'demande_document'          // H
  | 'devis_rachat'              // I
  | 'csg_incorrecte'            // J

/** Canal d'envoi */
export type MessageChannel = 'messagerie_en_ligne' | 'lrar' | 'email'

/** Message généré pour le client */
export interface GeneratedMessage {
  anomalyId: AnomalyId
  category: MessageCategory
  channel: MessageChannel
  organisme: string
  destinataire: string          // adresse ou URL messagerie
  objet: string
  corps: string                 // texte du message avec variables remplacées
  guideEnvoi: string            // "Où envoyer ?" instructions
  referencesJuridiques?: string[]
}

// ─────────────────────────────────────────────
// 11. Paiements
// ─────────────────────────────────────────────

/** Produit Stripe RETRAITIA */
export type RetraitiaPack =
  | 'dossier_9'           // Pack Dossier 9€
  | 'action_49'           // Pack Action 49€ (ou 40€ si 9€ payés)
  | 'couple_79'           // Pack Couple 79€ (ou 70€ si 9€ payés)
  | 'preretraite_39'      // Pack Pré-retraité 39€ (ou 30€ si 9€ payés)
  | 'lrar_15'             // LRAR supplémentaire 14,90€
  | 'tribunal_29'         // Pack Tribunal 29€

export interface PaymentRecord {
  pack: RetraitiaPack
  amount: number               // centimes
  stripeSessionId: string
  stripePaymentIntentId?: string
  paidAt: string
  deducted9: boolean           // true si 9€ déduits
}

// ─────────────────────────────────────────────
// 12. Rapport PDF
// ─────────────────────────────────────────────

/** Variante de rapport */
export type ReportVariant = 'retraite' | 'preretraite' | 'reversion' | 'couple'

/** Métadonnées du rapport généré */
export interface ReportMetadata {
  variant: ReportVariant
  generatedAt: string
  version: number              // incrémenté si régénéré
  pdfUrl: string
  sections: string[]           // sections incluses
  scoreGlobal: DossierScore
  nbAnomalies: number
  impactTotal: { min: number; max: number }
}


// ─────────────────────────────────────────────
// COMPATIBILITÉ V1 — À supprimer après migration
// ─────────────────────────────────────────────
// Ces types maintiennent la compilation du code V1
// pendant la migration vers V2.

/** @deprecated Utiliser BaseRegime | ComplementaryRegime */
export type RetirementRegime = BaseRegime | ComplementaryRegime | SpecialRegime

/** @deprecated Utiliser DossierFormulaire. Structure flat V1 pour compatibilité. */
export interface RetraitiaFormData {
  birthDate: string
  sex: Sex
  childrenCount: number
  status: RetirementStatus
  regimes: RetirementRegime[]
  totalTrimesters: number
  cotisedTrimesters: number
  careerStartAge: number
  militaryService: 'yes' | 'no'
  militaryDuration?: number
  militaryReported?: 'yes' | 'no' | 'unknown'
  unemploymentPeriods: 'yes' | 'no'
  unemploymentDuration?: number
  maternityOrSickness: 'yes' | 'no'
  maternityCount?: number
  basePension?: number
  complementaryPension?: number
  retirementDate?: string
  hasChildrenBonus: 'yes' | 'no' | 'unknown'
  hasDecote: 'yes' | 'no' | 'unknown'
  estimatedBasePension?: number
  estimatedComplementaryPension?: number
  plannedRetirementDate?: string
  hasRIS: boolean
  hasEIG: boolean
  hasAgircArrco: boolean
  email: string
}

/** @deprecated Utiliser DetectedAnomaly */
export type RetraitiaAnomalyType =
  | 'trimestres_manquants' | 'service_militaire' | 'chomage_maladie'
  | 'majoration_enfants' | 'salaires_manquants' | 'points_complementaire'
  | 'decote_erreur' | 'minimum_contributif' | 'optimisation_depart'

/** @deprecated */
export type RetraitiaSeverity = 'confirmed' | 'probable' | 'to_verify'

/** @deprecated */
export type RiskLevel = 'low' | 'medium' | 'high'

/** @deprecated */
export type RetirementStatus = 'retired' | 'active' | 'liquidating'

/** @deprecated Utiliser DetectedAnomaly */
export interface RetraitiaAnomaly {
  type: RetraitiaAnomalyType
  severity: RetraitiaSeverity
  title: string
  summary: string
  detail: string
  impactMonthlyMin: number
  impactMonthlyMax: number
  documentsNeeded: string[]
  legalReference: string
}

/** @deprecated */
export interface RetraitiaCalculations {
  birthYear: number
  trimestresRequis: number
  ageLegal: number
  ageTauxPlein: number
  trimestresManquants: number
  tauxTheorique: number
  decoteParTrimestre: number
  decoteMontant: number
  majorationEnfants: boolean
  majorationMontant: number
  minimumContributifEligible: boolean
  esperanceVieRetraite: number
  pensionTotaleDeclaree: number
}

/** @deprecated */
export interface RetraitiaPreDiagResult {
  anomalies: RetraitiaAnomaly[]
  totalImpactMonthlyMin: number
  totalImpactMonthlyMax: number
  totalImpactLifetime: number
  lifeExpectancyYears: number
  riskLevel: RiskLevel
  recommendation: string
}

/** @deprecated */
export interface RetraitiaPreDiagResponse {
  success: true
  diagnosticId: string
  anomaliesCount: number
  impactMonthlyMin: number
  impactMonthlyMax: number
  impactLifetime: number
  riskLevel: RiskLevel
  anomalies: Array<{
    type: RetraitiaAnomalyType
    severity: RetraitiaSeverity
    title: string
    summary: string
    impactMonthlyMax: number
  }>
  recommendation: string
  calculations: RetraitiaCalculations
}

/** @deprecated */
export interface ErrorResponse {
  success: false
  error: string
  details?: Record<string, string[]>
}
