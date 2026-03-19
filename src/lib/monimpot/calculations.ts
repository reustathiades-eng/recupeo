// ============================================================
// MONIMPÔT — Calculs fiscaux V1 (JS pur, pas d'IA)
// ============================================================

import {
  BAREME_2026, PLAFOND_QF, DECOTE, ABATTEMENT_SENIORS,
  FRAIS_REELS_FORFAIT_TAUX, FRAIS_REELS_MIN, FRAIS_REELS_MAX,
  BAREME_KM, TELETRAVAIL_FORFAIT_JOUR, TELETRAVAIL_PLAFOND_AN,
  REDUCTIONS, PENSION_ALIMENTAIRE_PLAFOND, PER_PLAFOND_PCT, PER_PLAFOND_MIN,
  MINIMUM_RECOUVREMENT,
} from './constants'
import type { MonimpotFormData } from './types'

// ─── Calcul impôt brut (barème progressif) ───

export function calculImpotBareme(revenuImposableParPart: number): number {
  let impot = 0
  for (const tranche of BAREME_2026) {
    if (revenuImposableParPart > tranche.min) {
      const base = Math.min(revenuImposableParPart, tranche.max) - tranche.min
      impot += base * tranche.taux
    }
  }
  return Math.round(impot)
}

// ─── TMI (Taux Marginal d'Imposition) ───

export function getTMI(revenuParPart: number): number {
  for (let i = BAREME_2026.length - 1; i >= 0; i--) {
    if (revenuParPart > BAREME_2026[i].min) return BAREME_2026[i].taux
  }
  return 0
}

// ─── Décote (réduction pour faibles impôts) ───

export function calculDecote(impotBrut: number, situation: string): number {
  const isCouple = situation === 'marie_pacse'
  const maxDecote = isCouple ? DECOTE.couple : DECOTE.seul
  const seuil = Math.round(maxDecote / 0.4525)
  if (impotBrut >= seuil || impotBrut <= 0) return 0
  return Math.max(0, Math.round(maxDecote - impotBrut * 0.4525))
}

// ─── Impôt net après décote ───

export function calculImpotApresDecote(impotBrut: number, situation: string): number {
  const decote = calculDecote(impotBrut, situation)
  return Math.max(0, impotBrut - decote)
}

// ─── Calcul parts fiscales théoriques ───

export function calculPartsTheoriques(data: MonimpotFormData): number {
  let parts = 1
  if (data.situation === 'marie_pacse') parts = 2

  // Enfants mineurs
  if (data.enfantsMineurs >= 1) parts += 0.5
  if (data.enfantsMineurs >= 2) parts += 0.5
  if (data.enfantsMineurs >= 3) parts += (data.enfantsMineurs - 2)

  // Case T (parent isolé)
  if ((data.situation === 'divorce_separe' || data.situation === 'celibataire' || data.situation === 'veuf') &&
      data.vivezSeul && data.enfantsMineurs > 0) {
    parts += 0.5
  }

  // Case L (ancien parent isolé)
  if (data.eleveSeul5ans && !data.vivezSeul && data.enfantsMineurs === 0) {
    parts += 0.5
  }

  // Invalidité
  if (data.invalidite) parts += 0.5

  return parts
}

// ─── Frais réels kilométriques ───

export function calculFraisReelsKm(distance: number, puissance: number, joursTeletravail: number = 0): number {
  const joursAn = 228 - (joursTeletravail * 47) // ~47 semaines travaillées
  const kmAn = Math.min(distance, 80) * 2 * joursAn  // aller-retour, plafonné 80km

  const bareme = BAREME_KM[puissance] || BAREME_KM[5]

  let montant = 0
  if (kmAn <= 5000) {
    montant = kmAn * bareme.coeff1
  } else if (kmAn <= 20000) {
    montant = kmAn * bareme.coeff2 + bareme.add2
  } else {
    montant = kmAn * bareme.coeff3
  }

  return Math.round(montant)
}

// ─── Frais télétravail ───

export function calculFraisTeletravail(joursParSemaine: number): number {
  const joursAn = joursParSemaine * 47
  return Math.min(Math.round(joursAn * TELETRAVAIL_FORFAIT_JOUR), TELETRAVAIL_PLAFOND_AN)
}

// ─── Abattement seniors ───

export function calculAbattementSenior(age: number, rfr: number): number {
  if (age < 65) return 0
  if (rfr <= ABATTEMENT_SENIORS.seuil1.rfr) return ABATTEMENT_SENIORS.seuil1.abattement
  if (rfr <= ABATTEMENT_SENIORS.seuil2.rfr) return ABATTEMENT_SENIORS.seuil2.abattement
  return 0
}

// ─── Calcul complet ───

export interface MonimpotCalculations {
  // Parts
  partsTheoriques: number
  partsDeclarees: number
  ecartParts: number

  // Frais réels
  fraisReelsEstimes: number
  abattement10pct: number
  fraisReelsPlusAvantageux: boolean
  gainFraisReels: number

  // Déductions
  deductionPensionAn: number
  deductionPER: number
  abattementSenior: number

  // Réductions/crédits
  reductionDons: number
  creditEmploiDomicile: number
  creditGardeEnfant: number
  reductionEhpad: number

  // Impôt
  revenuApresDeductions: number
  impotTheorique: number
  decoteOptimise: number
  totalReductionsCredits: number
  impotOptimise: number
  impotPaye: number
  economieAnnuelle: number
  economie3ans: number
}

