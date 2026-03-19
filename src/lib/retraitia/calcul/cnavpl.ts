// ============================================================
// RETRAITIA V2 — Moteur de calcul CNAVPL (base libéraux)
// ============================================================
// Régime par points. Décote/surcote si trimestres insuffisants.
// Source : BRIEF_REGIMES_SPECIFIQUES.md §8
// ============================================================

import type {
  CalculCNAVPL, ValueWithConfidence, ConfidenceLevel,
  ExtractionRIS, DossierFormulaire,
} from '../types'
import { getTrimestresRequis, getValeurPointCNAVPL, CONSTANTES } from '../data'

interface CalculCNAVPLInput {
  ris?: ExtractionRIS
  releveCNAVPL?: Record<string, unknown>
  formulaire: DossierFormulaire
  section?: string // CIPAV, CARMF, etc.
}

function vc<T = number>(value: T, confidence: ConfidenceLevel, source: string): ValueWithConfidence<T> {
  return { value, confidence, source }
}

/**
 * Calcul pension base CNAVPL (professions libérales).
 * Pension = Total points × Valeur du point, avec décote/surcote.
 */
export function calculerCNAVPL(input: CalculCNAVPLInput): CalculCNAVPL {
  const { ris, releveCNAVPL, formulaire, section } = input
  const { identite, enfants } = formulaire

  const birthYear = new Date(identite.dateNaissance).getFullYear()
  const trimRequis = getTrimestresRequis(birthYear) ?? 170
  const valeurPoint = getValeurPointCNAVPL()

  // ── Total points CNAVPL ──
  let totalPoints = 0
  let pointsConfidence: ConfidenceLevel = 'ESTIMATION'

  if (releveCNAVPL) {
    totalPoints = (releveCNAVPL as any).totalPoints || 0
    pointsConfidence = totalPoints > 0 ? 'CERTAIN' : 'ESTIMATION'
  }

  // ── Trimestres tous régimes (pour décote/surcote) ──
  const trimTousRegimes = ris?.totalTrimestresValides || 0

  // ── Décote / Surcote ──
  let coefficient = 1.0
  let decoteInfo: CalculCNAVPL['decote']
  let surcoteInfo: CalculCNAVPL['surcote']

  const trimManquants = Math.max(0, trimRequis - trimTousRegimes)
  if (trimManquants > 0 && trimTousRegimes > 0) {
    // Décote CNAVPL : 1,25% par trimestre manquant (max 25%)
    const trimDecote = Math.min(trimManquants, 20)
    const decotePct = trimDecote * 1.25
    coefficient = 1 - decotePct / 100
    decoteInfo = { trimestres: trimDecote, impact: decotePct }
  }

  const trimSupp = Math.max(0, trimTousRegimes - trimRequis)
  if (trimSupp > 0 && trimManquants === 0) {
    // Surcote : 0,75% par trimestre (max 25%)
    const trimSurcote = Math.min(trimSupp, 20)
    const surcotePct = trimSurcote * 0.75
    coefficient = 1 + surcotePct / 100
    surcoteInfo = { trimestres: trimSurcote, impact: surcotePct }
  }

  // ── Pension brute ──
  const pensionAnnuelle = Math.round(totalPoints * valeurPoint * coefficient * 100) / 100
  const pensionMensuelle = Math.round(pensionAnnuelle / 12 * 100) / 100

  const confidence: ConfidenceLevel = totalPoints > 0 ? 'HAUTE_CONFIANCE' : 'ESTIMATION'

  // ── Majoration enfants (+10% pour 3+) ──
  let majorationEnfants: { applicable: boolean; montant: number } | undefined
  if (enfants.nombreEnfants >= 3) {
    majorationEnfants = {
      applicable: true,
      montant: Math.round(pensionMensuelle * 0.10 * 100) / 100,
    }
  }

  return {
    totalPoints: vc(totalPoints, pointsConfidence, 'Relevé CNAVPL'),
    valeurPoint,
    pensionBruteAnnuelle: vc(pensionAnnuelle, confidence,
      `${totalPoints} pts × ${valeurPoint}€ × ${coefficient.toFixed(4)}`),
    pensionBruteMensuelle: vc(pensionMensuelle, confidence, `${pensionAnnuelle}€ / 12`),
    decote: decoteInfo,
    surcote: surcoteInfo,
    majorationEnfants,
    section,
  }
}
