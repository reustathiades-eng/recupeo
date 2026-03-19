// ============================================================
// MONCHOMAGE — Calculs ARE (SJR, AJ, durée, dégressivité)
// ============================================================
import { ARE_PARAMS } from './constants'
import type { MonchomageFormData, MonchomageCalculations } from './types'

// ─── Tranche d'âge ───

export function getTrancheAge(age: number): 'moins53' | 'de53a54' | 'plus55' {
  if (age >= 55) return 'plus55'
  if (age >= 53) return 'de53a54'
  return 'moins53'
}

// ─── Période de référence en mois ───

export function getPeriodeRefMois(age: number): number {
  return age >= 55 ? ARE_PARAMS.periodeRefMois.plus55 : ARE_PARAMS.periodeRefMois.moins55
}

// ─── Calcul complet ───

export function computeMonchomageCalculations(data: MonchomageFormData): MonchomageCalculations {
  const trancheAge = getTrancheAge(data.ageFinContrat)
  const periodeRefMois = getPeriodeRefMois(data.ageFinContrat)

  // ─── Étape 1 : Salaire de référence ───
  // Salaire brut mensuel × nombre de mois + primes
  let salaireMensuelPlafonne = Math.min(data.salaireBrutMoyen, ARE_PARAMS.plafondMensuelSR)
  let salaireReference = salaireMensuelPlafonne * periodeRefMois

  // Ajouter les primes si déclarées
  if (data.hasPrimes && data.primesTotal > 0) {
    salaireReference += data.primesTotal
  }

  // ─── Étape 2 : Jours calendaires de la PRC ───
  let joursCalendaires = periodeRefMois * 30 // approximation

  // Neutralisation des périodes maladie/maternité
  // Les jours de maladie sont retirés du dénominateur (neutralisés)
  if (data.hasMaladie && data.maladieDuree > 0) {
    joursCalendaires -= data.maladieDuree
  }

  // Activité partielle : les jours sont neutralisés aussi
  if (data.hasActivitePartielle && data.apDuree > 0) {
    joursCalendaires -= data.apDuree
  }

  // Minimum 1 jour
  joursCalendaires = Math.max(joursCalendaires, 1)

  // ─── Étape 3 : SJR ───
  const sjrTheorique = Math.round((salaireReference / joursCalendaires) * 100) / 100

  // ─── Étape 4 : Allocation journalière ───
  const ajFormule1 = ARE_PARAMS.tauxProportionnel * sjrTheorique + ARE_PARAMS.partieFixe
  const ajFormule2 = ARE_PARAMS.tauxMinimum * sjrTheorique

  let ajTheoriqueBrute = Math.max(ajFormule1, ajFormule2)

  // Plancher
  ajTheoriqueBrute = Math.max(ajTheoriqueBrute, ARE_PARAMS.allocationMinimale)

  // Plafond 75% du SJR
  const plafond75 = ARE_PARAMS.plafondSJR * sjrTheorique
  const ajTheorique = Math.min(ajTheoriqueBrute, plafond75)

  // Plafond absolu
  const ajPlafonnee = Math.min(ajTheorique, ARE_PARAMS.allocationMaximale)

  // ─── Étape 5 : Dégressivité ───
  const degressiviteExemptAge = data.ageFinContrat >= ARE_PARAMS.degressiviteAgeExemption
  const degressiviteApplicable = sjrTheorique > ARE_PARAMS.degressiviteSeuil && !degressiviteExemptAge
  const ajApresDegressivite = degressiviteApplicable
    ? Math.max(ajPlafonnee * ARE_PARAMS.degressiviteCoeff, ARE_PARAMS.allocationMinimale)
    : ajPlafonnee

  // ─── Étape 6 : Prélèvements sociaux ───
  let ajNette = ajPlafonnee
  ajNette -= ajPlafonnee * ARE_PARAMS.cotisationRetraite // retraite complémentaire 3%
  if (ajPlafonnee > ARE_PARAMS.seuilCSG) {
    ajNette -= ajPlafonnee * ARE_PARAMS.CSG    // CSG 6,2%
    ajNette -= ajPlafonnee * ARE_PARAMS.CRDS   // CRDS 0,5%
  }

  // ─── Étape 7 : Durée d'indemnisation ───
  const dureeTheoriqueMax = ARE_PARAMS.dureeMax[trancheAge]

  // ─── Étape 8 : Mensuels ───
  const areMensuelleBrute = ajPlafonnee * ARE_PARAMS.joursParMois
  const areMensuelleNette = ajNette * ARE_PARAMS.joursParMois

  // ─── Écarts avec notification ───
  const ecartAJ = Math.round((ajPlafonnee - data.ajBrute) * 100) / 100
  const ecartMensuel = Math.round(ecartAJ * ARE_PARAMS.joursParMois * 100) / 100
  const ecartTotal = Math.round(ecartAJ * data.dureeIndemnisation * 100) / 100
  const ecartSJR = data.sjrNotification
    ? Math.round((sjrTheorique - data.sjrNotification) * 100) / 100
    : null

  return {
    salaireReference: Math.round(salaireReference * 100) / 100,
    joursCalendaires,
    sjrTheorique,
    ajFormule1: Math.round(ajFormule1 * 100) / 100,
    ajFormule2: Math.round(ajFormule2 * 100) / 100,
    ajTheorique: Math.round(ajPlafonnee * 100) / 100,
    ajTheoriqueBrute: Math.round(ajTheoriqueBrute * 100) / 100,
    ajNette: Math.round(ajNette * 100) / 100,
    dureeTheoriqueMax,
    trancheAge,
    degressiviteApplicable,
    degressiviteExemptAge,
    ajApresDegressivite: Math.round(ajApresDegressivite * 100) / 100,
    areMensuelleBrute: Math.round(areMensuelleBrute * 100) / 100,
    areMensuelleNette: Math.round(areMensuelleNette * 100) / 100,
    ecartAJ,
    ecartMensuel,
    ecartTotal,
    ecartSJR,
  }
}