export function computeMonimpotCalculations(data: MonimpotFormData): MonimpotCalculations {
  // --- Parts ---
  const partsTheoriques = calculPartsTheoriques(data)
  const ecartParts = partsTheoriques - data.nbParts

  // --- Frais réels ---
  let fraisReelsEstimes = 0
  if (!data.fraisReels && data.distanceTravail && data.distanceTravail > 0 && data.puissanceFiscale) {
    fraisReelsEstimes = calculFraisReelsKm(
      data.distanceTravail,
      data.puissanceFiscale,
      data.teletravail ? (data.joursTeletravail || 0) : 0
    )
    if (data.teletravail && data.joursTeletravail) {
      fraisReelsEstimes += calculFraisTeletravail(data.joursTeletravail)
    }
  }

  const salaireBrut = data.typeRevenus === 'salaires' || data.typeRevenus === 'mixte'
    ? data.revenuNetImposable / (1 - FRAIS_REELS_FORFAIT_TAUX) // Approximation du brut
    : 0
  // Abattement 10% plafonné à FRAIS_REELS_MAX
  const abattement10pctBrut = Math.round(salaireBrut * FRAIS_REELS_FORFAIT_TAUX)
  const abattement10pct = salaireBrut > 0
    ? Math.max(Math.min(abattement10pctBrut, FRAIS_REELS_MAX), FRAIS_REELS_MIN)
    : 0
  const fraisReelsPlusAvantageux = fraisReelsEstimes > abattement10pct
  const gainFraisReels = fraisReelsPlusAvantageux ? fraisReelsEstimes - abattement10pct : 0

  // --- Déductions du revenu ---
  const deductionPensionAn = data.pensionAlimentaire && data.pensionMontantMois
    ? Math.min(data.pensionMontantMois * 12, PENSION_ALIMENTAIRE_PLAFOND)
    : 0

  const perPlafond = Math.max(Math.round(data.revenuNetImposable * PER_PLAFOND_PCT), PER_PLAFOND_MIN)
  const deductionPER = data.per && data.perMontantAn
    ? Math.min(data.perMontantAn, perPlafond)
    : 0

  const abattementSenior = calculAbattementSenior(data.age, data.revenuNetImposable)

  // --- Revenu après déductions ---
  let revenuApresDeductions = data.revenuNetImposable
  if (fraisReelsPlusAvantageux) revenuApresDeductions -= gainFraisReels
  if (deductionPensionAn > 0 && !data.pensionAlimentaire) revenuApresDeductions -= deductionPensionAn
  if (deductionPER > 0 && !data.per) revenuApresDeductions -= deductionPER
  if (abattementSenior > 0) revenuApresDeductions -= abattementSenior
  revenuApresDeductions = Math.max(revenuApresDeductions, 0)

  // --- Impôt théorique avec parts optimisées ---
  const partsOptimales = Math.max(partsTheoriques, data.nbParts)
  const revParPart = revenuApresDeductions / partsOptimales
  const impotBrut = calculImpotBareme(revParPart) * partsOptimales
  const impotTheorique = Math.max(impotBrut, 0)

  // --- Décote (appliquée sur l'impôt brut, AVANT réductions/crédits) ---
  const decoteOptimise = calculDecote(impotTheorique, data.situation)
  const impotApresDecote = Math.max(0, impotTheorique - decoteOptimise)

  // --- Réductions et crédits ---
  const reductionDons = data.dons && data.donsMontantAn
    ? 0  // Déjà déclaré
    : (data.donsMontantAn || 0) > 0 ? Math.round((data.donsMontantAn || 0) * REDUCTIONS.donsIntGeneral.taux) : 0

  const creditEmploiDomicile = data.emploiDomicile && data.emploiDomicileMontantAn
    ? 0  // Déjà déclaré
    : (data.emploiDomicileMontantAn || 0) > 0
      ? Math.round(Math.min(data.emploiDomicileMontantAn || 0, REDUCTIONS.emploiDomicile.plafond) * REDUCTIONS.emploiDomicile.taux)
      : 0

  const creditGardeEnfant = data.gardeEnfant && data.gardeMontantAn
    ? 0  // Déjà déclaré
    : (data.gardeMontantAn || 0) > 0
      ? Math.round(Math.min(data.gardeMontantAn || 0, REDUCTIONS.gardeEnfant.plafond * Math.max(data.enfantsMineurs, 1)) * REDUCTIONS.gardeEnfant.taux)
      : 0

  const reductionEhpad = data.ehpad && data.ehpadMontantAn
    ? 0  // Déjà déclaré
    : (data.ehpadMontantAn || 0) > 0
      ? Math.round(Math.min(data.ehpadMontantAn || 0, REDUCTIONS.ehpad.plafond) * REDUCTIONS.ehpad.taux)
      : 0

  const totalReductionsCredits = reductionDons + creditEmploiDomicile + creditGardeEnfant + reductionEhpad

  // --- Impôt optimisé (après décote, puis réductions/crédits) ---
  const impotAvantMinimum = Math.max(impotApresDecote - totalReductionsCredits, 0)
  const impotOptimise = impotAvantMinimum < MINIMUM_RECOUVREMENT ? 0 : impotAvantMinimum
  const economieAnnuelle = Math.max(data.impotPaye - impotOptimise, 0)
  const economie3ans = economieAnnuelle * 3

  return {
    partsTheoriques,
    partsDeclarees: data.nbParts,
    ecartParts,
    fraisReelsEstimes,
    abattement10pct,
    fraisReelsPlusAvantageux,
    gainFraisReels,
    deductionPensionAn,
    deductionPER,
    abattementSenior,
    reductionDons,
    creditEmploiDomicile,
    creditGardeEnfant,
    reductionEhpad,
    revenuApresDeductions,
    impotTheorique,
    decoteOptimise,
    totalReductionsCredits,
    impotOptimise,
    impotPaye: data.impotPaye,
    economieAnnuelle,
    economie3ans,
  }
}
