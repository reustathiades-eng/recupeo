// ============================================================
// MONIMPÔT V3 Phase 2 — Calcul fiscal complet (131 cases)
// 100% JS côté client, calcul temps réel
// ============================================================

import {
  BAREME_2026, PLAFOND_QF, DECOTE, ABATTEMENT_SENIORS,
  FRAIS_REELS_FORFAIT_TAUX, FRAIS_REELS_MIN, FRAIS_REELS_MAX,
  ABATTEMENT_PENSIONS_TAUX, ABATTEMENT_PENSIONS_MIN, ABATTEMENT_PENSIONS_MAX,
  BAREME_KM, TELETRAVAIL_FORFAIT_JOUR, TELETRAVAIL_PLAFOND_AN,
  REDUCTIONS, PENSION_ALIMENTAIRE_PLAFOND, PER_PLAFOND_PCT, PER_PLAFOND_MIN,
  BORNE_ELECTRIQUE_CREDIT, BORNE_ELECTRIQUE_MAX,
  MINIMUM_RECOUVREMENT,
} from './constants'
import type { FormComplet, ResultatTempsReel } from './form-complet-types'

// ─── RÉSULTAT CALCUL COMPLET ───

export interface FullCalculations {
  // Revenus
  revenuBrutGlobal: number
  revenusSalaires: number
  revenusPensions: number
  revenusFonciers: number
  revenusBIC: number
  revenusBNC: number
  revenusCapitaux: number

  // Déductions
  abattement10pct: number
  fraisReelsEstimes: number
  fraisReelsPlusAvantageux: boolean
  gainFraisReels: number
  chargesDeductibles: number
  abattementSenior: number

  // Imposable
  revenuNetImposable: number
  parts: number

  // Impôt
  impotBrut: number
  decote: number
  reductions: number
  credits: number
  impotNet: number

  // Optimisé
  impotOptimise: number
  economieAnnuelle: number
}

// ─── IMPÔT BARÈME ───

