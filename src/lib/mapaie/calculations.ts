import {
  SMIC_HORAIRE_2026,
  SMIC_MENSUEL_2026,
  DUREE_LEGALE_HEBDO,
  DUREE_LEGALE_MENSUELLE,
  MAJORATION_HS_TRANCHE1,
  MAJORATION_HS_TRANCHE2,
  MAJORATION_HS_MINIMUM_CC,
  SEUIL_TRANCHE1_MAX,
  SEUIL_TRANCHE2_MIN,
  PRESCRIPTION_SALAIRE_MOIS,
} from './constants'
import type { ConventionHeureSup } from './types/convention'

export interface HeuresSupResult {
  heuresTranche1: number
  heuresTranche2: number
  montantDuTranche1: number
  montantDuTranche2: number
  montantDuTotal: number
  montantPayeTranche1: number
  montantPayeTranche2: number
  rappel: number
  tauxMajoration1Applique: number
  tauxMajoration2Applique: number
}

export function calculerHeuresSup(
  heuresTravaillees: number,
  tauxHoraire: number,
  montantHsPayeSurBulletin: number,
  convention?: ConventionHeureSup,
): HeuresSupResult {
  const seuil = convention?.seuilDeclenchement ?? DUREE_LEGALE_HEBDO
  const tranche1Max = convention?.tranche1Max ?? SEUIL_TRANCHE1_MAX
  const taux1 = Math.max(convention?.tranche1Majoration ?? MAJORATION_HS_TRANCHE1, MAJORATION_HS_MINIMUM_CC)
  const taux2 = Math.max(convention?.tranche2Majoration ?? MAJORATION_HS_TRANCHE2, MAJORATION_HS_MINIMUM_CC)

  const hsTotal = Math.max(0, heuresTravaillees - seuil)
  const heuresTranche1 = Math.min(hsTotal, tranche1Max - seuil)
  const heuresTranche2 = Math.max(0, hsTotal - heuresTranche1)

  const montantDuTranche1 = round2(heuresTranche1 * tauxHoraire * (1 + taux1))
  const montantDuTranche2 = round2(heuresTranche2 * tauxHoraire * (1 + taux2))
  const montantDuTotal = round2(montantDuTranche1 + montantDuTranche2)
  const rappel = round2(Math.max(0, montantDuTotal - montantHsPayeSurBulletin))

  return {
    heuresTranche1,
    heuresTranche2,
    montantDuTranche1,
    montantDuTranche2,
    montantDuTotal,
    montantPayeTranche1: montantHsPayeSurBulletin > montantDuTranche1 ? montantDuTranche1 : montantHsPayeSurBulletin,
    montantPayeTranche2: Math.max(0, montantHsPayeSurBulletin - montantDuTranche1),
    rappel,
    tauxMajoration1Applique: taux1,
    tauxMajoration2Applique: taux2,
  }
}

export interface MinimumConventionnelResult {
  salaireBrut: number
  minimumApplicable: number
  ecart: number
  estConforme: boolean
  baseReference: 'SMIC' | 'CCN'
}

export function verifierMinimumConventionnel(
  salaireBrutMensuel: number,
  minimumCCN: number | null,
  heuresMensuelles: number = DUREE_LEGALE_MENSUELLE,
): MinimumConventionnelResult {
  const smicProratise = round2((SMIC_HORAIRE_2026 * heuresMensuelles))
  const minimumApplicable = minimumCCN !== null ? Math.max(minimumCCN, smicProratise) : smicProratise
  const baseReference: 'SMIC' | 'CCN' = minimumCCN !== null && minimumCCN > smicProratise ? 'CCN' : 'SMIC'
  const ecart = round2(salaireBrutMensuel - minimumApplicable)

  return {
    salaireBrut: salaireBrutMensuel,
    minimumApplicable,
    ecart,
    estConforme: ecart >= 0,
    baseReference,
  }
}

export interface AncienneteResult {
  annees: number
  mois: number
  primeTheorique: number
  primeBulletin: number
  rappel: number
  tauxApplique: number
}

export function calculerPrimeAnciennete(
  dateEntree: string,
  dateBulletin: string,
  salaireBrut: number,
  primeBulletin: number,
  tauxParAn: number = 0.01,
  seuilDeclenchementAns: number = 3,
): AncienneteResult {
  const entree = new Date(dateEntree)
  const bulletin = new Date(dateBulletin)
  const diffMs = bulletin.getTime() - entree.getTime()
  const totalMois = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375))
  const annees = Math.floor(totalMois / 12)
  const mois = totalMois % 12

  const tauxApplique = annees >= seuilDeclenchementAns ? round2(annees * tauxParAn) : 0
  const primeTheorique = round2(salaireBrut * tauxApplique)
  const rappel = round2(Math.max(0, primeTheorique - primeBulletin))

  return { annees, mois, primeTheorique, primeBulletin, rappel, tauxApplique }
}

export interface RappelSalaireResult {
  montantMensuelMoyen: number
  moisConcernes: number
  montantTotalBrut: number
  montantNetEstime: number
  prescriptionDepuis: string
}

export function calculerRappelSur3Ans(
  montantMensuelMoyen: number,
  dateDebutAnomalie: string,
  dateReference: string = new Date().toISOString(),
): RappelSalaireResult {
  const debut = new Date(dateDebutAnomalie)
  const ref = new Date(dateReference)
  const prescriptionDate = new Date(ref)
  prescriptionDate.setMonth(prescriptionDate.getMonth() - PRESCRIPTION_SALAIRE_MOIS)

  const debutEffectif = debut < prescriptionDate ? prescriptionDate : debut
  const diffMs = ref.getTime() - debutEffectif.getTime()
  const moisConcernes = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375)))

  const montantTotalBrut = round2(montantMensuelMoyen * moisConcernes)
  const montantNetEstime = round2(montantTotalBrut * 0.78)

  return {
    montantMensuelMoyen,
    moisConcernes,
    montantTotalBrut,
    montantNetEstime,
    prescriptionDepuis: prescriptionDate.toISOString().slice(0, 10),
  }
}

export function calculerTauxHoraire(salaireBrutMensuel: number, heuresMensuelles: number = DUREE_LEGALE_MENSUELLE): number {
  if (heuresMensuelles <= 0) return 0
  return round2(salaireBrutMensuel / heuresMensuelles)
}

export function verifierSmicHoraire(tauxHoraire: number): { conforme: boolean; ecart: number } {
  return { conforme: tauxHoraire >= SMIC_HORAIRE_2026, ecart: round2(tauxHoraire - SMIC_HORAIRE_2026) }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}