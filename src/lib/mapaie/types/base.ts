/**
 * RÉCUPÉO — Brique MAPAIE
 * Types de base, enums et constantes
 * "On va récupérer ce qu'on vous doit."
 */

// ─────────────────────────────────────────────────────────────────────────────
// STATUT SALARIÉ
// ─────────────────────────────────────────────────────────────────────────────

export enum StatutSalarie {
  EMPLOYE = 'EMPLOYE',
  OUVRIER = 'OUVRIER',
  TECHNICIEN = 'TECHNICIEN',
  AGENT_MAITRISE = 'AGENT_MAITRISE',
  CADRE = 'CADRE',
  CADRE_DIRIGEANT = 'CADRE_DIRIGEANT',
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DE CONTRAT
// ─────────────────────────────────────────────────────────────────────────────

export enum TypeContrat {
  CDI = 'CDI',
  CDD = 'CDD',
  INTERIM = 'Intérim',
  APPRENTISSAGE = 'Apprentissage',
  PROFESSIONNALISATION = 'Professionnalisation',
  STAGE = 'Stage',
  AUTRE = 'Autre',
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DE DÉPART
// ─────────────────────────────────────────────────────────────────────────────

export enum TypeDepart {
  DEMISSION = 'DEMISSION',
  LICENCIEMENT = 'LICENCIEMENT',
  LICENCIEMENT_ECONOMIQUE = 'LICENCIEMENT_ECONOMIQUE',
  RUPTURE_CONVENTIONNELLE = 'RUPTURE_CONVENTIONNELLE',
  FIN_CDD = 'FIN_CDD',
  RETRAITE = 'RETRAITE',
  DECES = 'DECES',
  PERIODE_ESSAI = 'PERIODE_ESSAI',
  AUTRE = 'AUTRE',
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPS DE TRAVAIL
// ─────────────────────────────────────────────────────────────────────────────

export enum TempsTravailType {
  TRENTE_CINQ_H = '35h',
  TRENTE_NEUF_H = '39h',
  TEMPS_PARTIEL = 'Temps partiel',
  FORFAIT_JOURS = 'Forfait jours',
  AUTRE = 'Autre',
}

// ─────────────────────────────────────────────────────────────────────────────
// ANOMALIES — CATÉGORIES
// ─────────────────────────────────────────────────────────────────────────────

export enum CategorieAnomalie {
  HEURES_TRAVAIL = 'HEURES_TRAVAIL',
  REMUNERATION = 'REMUNERATION',
  PRIMES = 'PRIMES',
  CLASSIFICATION = 'CLASSIFICATION',
  COTISATIONS = 'COTISATIONS',
  CONGES = 'CONGES',
  ANCIENNETE = 'ANCIENNETE',
}

// ─────────────────────────────────────────────────────────────────────────────
// ANOMALIES — TYPES DÉTAILLÉS
// ─────────────────────────────────────────────────────────────────────────────

export enum AnomalieType {
  // Heures supplémentaires
  HEURES_SUP_NON_PAYEES = 'HEURES_SUP_NON_PAYEES',
  MAJORATION_INCORRECTE = 'MAJORATION_INCORRECTE',
  REPOS_COMPENSATEUR_MANQUANT = 'REPOS_COMPENSATEUR_MANQUANT',
  CONTINGENT_HS_DEPASSE = 'CONTINGENT_HS_DEPASSE',

  // Rémunération de base
  TAUX_HORAIRE_INFERIEUR_MINIMUM_CC = 'TAUX_HORAIRE_INFERIEUR_MINIMUM_CC',
  TAUX_HORAIRE_INFERIEUR_SMIC = 'TAUX_HORAIRE_INFERIEUR_SMIC',
  SALAIRE_BASE_INCORRECT = 'SALAIRE_BASE_INCORRECT',

  // Primes
  PRIME_ANCIENNETE_MANQUANTE = 'PRIME_ANCIENNETE_MANQUANTE',
  PRIME_ANCIENNETE_INCORRECTE = 'PRIME_ANCIENNETE_INCORRECTE',
  PRIME_CONVENTIONNELLE_MANQUANTE = 'PRIME_CONVENTIONNELLE_MANQUANTE',
  TREIZIEME_MOIS_MANQUANT = 'TREIZIEME_MOIS_MANQUANT',
  PRIME_VACANCES_MANQUANTE = 'PRIME_VACANCES_MANQUANTE',

  // Classification
  CLASSIFICATION_INCORRECTE = 'CLASSIFICATION_INCORRECTE',
  COEFFICIENT_ERRONE = 'COEFFICIENT_ERRONE',

  // Cotisations
  COTISATION_TAUX_INCORRECT = 'COTISATION_TAUX_INCORRECT',
  COTISATION_ASSIETTE_INCORRECTE = 'COTISATION_ASSIETTE_INCORRECTE',

  // Congés
  CONGES_PAYES_INCORRECTS = 'CONGES_PAYES_INCORRECTS',
  INDEMNITE_CONGES_INCORRECTE = 'INDEMNITE_CONGES_INCORRECTE',

  // Ancienneté
  ANCIENNETE_MAL_CALCULEE = 'ANCIENNETE_MAL_CALCULEE',
  DATE_ENTREE_INCORRECTE = 'DATE_ENTREE_INCORRECTE',
}

// ─────────────────────────────────────────────────────────────────────────────
// SÉVÉRITÉ DES ANOMALIES
// ─────────────────────────────────────────────────────────────────────────────

export enum SeveriteAnomalie {
  CRITIQUE = 'CRITIQUE',   // Impact financier certain, action immédiate
  MAJEURE = 'MAJEURE',     // Impact financier probable, vérification requise
  MINEURE = 'MINEURE',     // Impact faible ou incertain
  INFO = 'INFO',           // Information sans impact direct
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUT D'AUDIT
// ─────────────────────────────────────────────────────────────────────────────

export enum StatutAudit {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ERREUR = 'ERREUR',
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUT DE RÉCLAMATION
// ─────────────────────────────────────────────────────────────────────────────

export enum StatutReclamation {
  BROUILLON = 'BROUILLON',
  ENVOYEE = 'ENVOYEE',
  EN_ATTENTE_REPONSE = 'EN_ATTENTE_REPONSE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  CONTENTIEUX = 'CONTENTIEUX',
  CLASSEE = 'CLASSEE',
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES LÉGALES
// ─────────────────────────────────────────────────────────────────────────────

export const PRESCRIPTION_RAPPEL_SALAIRE_ANNEES = 3 as const
export const CONTINGENT_HS_ANNUEL_DEFAUT = 220 as const
export const MAJORATION_HS_TRANCHE_1 = 0.25 as const  // 25% — 36e à 43e heure
export const MAJORATION_HS_TRANCHE_2 = 0.50 as const  // 50% — à partir de la 44e heure
export const HEURES_LEGALES_HEBDO = 35 as const
export const HEURES_MENSUELLES_LEGALES = 151.67 as const
