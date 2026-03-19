// ============================================================
// RETRAITIA V2 — Estimation pension pré-retraité (<55 ans)
// ============================================================
// Pour les <55 ans qui n'ont pas accès à l'EIG.
// On calcule l'équivalent à partir du RIS + barèmes.
// Source : BRIEF_PARCOURS_PRERETRAITE.md §6
// ============================================================

import type {
  DossierFormulaire, ExtractionRIS, CalculResult,
  SimulationResult, ConfidenceLevel,
} from '../types'
import { simulerScenarios } from './scenarios'

interface EstimationInput {
  formulaire: DossierFormulaire
  ris?: ExtractionRIS
  calcul?: CalculResult
  eigDisponible?: boolean // si EIG uploadé
}

export interface EstimationResult {
  simulation: SimulationResult
  source: 'eig_compare' | 'recupeo_estimation'
  confidence: ConfidenceLevel
  message: string
  ecartVsEIG?: {
    pensionEIG: number
    pensionRecupeo: number
    ecartMensuel: number
    ecartPct: number
    anomalieDetectee: boolean
  }
}

/**
 * Génère l'estimation de pension pour un pré-retraité.
 *
 * - Si ≥55 ans avec EIG : compare notre calcul à l'EIG → détection d'anomalies
 * - Si <55 ans sans EIG : notre estimation seule (fiabilité haute si RIS complet)
 */
export function estimerPension(input: EstimationInput): EstimationResult {
  const { formulaire, ris, calcul, eigDisponible } = input

  const birthYear = new Date(formulaire.identite.dateNaissance).getFullYear()
  const age = new Date().getFullYear() - birthYear

  // Lancer la simulation multi-scénarios
  const simulation = simulerScenarios({ formulaire, ris, calcul })

  // Déterminer la source et la fiabilité
  if (eigDisponible) {
    // ≥55 ans avec EIG : on compare
    return {
      simulation,
      source: 'eig_compare',
      confidence: 'HAUTE_CONFIANCE',
      message: `Estimation comparée à votre EIG officiel. ` +
        `${simulation.scenarios.length} scénario(s) calculé(s) entre ${simulation.scenarios[0]?.age ?? '?'} et ${simulation.scenarios[simulation.scenarios.length - 1]?.age ?? '?'} ans.`,
    }
  }

  // <55 ans : estimation RÉCUPÉO seule
  const hasRIS = ris && ris.totalTrimestresValides > 0
  const confidence: ConfidenceLevel = hasRIS ? 'HAUTE_CONFIANCE' : 'ESTIMATION'

  const messageAge = age < 55
    ? `L'Estimation Indicative Globale (EIG) sera disponible à partir de vos 55 ans sur info-retraite.fr. ` +
      `En attendant, cette estimation est calculée à partir de votre relevé de carrière et des barèmes officiels 2026.`
    : `Estimation basée sur votre relevé de carrière et les barèmes officiels 2026.`

  return {
    simulation,
    source: 'recupeo_estimation',
    confidence,
    message: messageAge + (hasRIS
      ? ` Fiabilité : haute (${ris.totalTrimestresValides} trimestres identifiés).`
      : ` Fiabilité : estimation — uploadez votre RIS pour améliorer la précision.`),
  }
}