function calculImpotBareme(revenuParPart: number): number {
  let impot = 0
  for (const tranche of BAREME_2026) {
    if (revenuParPart > tranche.min) {
      const base = Math.min(revenuParPart, tranche.max) - tranche.min
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

// ─── DÉCOTE ───

function calculDecote(impotBrut: number, isCouple: boolean): number {
  const maxDecote = isCouple ? DECOTE.couple : DECOTE.seul
  const seuil = Math.round(maxDecote / 0.4525)
  if (impotBrut >= seuil || impotBrut <= 0) return 0
  return Math.max(0, Math.round(maxDecote - impotBrut * 0.4525))
}

// ─── PARTS FISCALES ───

function calculPartsCompletes(data: Partial<FormComplet>): number {
  let parts = 1
  if (data.situation === 'marie_pacse') parts = 2

  const enfMin = data.enfantsMineurs || 0
  const enfGA = data.enfantsGardeAlternee || 0
  const enfMaj = data.enfantsMajeursRattaches || 0
  const enfHand = data.enfantsHandicapes || 0

  // Enfants mineurs (hors garde alternée)
  const enfPlein = enfMin - enfGA
  if (enfPlein >= 1) parts += 0.5
  if (enfPlein >= 2) parts += 0.5
  if (enfPlein >= 3) parts += (enfPlein - 2)

  // Enfants en garde alternée : demi-parts divisées par 2
  if (enfGA >= 1) parts += 0.25
  if (enfGA >= 2) parts += 0.25
  if (enfGA >= 3) parts += (enfGA - 2) * 0.5

  // Enfants majeurs rattachés
  if (enfMaj >= 1) parts += 0.5
  if (enfMaj >= 2) parts += 0.5
  if (enfMaj >= 3) parts += (enfMaj - 2)

  // Enfants handicapés : +0.5 par enfant
  parts += enfHand * 0.5

  // Case T (parent isolé)
  if (data.caseT) parts += 0.5

  // Case L (ancien parent isolé)
  if (data.eleveSeul5ans && !data.caseT && enfMin === 0) parts += 0.5

  // Invalidité
  if (data.invaliditeD1) parts += 0.5
  if (data.invaliditeD2) parts += 0.5

  // Ancien combattant ≥ 75 ans
  if (data.ancienCombattant) parts += 0.5

  // Veuf avec enfant : conserve les 2 parts du couple
  if (data.situation === 'veuf' && enfMin > 0 && parts < 2) parts = 2

  // Personnes invalides à charge
  parts += (data.personnesInvalidesCharge || 0) * 0.5

  return parts
}

// ─── FRAIS RÉELS ESTIMÉS ───

function calculFraisReels(data: Partial<FormComplet>): number {
  let frais = 0

  // Frais km
  if (data.voitureTravail && data.distanceTravail && data.puissanceFiscale) {
    const cv = typeof data.puissanceFiscale === 'string' ? parseInt(data.puissanceFiscale) : data.puissanceFiscale
    const bareme = BAREME_KM[cv] || BAREME_KM[5]
    const joursAn = Math.max(0, (data.joursSurSite || 5) * 47)
    const kmAn = Math.min(data.distanceTravail, 80) * 2 * joursAn

    if (kmAn <= 5000) frais += kmAn * bareme.coeff1
    else if (kmAn <= 20000) frais += kmAn * bareme.coeff2 + bareme.add2
    else frais += kmAn * bareme.coeff3
  }

  // Transport en commun
  if (data.transportEnCommun && data.transportMontantAn) {
    frais += data.transportMontantAn
  }

  // Télétravail
  if (data.teletravail && data.joursTeletravail) {
    const forfait = Math.min(data.joursTeletravail * 47 * TELETRAVAIL_FORFAIT_JOUR, TELETRAVAIL_PLAFOND_AN)
    frais += forfait
  }

  // Repas
  if (data.repasPayes && !data.cantine) {
    const joursSite = data.joursSurSite || 5
    frais += 5.35 * joursSite * 47
  }

  // Frais manuels
  if (data.autresFraisProD1) frais += data.autresFraisProD1

  return Math.round(frais)
}

// ─── REVENUS FONCIERS ───

function calculRevenusFonciers(data: Partial<FormComplet>): number {
  if (!data.proprietaireLocatif || !data.loyersBrutsAn) return 0

  if ((data.loyersBrutsAn || 0) <= 15000) {
    // Micro-foncier : abattement 30%
    return Math.round(data.loyersBrutsAn * 0.7)
  } else {
    // Réel : loyers - charges
    return Math.max(0, data.loyersBrutsAn - (data.chargesLocatives || 0))
  }
}

// ─── REVENUS BIC/BNC ───

function calculRevenusBIC(data: Partial<FormComplet>): number {
  let total = 0
  // Location meublée (micro-BIC : abattement 50%)
  if (data.locationMeublee && data.locationMeubleeCA) {
    total += Math.round(data.locationMeubleeCA * 0.5)
  }
  // Auto-entrepreneur
  if (data.autoEntrepreneur && data.caAutoEntrepreneur && data.typeAutoEntreprise) {
    const abattement = data.typeAutoEntreprise === 'vente' ? 0.71
      : data.typeAutoEntreprise === 'services' ? 0.50
      : 0.34  // libéral
    total += Math.round(data.caAutoEntrepreneur * (1 - abattement))
  }
  return total
}

// ─── CHARGES DÉDUCTIBLES ───

function calculChargesDeductibles(data: Partial<FormComplet>): number {
  let charges = 0

  // Pension alimentaire
  if (data.pensionAlimentaireVersee && data.pensionAlimentaireMontant) {
    charges += Math.min(data.pensionAlimentaireMontant, PENSION_ALIMENTAIRE_PLAFOND)
  }

  // Pension ex-conjoint
  if (data.pensionExConjoint && data.pensionExConjointMontant) {
    charges += data.pensionExConjointMontant
  }

  // Prestation compensatoire
  if (data.prestationCompensatoire) {
    charges += data.prestationCompensatoire
  }

  // PER
  if (data.perVersements && data.perMontant) {
    const revenus = (data.salairesD1 || 0) + (data.pensionRetraiteD1 || 0)
    const plafond = Math.max(Math.round(revenus * PER_PLAFOND_PCT), PER_PLAFOND_MIN)
    charges += Math.min(data.perMontant, plafond)
  }
  if (data.perMontantD2) {
    const revenusD2 = (data.salairesD2 || 0) + (data.pensionRetraiteD2 || 0)
    const plafondD2 = Math.max(Math.round(revenusD2 * PER_PLAFOND_PCT), PER_PLAFOND_MIN)
    charges += Math.min(data.perMontantD2, plafondD2)
  }

  // PERP/Madelin
  if (data.perpMadelin && data.perpMadelinMontant) {
    charges += data.perpMadelinMontant
  }

  // PERCO
  if (data.perco) charges += data.perco

  // CSG déductible
  if (data.csgDeductible) charges += data.csgDeductible

  // Déficits fonciers antérieurs
  if (data.deficitsFonciersAnterieurs) charges += data.deficitsFonciersAnterieurs

  return charges
}

// ─── RÉDUCTIONS D'IMPÔT ───

function calculReductions(data: Partial<FormComplet>): number {
  let reductions = 0

  // Dons intérêt général (66%)
  if (data.donsAssociations && data.donsAssociationsMontant) {
    reductions += Math.round(data.donsAssociationsMontant * 0.66)
  }

  // Dons aide personnes (75%, plafond 1000€)
  if (data.donsAidePersonnes && data.donsAidePersonnesMontant) {
    reductions += Math.round(Math.min(data.donsAidePersonnesMontant, 1000) * 0.75)
  }

  // EHPAD (25%, plafond 10 000€)
  if (data.ehpad && data.ehpadMontant) {
    reductions += Math.round(Math.min(data.ehpadMontant, 10000) * 0.25)
  }

  // PME (25%, plafond 50 000€ / 100 000€ couple)
  if (data.investPME && data.investPMEMontant) {
    const plafond = data.situation === 'marie_pacse' ? 100000 : 50000
    reductions += Math.round(Math.min(data.investPMEMontant, plafond) * 0.25)
  }

  // Pinel
  if (data.pinelActif && data.pinelMontant) {
    reductions += data.pinelMontant
  }

  // Scolarité
  reductions += (data.enfantsCollege || 0) * 61
  reductions += (data.enfantsLycee || 0) * 153
  reductions += (data.enfantsSuperieur || 0) * 183

  // Syndicat (66% — crédit d'impôt art. 199 quater C, traité en réductions ici)
  if (data.cotisationsSyndicales) {
    reductions += Math.round(data.cotisationsSyndicales * 0.66)
  }

  return reductions
}

// ─── CRÉDITS D'IMPÔT ───

function calculCredits(data: Partial<FormComplet>): number {
  let credits = 0

  // Emploi à domicile (50%, plafond 12 000€)
  if (data.emploiDomicile && data.emploiDomicileMontant) {
    let plafond = 12000
    if (data.emploiDomicilePremiereFois) plafond = 15000
    plafond += (data.enfantsMineurs || 0) * 1500
    plafond = Math.min(plafond, 18000)
    credits += Math.round(Math.min(data.emploiDomicileMontant, plafond) * 0.50)
  }

  // Garde enfant (50%, plafond 3 500€/enfant < 6 ans)
  if (data.gardeEnfant && data.gardeEnfantMontant) {
    // Le plafond est par enfant de moins de 6 ans (qui est approx enfantsMineurs pour le formulaire)
    const nbEnfantsGarde = Math.max(data.enfantsMineurs || 1, 1)
    const plafond = REDUCTIONS.gardeEnfant.plafond * nbEnfantsGarde
    credits += Math.round(Math.min(data.gardeEnfantMontant, plafond) * 0.50)
  }

  // Borne électrique (300€/borne, max 2 bornes)
  if (data.borneElectrique) {
    const nbBornes = Math.min(data.borneElectriqueMontant || 1, BORNE_ELECTRIQUE_MAX)
    credits += nbBornes * BORNE_ELECTRIQUE_CREDIT
  }

  // Prêt étudiant (25%, plafond 2 500€)
  if (data.pretEtudiant) {
    credits += Math.round(Math.min(data.pretEtudiant, 2500) * 0.25)
  }

  return credits
}

// ─── ABATTEMENT SENIORS ───

function calculAbattementSenior(age: number, rfr: number, isCouple: boolean, ageD2?: number): number {
  let abattement = 0

  // D1
  if (age >= 65) {
    if (rfr <= ABATTEMENT_SENIORS.seuil1.rfr) abattement += ABATTEMENT_SENIORS.seuil1.abattement
    else if (rfr <= ABATTEMENT_SENIORS.seuil2.rfr) abattement += ABATTEMENT_SENIORS.seuil2.abattement
  }

  // D2 (couple)
  if (isCouple && ageD2 && ageD2 >= 65) {
    if (rfr <= ABATTEMENT_SENIORS.seuil1.rfr) abattement += ABATTEMENT_SENIORS.seuil1.abattement
    else if (rfr <= ABATTEMENT_SENIORS.seuil2.rfr) abattement += ABATTEMENT_SENIORS.seuil2.abattement
  }

  return abattement
}

// ─── CALCUL COMPLET ───

export function computeFullCalculations(data: Partial<FormComplet>): FullCalculations {
  const isC = data.situation === 'marie_pacse'

  // 1. Revenus bruts
  const revenusSalaires = (data.salairesD1 || 0) + (data.salairesD2 || 0)
  const revenusPensions = (data.pensionRetraiteD1 || 0) + (data.pensionRetraiteD2 || 0)
    + (data.pensionInvaliditeD1 || 0) + (data.pensionInvaliditeD2 || 0)
  const revenusFonciers = calculRevenusFonciers(data)
  const revenusBIC = calculRevenusBIC(data)
  const revenusBNC = 0  // Géré dans BIC
  const revenusCapitaux = (data.dividendes || 0) + (data.interets || 0)
  const revenusGerant = data.revenusGerant || 0

  const revenuBrutGlobal = revenusSalaires + revenusPensions + revenusFonciers
    + revenusBIC + revenusBNC + revenusGerant

  // 2. Abattement 10% salaires (plafonné à FRAIS_REELS_MAX) ou frais réels
  const abattement10pctBrut = Math.round(revenusSalaires * FRAIS_REELS_FORFAIT_TAUX)
  const abattement10pct = revenusSalaires > 0
    ? Math.max(Math.min(abattement10pctBrut, FRAIS_REELS_MAX), FRAIS_REELS_MIN)
    : 0
  const fraisReelsEstimes = calculFraisReels(data)
  const fraisReelsPlusAvantageux = fraisReelsEstimes > abattement10pct
  const gainFraisReels = fraisReelsPlusAvantageux ? fraisReelsEstimes - abattement10pct : 0
  const deductionSalaires = fraisReelsPlusAvantageux ? fraisReelsEstimes : abattement10pct

  // Abattement 10% pensions (plafonné min/max)
  const abattementPensionsBrut = Math.round(revenusPensions * ABATTEMENT_PENSIONS_TAUX)
  const abattementPensions = revenusPensions > 0
    ? Math.max(Math.min(abattementPensionsBrut, ABATTEMENT_PENSIONS_MAX), ABATTEMENT_PENSIONS_MIN)
    : 0

  // 3. Charges déductibles
  const chargesDeductibles = calculChargesDeductibles(data)

  // 4. Abattement seniors
  const rniProvisoire = Math.max(0, revenuBrutGlobal - deductionSalaires - abattementPensions - chargesDeductibles)
  const abattementSenior = calculAbattementSenior(
    data.ageDeclarant1 || 35, rniProvisoire, isC, data.ageDeclarant2
  )

  // 5. Revenu net imposable
  const revenuNetImposable = Math.max(0,
    revenuBrutGlobal - deductionSalaires - abattementPensions - chargesDeductibles - abattementSenior
  )

  // 6. Parts fiscales
  const parts = calculPartsCompletes(data)

  // 7. Impôt barème
  const revParPart = revenuNetImposable / parts
  const impotBrut = calculImpotBareme(revParPart) * parts

  // 8. Plafonnement QF
  const impotSansMajoration = calculImpotBareme(revenuNetImposable / (isC ? 2 : 1)) * (isC ? 2 : 1)
  const avantageQF = impotSansMajoration - impotBrut
  const plafondQF = (parts - (isC ? 2 : 1)) * 2 * PLAFOND_QF
  const impotApresPQF = avantageQF > plafondQF
    ? impotSansMajoration - plafondQF
    : impotBrut

  // 9. Décote (appliquée sur l'impôt brut après PQF, AVANT réductions)
  const decote = calculDecote(impotApresPQF, isC)
  const impotApresDecote = Math.max(0, impotApresPQF - decote)

  // 10. Réductions & crédits
  const reductions = calculReductions(data)
  const credits = calculCredits(data)

  // 11. Impôt net (avec minimum de recouvrement)
  const impotAvantMinimum = Math.max(0, impotApresDecote - reductions - credits)
  const impotNet = impotAvantMinimum < MINIMUM_RECOUVREMENT ? 0 : impotAvantMinimum

  // 12. Impôt optimisé
  const impotOptimise = impotNet
  const economieAnnuelle = 0  // Calculé dans le composant vs impotActuel

  return {
    revenuBrutGlobal,
    revenusSalaires,
    revenusPensions,
    revenusFonciers,
    revenusBIC,
    revenusBNC,
    revenusCapitaux,
    abattement10pct,
    fraisReelsEstimes,
    fraisReelsPlusAvantageux,
    gainFraisReels,
    chargesDeductibles,
    abattementSenior,
    revenuNetImposable,
    parts,
    impotBrut: impotApresPQF,
    decote,
    reductions,
    credits,
    impotNet,
    impotOptimise,
    economieAnnuelle,
  }
}

// ─── CALCUL TEMPS RÉEL (pour le composant React) ───

export function computeRealtime(data: Partial<FormComplet>): ResultatTempsReel {
  const calc = computeFullCalculations(data)

  return {
    impotActuel: calc.impotNet,
    impotOptimise: calc.impotOptimise,
    economie: calc.economieAnnuelle,
    optimisationsCount: 0,
    progression: 0,
    etapeActuelle: 1,
  }
}
