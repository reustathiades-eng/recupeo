import type { ConventionCode } from './types/index'
import type { ConventionHeureSup } from './types/convention'

// ─── SMIC 2026 ────────────────────────────────────────────────────────────────
export const SMIC_HORAIRE_2026 = 11.88
export const SMIC_MENSUEL_2026 = 1801.84
export const SMIC_ANNUEL_2026 = Math.round(SMIC_MENSUEL_2026 * 12 * 100) / 100

// ─── PMSS 2026 ────────────────────────────────────────────────────────────────
export const PMSS_2026 = 3925
export const PASS_2026 = PMSS_2026 * 12

// ─── DURÉE LÉGALE DU TRAVAIL ──────────────────────────────────────────────────
export const DUREE_LEGALE_HEBDO = 35
export const DUREE_LEGALE_MENSUELLE = 151.67
export const CONTINGENT_ANNUEL_LEGAL = 220

// ─── MAJORATIONS HEURES SUPPLÉMENTAIRES (art. L.3121-36) ─────────────────────
export const MAJORATION_HS_TRANCHE1 = 0.25
export const MAJORATION_HS_TRANCHE2 = 0.50
export const MAJORATION_HS_MINIMUM_CC = 0.10
export const SEUIL_TRANCHE1_MAX = 43
export const SEUIL_TRANCHE2_MIN = 44

// ─── PRESCRIPTION ─────────────────────────────────────────────────────────────
export const PRESCRIPTION_SALAIRE_ANNEES = 3
export const PRESCRIPTION_SALAIRE_MOIS = 36

// ─── TAUX DE COTISATIONS 2026 ─────────────────────────────────────────────────
export const COTISATIONS = {
  // Maladie — cotisation salariale ramenée à 0% depuis décret 2017-1891 (01/01/2018)
  SECU_MALADIE_SALARIAL: 0,
  SECU_MALADIE_PATRONAL: 0.1300,
  // Vieillesse plafonnée
  VIEILLESSE_PLAFONNEE_SALARIAL: 0.0690,
  VIEILLESSE_PLAFONNEE_PATRONAL: 0.0855,
  // Vieillesse déplafonnée
  VIEILLESSE_DEPLAFONNEE_SALARIAL: 0.0040,
  VIEILLESSE_DEPLAFONNEE_PATRONAL: 0.0190,
  // Allocations familiales
  ALLOC_FAMILIALES_PATRONAL: 0.0525,
  // AT/MP (taux moyen indicatif — variable selon secteur)
  AT_MP_PATRONAL_MOYEN: 0.0230,
  // Chômage
  CHOMAGE_SALARIAL: 0,
  CHOMAGE_PATRONAL: 0.0405,
  // AGS
  AGS_PATRONAL: 0.0015,
  // Retraite complémentaire AGIRC-ARRCO tranche 1
  AGIRC_ARRCO_T1_SALARIAL: 0.0315,
  AGIRC_ARRCO_T1_PATRONAL: 0.0472,
  // Retraite complémentaire AGIRC-ARRCO tranche 2
  AGIRC_ARRCO_T2_SALARIAL: 0.0864,
  AGIRC_ARRCO_T2_PATRONAL: 0.1296,
  // CEG
  CEG_T1_SALARIAL: 0.0086,
  CEG_T1_PATRONAL: 0.0129,
  CEG_T2_SALARIAL: 0.0108,
  CEG_T2_PATRONAL: 0.0162,
  // CSG déductible
  CSG_DEDUCTIBLE: 0.0680,
  // CSG non déductible
  CSG_NON_DEDUCTIBLE: 0.0240,
  // CRDS
  CRDS: 0.0050,
} as const

// ─── RÉDUCTION FILLON 2026 ────────────────────────────────────────────────────
// Coefficients arrêté annuel — à vérifier publication JORF début 2026
export const FILLON_COEFF_MAX_INF50 = 0.3214
export const FILLON_COEFF_MAX_SUP50 = 0.2809
export const FILLON_SEUIL_EFFECTIF = 50

// ─── CONVENTIONS COLLECTIVES — HEURES SUP ────────────────────────────────────
export const CONVENTION_HEURES_SUP: Record<ConventionCode, ConventionHeureSup> = {
  IDCC_2216: {
    seuilDeclenchement: 35,
    tranche1Max: 43,
    tranche1Majoration: 0.25,
    tranche2Majoration: 0.50,
    contingentAnnuel: 220,
    reposCompensateurObligatoire: true,
    seuilReposCompensateur: 220,
    majorationNuit: 0.10,
    majorationDimanche: 0.20,
    majorationJourFerie: 0.50,
  },
  IDCC_1979: {
    seuilDeclenchement: 35,
    tranche1Max: 43,
    tranche1Majoration: 0.25,
    tranche2Majoration: 0.50,
    contingentAnnuel: 220,
    reposCompensateurObligatoire: true,
    seuilReposCompensateur: 220,
    majorationNuit: 0.15,
    majorationDimanche: 0.25,
    majorationJourFerie: 1.00,
  },
  IDCC_1596: {
    seuilDeclenchement: 35,
    tranche1Max: 43,
    tranche1Majoration: 0.25,
    tranche2Majoration: 0.50,
    contingentAnnuel: 180,
    reposCompensateurObligatoire: true,
    seuilReposCompensateur: 180,
    majorationNuit: 0.25,
    majorationDimanche: 0.25,
    majorationJourFerie: 1.00,
  },
  IDCC_3248: {
    seuilDeclenchement: 35,
    tranche1Max: 43,
    tranche1Majoration: 0.25,
    tranche2Majoration: 0.50,
    contingentAnnuel: 220,
    reposCompensateurObligatoire: true,
    seuilReposCompensateur: 220,
    majorationNuit: 0.15,
    majorationDimanche: 0.20,
    majorationJourFerie: 0.50,
  },
  IDCC_0573: {
    seuilDeclenchement: 35,
    tranche1Max: 43,
    tranche1Majoration: 0.25,
    tranche2Majoration: 0.50,
    contingentAnnuel: 220,
    reposCompensateurObligatoire: true,
    seuilReposCompensateur: 220,
    majorationNuit: 0.10,
    majorationDimanche: 0.20,
    majorationJourFerie: 0.50,
  },
  AUTRE: {
    seuilDeclenchement: 35,
    tranche1Max: 43,
    tranche1Majoration: 0.25,
    tranche2Majoration: 0.50,
    contingentAnnuel: 220,
    reposCompensateurObligatoire: true,
    seuilReposCompensateur: 220,
  },
} as const

export const CONVENTION_CODES = [
  'IDCC_2216',
  'IDCC_1979',
  'IDCC_1596',
  'IDCC_3248',
  'IDCC_0573',
  'AUTRE',
] as const satisfies readonly ConventionCode[]