/**
 * RÉCUPÉO — Brique MAPAIE
 * Types bulletin de paie, convention collective, salarié
 * "On va récupérer ce qu'on vous doit."
 */

import type {
  StatutSalarie,
  TypeContrat,
  TempsTravailType,
} from './base'

// ─────────────────────────────────────────────────────────────────────────────
// CONVENTION COLLECTIVE
// ─────────────────────────────────────────────────────────────────────────────

export interface ConventionCollective {
  /** Identifiant de convention collective (ex: "1597", "1979") */
  idcc: string
  /** Libellé officiel complet */
  libelle: string
  /** Branche courte pour affichage (ex: "BTP", "HCR", "Métallurgie") */
  branche: string
  /** Taux de majoration HS tranche 1 (36-43h) — défaut 25% */
  majorationHS1?: number
  /** Taux de majoration HS tranche 2 (44h+) — défaut 50% */
  majorationHS2?: number
  /** Contingent annuel HS spécifique CC — défaut 220h */
  contingentHSAnnuel?: number
  /** URL de la fiche Légifrance */
  urlLegifrance?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export interface Classification {
  /** Niveau (ex: "N3", "Niveau II") */
  niveau?: string
  /** Échelon (ex: 1, 2, 3) */
  echelon?: number
  /** Coefficient numérique de la grille CC */
  coefficient?: number
  /** Libellé du poste selon la grille CC */
  libelle: string
  /** Salaire minimum mensuel brut selon la grille CC */
  salaireMinimumCC?: number
  /** Taux horaire minimum selon la grille CC */
  tauxHoraireMinimumCC?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// ANCIENNETÉ
// ─────────────────────────────────────────────────────────────────────────────

export interface Anciennete {
  /** Nombre d'années complètes */
  annees: number
  /** Mois supplémentaires (0-11) */
  mois: number
  /** Date de référence pour le calcul */
  dateReference: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SALARIÉ
// ─────────────────────────────────────────────────────────────────────────────

export interface Salarie {
  nom: string
  prenom: string
  /** Numéro de sécurité sociale (sera anonymisé avant traitement IA) */
  numeroSS?: string
  /** Date d'entrée dans l'entreprise (ISO 8601) */
  dateEntree: string
  anciennete: Anciennete
  classification: Classification
  contrat: TypeContrat | string
  statut?: StatutSalarie
  tempsTravail: TempsTravailType | string
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEUR
// ─────────────────────────────────────────────────────────────────────────────

export interface Employeur {
  nom: string
  siret: string
  conventionCollective: ConventionCollective
  adresse?: string
  codeAPE?: string
  effectif?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGNES DU BULLETIN
// ─────────────────────────────────────────────────────────────────────────────

export interface SalaireBase {
  tauxHoraire: number
  heuresContractuelles: number
  montant: number
  commentaire?: string
}

export interface LigneHeuresSup {
  tranche: 1 | 2
  heures: number
  tauxMajoration: number
  montant: number
  commentaire?: string
}

export interface LignePrime {
  libelle: string
  montant: number
  base?: number
  taux?: number
  commentaire?: string
}

export interface LigneCotisation {
  libelle: string
  base: number
  tauxSalarie: number
  montantSalarie: number
  tauxEmployeur?: number
  montantEmployeur?: number
  commentaire?: string
}

export interface LigneBulletin {
  salaireBase: SalaireBase
  heuresSupplementaires?: LigneHeuresSup[]
  primes?: LignePrime[]
  cotisations?: LigneCotisation[]
  congesPayes?: {
    joursAcquis: number
    joursPris: number
    solde: number
    indemniteMontant?: number
  }
  reposCompensateur?: {
    heuresAcquises: number
    heuresPrises: number
    solde: number
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BULLETIN DE PAIE
// ─────────────────────────────────────────────────────────────────────────────

export interface BulletinMeta {
  /** Format YYYY-MM */
  mois: string
  employeur: Employeur
  salarie: Salarie
}

export interface BulletinRemuneration extends LigneBulletin {
  totalBrutImposable: number
  totalCotisationsSalarie: number
  netAPayer: number
  netImposable?: number
}

export interface BulletinDePaie {
  id: string
  meta: BulletinMeta
  remuneration: BulletinRemuneration
  /** Chemin ou URL du fichier source (PDF/image) */
  fichierSource?: string
  /** Texte brut extrait par OCR */
  texteOCR?: string
  /** Horodatage de création */
  createdAt?: string
}
