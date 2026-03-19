// ============================================================
// MONIMPÔT — Constantes fiscales 2026 (revenus 2025)
// ============================================================

export const BAREME_2026 = [
  { min: 0, max: 11497, taux: 0 },
  { min: 11497, max: 29315, taux: 0.11 },
  { min: 29315, max: 83823, taux: 0.30 },
  { min: 83823, max: 180294, taux: 0.41 },
  { min: 180294, max: Infinity, taux: 0.45 },
]

export const PLAFOND_QF = 1759  // avantage max par demi-part
export const DECOTE = { seul: 917, couple: 1514 }

export const ABATTEMENT_SENIORS = {
  seuil1: { rfr: 17200, abattement: 2746 },
  seuil2: { rfr: 27670, abattement: 1373 },
}

export const FRAIS_REELS_FORFAIT_TAUX = 0.10
export const FRAIS_REELS_MIN = 495
export const FRAIS_REELS_MAX = 14171  // plafond abattement 10% salaires 2026

export const ABATTEMENT_PENSIONS_TAUX = 0.10
export const ABATTEMENT_PENSIONS_MIN = 442
export const ABATTEMENT_PENSIONS_MAX = 4321

// Barème km 2026 (par puissance fiscale)
export const BAREME_KM: Record<number, { coeff1: number; coeff2: number; add2: number; coeff3: number }> = {
  3: { coeff1: 0.529, coeff2: 0.316, add2: 1065, coeff3: 0.370 },
  4: { coeff1: 0.606, coeff2: 0.340, add2: 1330, coeff3: 0.407 },
  5: { coeff1: 0.636, coeff2: 0.357, add2: 1395, coeff3: 0.427 },
  6: { coeff1: 0.665, coeff2: 0.374, add2: 1457, coeff3: 0.447 },
  7: { coeff1: 0.697, coeff2: 0.394, add2: 1515, coeff3: 0.470 },
}

export const TELETRAVAIL_FORFAIT_JOUR = 2.70  // €/jour, plafonné à 603€/an
export const TELETRAVAIL_PLAFOND_AN = 603

export const REDUCTIONS = {
  donsIntGeneral: { taux: 0.66, plafondPctRevenu: 0.20 },
  donsAidePersonnes: { taux: 0.75, plafond: 1000 },
  emploiDomicile: { taux: 0.50, plafond: 12000, majorationEnfant: 1500 },
  gardeEnfant: { taux: 0.50, plafond: 3500 },  // par enfant < 6 ans
  ehpad: { taux: 0.25, plafond: 10000 },
}

export const PENSION_ALIMENTAIRE_PLAFOND = 6674  // par enfant majeur/an
export const PER_PLAFOND_PCT = 0.10  // 10% des revenus
export const PER_PLAFOND_MIN = 4399

// Borne de recharge véhicule électrique
export const BORNE_ELECTRIQUE_CREDIT = 300   // €/borne
export const BORNE_ELECTRIQUE_MAX = 2        // max 2 bornes (1 par logement, couple = 2)

// Minimum de recouvrement
export const MINIMUM_RECOUVREMENT = 61  // impôt < 61€ non recouvré
