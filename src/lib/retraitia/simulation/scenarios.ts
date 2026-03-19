// ============================================================
// RETRAITIA V2 — Simulation multi-scénarios de départ
// ============================================================
// Calcule la pension estimée à différents âges de départ
// (62 à 67 ans) en projetant la carrière actuelle.
// Source : BRIEF_PARCOURS_PRERETRAITE.md §10.3
// ============================================================

import type {
  ScenarioDepart, SimulationResult,
  DossierFormulaire, ExtractionRIS, CalculResult,
} from '../types'
import {
  getTrimestresRequis, getAgeLegalMois, calculerSAM,
  AGE_TAUX_PLEIN_AUTO, CONSTANTES,
} from '../data'
import { getValeurPointAA } from '../data'

interface SimulationInput {
  formulaire: DossierFormulaire
  ris?: ExtractionRIS
  calcul?: CalculResult
}

const CNAV = CONSTANTES.cnav

/**
 * Simule la pension à différents âges de départ (62 → 67 ans).
 * Projette la carrière actuelle en supposant que le client continue
 * à cotiser au même rythme.
 */
export function simulerScenarios(input: SimulationInput): SimulationResult {
  const { formulaire, ris, calcul } = input
  const { identite, enfants, carriere } = formulaire

  const birthYear = new Date(identite.dateNaissance).getFullYear()
  const birthMonth = new Date(identite.dateNaissance).getMonth() + 1
  const trimRequis = getTrimestresRequis(birthYear) ?? 170
  const ageLegalMois = getAgeLegalMois(birthYear) ?? (62 * 12 + 9)
  const ageLegalAnnees = Math.ceil(ageLegalMois / 12)

  // Trimestres actuels
  const trimActuels = ris?.totalTrimestresValides ?? 0
  const anneeActuelle = new Date().getFullYear()
  const ageActuel = anneeActuelle - birthYear

  // SAM actuel (si RIS disponible)
  const salaires = ris?.trimestres
    ?.filter(t => t.salaire && t.salaire > 0)
    ?.map(t => ({ annee: t.annee, salaire: t.salaire! })) ?? []

  const samResult = salaires.length > 0 ? calculerSAM(salaires, birthYear) : null

  // Salaire actuel pour projection
  const salaireBrut = carriere.salaireBrutMensuel
    ? carriere.salaireBrutMensuel * 12
    : samResult?.meilleuresAnnees?.[0]?.salaire ?? 30000

  // Points Agirc-Arrco actuels
  const pointsAA = calcul?.agircArrco?.totalPoints?.value ?? 0
  const valeurPointAA = getValeurPointAA(new Date().getFullYear()) ?? 1.4386

  // Taux d'acquisition annuel de points (approximation)
  const pointsParAn = pointsAA > 0 && trimActuels > 0
    ? Math.round(pointsAA / (trimActuels / 4))
    : Math.round(salaireBrut * 0.0787 / 17.4316) // ~taux appelé / prix achat

  // Générer les scénarios de 62 à 67 ans
  const ages = [62, 63, 64, 65, 66, 67].filter(a => a >= ageLegalAnnees)
  const scenarios: ScenarioDepart[] = []

  for (const age of ages) {
    const anneeDepart = birthYear + age
    const anneesRestantes = Math.max(0, anneeDepart - anneeActuelle)

    // Projection trimestres (4 par an si actif)
    const trimProjection = trimActuels + (anneesRestantes * 4)
    const trimTotal = Math.min(trimProjection, trimRequis + 20) // cap raisonnable

    // Projection SAM (ajouter les années futures au même salaire)
    const salairesProjectes = [...salaires]
    for (let a = anneeActuelle; a < anneeDepart; a++) {
      salairesProjectes.push({ annee: a, salaire: salaireBrut })
    }
    const samProjecte = salairesProjectes.length > 0
      ? calculerSAM(salairesProjectes, birthYear)
      : null
    const sam = samProjecte?.sam ?? (samResult?.sam ?? 25000)

    // Taux de liquidation
    const trimManquants = Math.max(0, trimRequis - trimTotal)
    const ageMoisDepart = age * 12 + (birthMonth > 6 ? 12 - birthMonth : 0)
    const trimManquantsAge = Math.max(0, Math.ceil((AGE_TAUX_PLEIN_AUTO - ageMoisDepart) / 3))
    const trimDecote = Math.min(trimManquants, trimManquantsAge, 20)

    let taux = CNAV.taux_plein
    let decotePct = 0
    let surcotePct = 0

    if (trimDecote > 0) {
      decotePct = trimDecote * CNAV.decote_par_trimestre
      taux = CNAV.taux_plein - decotePct
    }

    const trimSupp = trimManquants === 0 ? Math.max(0, trimTotal - trimRequis) : 0
    if (trimSupp > 0) {
      surcotePct = trimSupp * CNAV.surcote_par_trimestre
      taux = CNAV.taux_plein + surcotePct
    }

    // Proratisation
    const trimRetenus = Math.min(trimTotal, trimRequis)
    const prorat = trimRetenus / trimRequis

    // Pension base mensuelle
    const pensionBaseAnnuelle = sam * (taux / 100) * prorat
    let pensionBaseMensuelle = Math.round(pensionBaseAnnuelle / 12 * 100) / 100

    // Majoration enfants (+10% pour 3+)
    if (enfants.nombreEnfants >= 3) {
      pensionBaseMensuelle = Math.round(pensionBaseMensuelle * 1.10 * 100) / 100
    }

    // Complémentaire (projection points AA)
    const pointsProjectes = pointsAA + (pointsParAn * anneesRestantes)
    let pensionComplMensuelle = Math.round(pointsProjectes * valeurPointAA / 12 * 100) / 100

    // Malus Agirc-Arrco si départ pile au taux plein sans surcote
    if (trimManquants === 0 && trimSupp < 4 && age < 67) {
      pensionComplMensuelle = Math.round(pensionComplMensuelle * 0.90 * 100) / 100
    }

    // Majoration complémentaire enfants
    if (enfants.nombreEnfants >= 3) {
      pensionComplMensuelle = Math.round(pensionComplMensuelle * 1.10 * 100) / 100
    }

    const pensionTotale = Math.round((pensionBaseMensuelle + pensionComplMensuelle) * 100) / 100

    scenarios.push({
      age,
      annee: anneeDepart,
      trimestresTotal: trimTotal,
      trimestresRequis: trimRequis,
      trimestresManquants: Math.max(0, trimRequis - trimTotal),
      taux: Math.round(taux * 100) / 100,
      decotePct: Math.round(decotePct * 100) / 100,
      surcotePct: Math.round(surcotePct * 100) / 100,
      pensionBaseMensuelle,
      pensionComplementaireMensuelle: pensionComplMensuelle,
      pensionTotaleMensuelle: pensionTotale,
    })
  }

  // Trouver le scénario recommandé (premier au taux plein)
  const recommande = scenarios.find(s => s.decotePct === 0) ?? scenarios[scenarios.length - 1]
  if (recommande) {
    recommande.recommande = true
    recommande.note = recommande.surcotePct > 0
      ? `Taux plein + ${recommande.surcotePct.toFixed(2)}% de surcote`
      : `Premier âge au taux plein`
  }

  // Âge taux plein
  const ageTauxPlein = recommande?.age ?? 67

  return {
    scenarios,
    scenarioRecommande: recommande,
    trimestresActuels: trimActuels,
    ageTauxPlein,
    anneeTauxPlein: birthYear + ageTauxPlein,
  }
}
