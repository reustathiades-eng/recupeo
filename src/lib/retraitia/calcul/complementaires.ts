// ============================================================
// RETRAITIA V2 — Vérification complémentaires : RAFP, Ircantec, RCI
// ============================================================
// Chacun est un régime par points. On vérifie les totaux
// et calcule la pension correspondante.
// Source : BRIEF_REGIMES_SPECIFIQUES.md §3-7
// ============================================================

import type {
  CalculComplementaire, ValueWithConfidence, ConfidenceLevel,
  ComplementaryRegime, DossierFormulaire,
} from '../types'
import {
  getValeurPointRAFP, getValeurPointIrcantec, getValeurPointRCI,
  REGIMES_COMPL,
} from '../data'

interface ComplementaireInput {
  regime: 'rafp' | 'ircantec' | 'rci'
  totalPoints?: number
  formulaire: DossierFormulaire
}

function vc<T = number>(value: T, confidence: ConfidenceLevel, source: string): ValueWithConfidence<T> {
  return { value, confidence, source }
}

const VALEUR_POINT_FN: Record<string, () => number> = {
  rafp: getValeurPointRAFP,
  ircantec: getValeurPointIrcantec,
  rci: getValeurPointRCI,
}

const LABELS: Record<string, string> = {
  rafp: 'RAFP (Additionnelle FP)',
  ircantec: 'Ircantec (Contractuels FP)',
  rci: 'RCI (Complémentaire Indépendants)',
}

/**
 * Calcul pension d'un régime complémentaire par points.
 */
export function calculerComplementaire(input: ComplementaireInput): CalculComplementaire {
  const { regime, totalPoints: rawPoints, formulaire } = input
  const { enfants } = formulaire

  const valeurPoint = VALEUR_POINT_FN[regime]()
  const totalPoints = rawPoints || 0
  const confidence: ConfidenceLevel = totalPoints > 0 ? 'HAUTE_CONFIANCE' : 'ESTIMATION'

  const pensionAnnuelle = Math.round(totalPoints * valeurPoint * 100) / 100
  const pensionMensuelle = Math.round(pensionAnnuelle / 12 * 100) / 100

  // Vérification versement en capital (RAFP uniquement)
  let versementCapital: boolean | undefined
  if (regime === 'rafp') {
    const seuilRente = REGIMES_COMPL.rafp.seuil_rente_annuel
    versementCapital = pensionAnnuelle < seuilRente
  }

  // Majoration enfants (Ircantec : +10% pour 3+ enfants)
  let majorationEnfants: { applicable: boolean; montant: number } | undefined
  if (regime === 'ircantec' && enfants.nombreEnfants >= 3) {
    majorationEnfants = {
      applicable: true,
      montant: Math.round(pensionMensuelle * 0.10 * 100) / 100,
    }
  }

  return {
    regime: regime as ComplementaryRegime,
    totalPoints: vc(totalPoints, totalPoints > 0 ? 'CERTAIN' : 'ESTIMATION',
      `Relevé ${LABELS[regime]}`),
    valeurPoint,
    pensionAnnuelle: vc(pensionAnnuelle, confidence,
      `${totalPoints} pts × ${valeurPoint}€`),
    pensionMensuelle: vc(pensionMensuelle, confidence,
      `${pensionAnnuelle}€ / 12`),
    majorationEnfants,
    versementCapital,
  }
}

/**
 * Vérifie tous les régimes complémentaires disponibles pour un dossier.
 */
export function verifierComplementaires(input: {
  formulaire: DossierFormulaire
  releveRAFP?: Record<string, unknown>
  releveIrcantec?: Record<string, unknown>
  releveRCI?: Record<string, unknown>
}): CalculComplementaire[] {
  const results: CalculComplementaire[] = []

  if (input.releveRAFP) {
    results.push(calculerComplementaire({
      regime: 'rafp',
      totalPoints: (input.releveRAFP as any).totalPoints,
      formulaire: input.formulaire,
    }))
  }

  if (input.releveIrcantec) {
    results.push(calculerComplementaire({
      regime: 'ircantec',
      totalPoints: (input.releveIrcantec as any).totalPoints,
      formulaire: input.formulaire,
    }))
  }

  if (input.releveRCI) {
    results.push(calculerComplementaire({
      regime: 'rci',
      totalPoints: (input.releveRCI as any).totalPoints,
      formulaire: input.formulaire,
    }))
  }

  return results
}
