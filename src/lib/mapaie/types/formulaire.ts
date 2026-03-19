/**
 * RÉCUPÉO — Brique MAPAIE
 * Types formulaire, anomalie et résultat
 * "On va récupérer ce qu'on vous doit."
 */

import type { StatutSalarie, TypeContrat, TempsTravailType, CategorieAnomalie, AnomalieType, SeveriteAnomalie, StatutReclamation } from './base'
import type { ConventionCollective, Classification } from './bulletin'

// ─────────────────────────────────────────────────────────────────────────────
// FORMULAIRE MAPAIE
// ─────────────────────────────────────────────────────────────────────────────

export interface FormulaireMapaie {
  /** Étape courante du wizard (1–5) */
  etape: 1 | 2 | 3 | 4 | 5

  // — Étape 1 : Profil salarié
  profil: {
    prenom: string
    nom: string
    email: string
    telephone?: string
    dateNaissance?: string
    numeroSS?: string
  }

  // — Étape 2 : Contrat & employeur
  contrat: {
    typeContrat: TypeContrat
    statut: StatutSalarie
    tempsTravail: TempsTravailType
    heuresContractuelles: number
    dateEntree: string
    /** Date de sortie si contrat terminé */
    dateSortie?: string
    nomEmployeur: string
    siret?: string
    conventionCollective?: ConventionCollective
    classification?: Classification
  }

  // — Étape 3 : Rémunération déclarée
  remuneration: {
    salaireBrutMensuel: number
    tauxHoraire?: number
    /** Nombre de bulletins à analyser (1–36) */
    nombreBulletins: number
    /** Période couverte : mois de début (YYYY-MM) */
    periodeDebut: string
    /** Période couverte : mois de fin (YYYY-MM) */
    periodeFin: string
    primes: PrimeDéclarée[]
    heuresSupplementairesDeclarees?: HeuresSupDeclarees[]
  }

  // — Étape 4 : Documents uploadés
  documents: DocumentUploade[]

  // — Étape 5 : Offre choisie
  offre: 'AUDIT_3_MOIS' | 'AUDIT_12_MOIS' | null
}

export interface PrimeDéclarée {
  libelle: string
  montant: number
  periodicite: 'MENSUELLE' | 'TRIMESTRIELLE' | 'ANNUELLE' | 'EXCEPTIONNELLE'
  moisVersement?: string
}

export interface HeuresSupDeclarees {
  mois: string
  nombreHeures: number
  tauxMajoration: number
  montantPaye: number
}

export interface DocumentUploade {
  id: string
  nom: string
  type: 'BULLETIN_PAIE' | 'CONTRAT_TRAVAIL' | 'AVENANT' | 'AUTRE'
  mois?: string
  url: string
  taille: number
  statut: 'EN_ATTENTE' | 'ANALYSE' | 'TRAITE' | 'ERREUR'
}

// ─────────────────────────────────────────────────────────────────────────────
// ANOMALIE MAPAIE
// ─────────────────────────────────────────────────────────────────────────────

export interface AnomalieMapaie {
  id: string
  type: AnomalieType
  categorie: CategorieAnomalie
  severite: SeveriteAnomalie

  /** Mois concerné (YYYY-MM) */
  mois: string

  /** Description lisible pour l'utilisateur */
  description: string

  /** Valeur constatée sur le bulletin */
  valeurConstatee: number | string

  /** Valeur attendue selon la loi ou la CC */
  valeurAttendue: number | string

  /** Écart en euros (positif = en faveur du salarié) */
  ecartMontant: number

  /** Référence légale ou conventionnelle */
  referenceLegale: string

  /** Confiance de la détection (0–1) */
  scoreConfiance: number

  /** Détail technique pour le rapport */
  detailTechnique?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉSULTAT DE CALCUL
// ─────────────────────────────────────────────────────────────────────────────

export interface ResultatCalcul {
  /** Identifiant de l'audit */
  auditId: string

  /** Date de calcul */
  dateCalcul: string

  /** Période analysée */
  periodeDebut: string
  periodeFin: string

  /** Nombre de bulletins analysés */
  nombreBulletinsAnalyses: number

  /** Toutes les anomalies détectées */
  anomalies: AnomalieMapaie[]

  /** Synthèse financière */
  synthese: {
    totalRappelBrut: number
    totalRappelNet: number
    totalRappelChargesPatronales: number
    nombreAnomalies: number
    anomaliesCritiques: number
    anomaliesMoyennes: number
    anomaliesMineures: number
  }

  /** Répartition par catégorie */
  repartitionParCategorie: Record<CategorieAnomalie, number>

  /** Probabilité de succès de la réclamation (0–1) */
  probabiliteSucces: number

  /** Recommandation principale */
  recommandation: string

  /** Délai de prescription restant en mois */
  delaiPrescriptionMois: number
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉCLAMATION MAPAIE
// ─────────────────────────────────────────────────────────────────────────────

export interface ReclamationMapaie {
  id: string
  auditId: string
  userId: string

  statut: StatutReclamation

  dateCreation: string
  dateMiseAJour: string
  dateEnvoi?: string
  dateReponseEmployeur?: string

  /** Anomalies retenues pour la réclamation */
  anomaliesRetenues: AnomalieMapaie[]

  /** Montant total réclamé en brut */
  montantReclame: number

  /** Lettre de réclamation générée (HTML) */
  lettreHtml?: string

  /** Lettre de réclamation générée (texte brut) */
  lettreTxt?: string

  /** Pièces jointes recommandées */
  piecesJointes: string[]

  /** Historique des échanges */
  historique: EvenementReclamation[]
}

export interface EvenementReclamation {
  date: string
  type: 'CREATION' | 'ENVOI' | 'REPONSE_EMPLOYEUR' | 'RELANCE' | 'ACCORD' | 'REFUS' | 'SAISINE_CPH' | 'NOTE'
  description: string
  auteur: 'UTILISATEUR' | 'SYSTEME' | 'EMPLOYEUR'
  montantPropose?: number
}
