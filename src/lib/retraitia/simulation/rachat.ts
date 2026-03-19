// ============================================================
// RETRAITIA V2 — Analyse rachat de trimestres + ROI
// ============================================================
// 2 options : "taux seul" et "taux + durée"
// Calcul du coût estimé, gain mensuel, temps de retour.
// Source : BRIEF_PARCOURS_PRERETRAITE.md §10.4
// ============================================================

import type {
  ScenarioRachat, RachatResult,
  DossierFormulaire, ExtractionRIS, SimulationResult,
} from '../types'
import { getTrimestresRequis, getEsperanceVie, CONSTANTES } from '../data'

interface RachatInput {
  formulaire: DossierFormulaire
  ris?: ExtractionRIS
  simulation: SimulationResult
}

const MAX_RACHAT_ETUDES = 12 // trimestres max rachetables pour études

/**
 * Barème simplifié du coût de rachat d'un trimestre (2025).
 * Le coût réel dépend de l'âge, du revenu et de l'option.
 * Source : barème officiel CNAV, grille indicative.
 */
function estimerCoutTrimestre(
  age: number,
  salaireBrutAnnuel: number,
  option: 'taux' | 'taux_duree'
): number {
  // Grille simplifiée : le coût augmente avec l'âge et le salaire.
  // On prend une approximation médiane par tranche.
  const baseTaux = Math.min(salaireBrutAnnuel, 46368) * 0.068 // ~6.8% du salaire plafonné
  const baseTauxDuree = baseTaux * 1.75 // taux+durée ~75% plus cher

  // Correction par âge (plus cher quand on est vieux)
  const coefAge = 1 + Math.max(0, age - 50) * 0.025

  if (option === 'taux') {
    return Math.round(baseTaux * coefAge)
  }
  return Math.round(baseTauxDuree * coefAge)
}

/**
 * Analyse la rentabilité du rachat de trimestres.
 */
export function analyserRachat(input: RachatInput): RachatResult {
  const { formulaire, ris, simulation } = input
  const { identite, carriere } = formulaire

  const birthYear = new Date(identite.dateNaissance).getFullYear()
  const trimRequis = getTrimestresRequis(birthYear) ?? 170
  const ageActuel = new Date().getFullYear() - birthYear
  const trimActuels = simulation.trimestresActuels
  const salaireBrut = (carriere.salaireBrutMensuel ?? 2500) * 12

  // Trimestres manquants pour le taux plein à l'âge souhaité
  const ageSouhaite = carriere.ageDepartSouhaite ?? simulation.ageTauxPlein
  const anneesRestantes = Math.max(0, (birthYear + ageSouhaite) - new Date().getFullYear())
  const trimProjectes = trimActuels + (anneesRestantes * 4)
  const trimManquants = Math.max(0, trimRequis - trimProjectes)

  // Combien de trimestres rachetables (études supérieures)
  const anneesEtudes = carriere.anneesEtudesSupérieures ?? 0
  const trimRachetablesEtudes = Math.min(anneesEtudes * 4, MAX_RACHAT_ETUDES)
  const trimRachetables = Math.min(trimManquants, trimRachetablesEtudes)

  if (trimManquants === 0 || trimRachetables === 0) {
    return {
      trimestresManquants: trimManquants,
      trimestresRachetables: 0,
      anneesEtudes,
      scenarios: [],
      recommandation: trimManquants === 0
        ? `Vous aurez le taux plein à ${ageSouhaite} ans sans rachat.`
        : `Pas de trimestres d'études supérieures déclarés pour le rachat. Envisagez de travailler ${Math.ceil(trimManquants / 4)} an(s) de plus.`,
    }
  }

  // Scénario de référence : pension SANS rachat (au taux réduit)
  const scenarioSansRachat = simulation.scenarios.find(s => s.age === ageSouhaite)
  const pensionSansRachat = scenarioSansRachat?.pensionTotaleMensuelle ?? 0

  // Espérance de vie résiduelle au départ
  const sexe = identite.sexe === 'F' ? 'F' : 'M'
  const esperanceVie = getEsperanceVie(ageSouhaite, sexe) ?? 20

  // Générer les scénarios de rachat
  const scenarios: ScenarioRachat[] = []
  const nbOptions = [
    Math.min(4, trimRachetables),
    trimRachetables,
  ].filter((v, i, a) => a.indexOf(v) === i && v > 0) // dédupliquer

  for (const nb of nbOptions) {
    for (const option of ['taux', 'taux_duree'] as const) {
      const cout = estimerCoutTrimestre(ageActuel, salaireBrut, option) * nb

      // Recalculer le taux avec les trimestres rachetés
      const trimApresRachat = trimProjectes + nb
      const trimManquantsApres = Math.max(0, trimRequis - trimApresRachat)
      const trimDecoteApres = Math.min(trimManquantsApres, 20)
      const tauxApres = CONSTANTES.cnav.taux_plein - (trimDecoteApres * CONSTANTES.cnav.decote_par_trimestre)

      // Gain mensuel approximatif
      const tauxAvant = scenarioSansRachat?.taux ?? (CONSTANTES.cnav.taux_plein - (Math.min(trimManquants, 20) * CONSTANTES.cnav.decote_par_trimestre))
      const ecartTaux = tauxApres - tauxAvant
      const gainMensuelBase = pensionSansRachat > 0
        ? Math.round(pensionSansRachat * (ecartTaux / tauxAvant) * 100) / 100
        : Math.round(ecartTaux * 20) // approximation

      const gainMensuel = Math.max(0, gainMensuelBase)
      const tempsRetour = gainMensuel > 0
        ? Math.round(cout / (gainMensuel * 12) * 10) / 10
        : 999

      const rentable = tempsRetour < esperanceVie && tempsRetour < 15

      scenarios.push({
        nbTrimestres: nb,
        option,
        coutEstime: cout,
        gainMensuel,
        tempsRetourAnnees: tempsRetour,
        rentable,
        ageRentabilite: rentable ? Math.round(ageSouhaite + tempsRetour) : undefined,
      })
    }
  }

  // Recommandation
  const meilleur = scenarios
    .filter(s => s.rentable)
    .sort((a, b) => a.tempsRetourAnnees - b.tempsRetourAnnees)[0]

  let recommandation: string
  if (meilleur) {
    recommandation = `Le rachat de ${meilleur.nbTrimestres} trimestre(s) en option "${meilleur.option === 'taux' ? 'taux seul' : 'taux + durée'}" est rentable. `
      + `Coût estimé : ${fmtN(meilleur.coutEstime)}€, gain : +${fmtN(meilleur.gainMensuel)}€/mois, rentabilisé en ${meilleur.tempsRetourAnnees} ans.`
  } else if (scenarios.length > 0) {
    recommandation = `Le rachat ne semble pas rentable dans votre situation. Envisagez plutôt de travailler ${Math.ceil(trimManquants / 4)} an(s) supplémentaire(s).`
  } else {
    recommandation = `Aucun scénario de rachat applicable.`
  }

  return {
    trimestresManquants: trimManquants,
    trimestresRachetables: trimRachetables,
    anneesEtudes,
    scenarios,
    recommandation,
  }
}

function fmtN(n: number): string {
  return Math.round(n).toLocaleString('fr-FR')
}
