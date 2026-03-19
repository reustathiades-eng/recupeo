// ============================================================
// RETRAITIA V2 — Moteur de calcul Agirc-Arrco
// ============================================================

import type {
  CalculAgircArrco, ValueWithConfidence, ConfidenceLevel,
  ExtractionAgircArrco, DossierFormulaire,
} from '../types'
import { getValeurPointAA, CONSTANTES } from '../data'

function vc<T = number>(value: T, confidence: ConfidenceLevel, source: string): ValueWithConfidence<T> {
  return { value, confidence, source }
}

interface AAInput {
  agircArrco?: ExtractionAgircArrco
  formulaire: DossierFormulaire
  dateDepartRetraite?: string
}

export function calculerAgircArrco(input: AAInput): CalculAgircArrco | null {
  const { agircArrco, formulaire } = input
  if (!agircArrco || !agircArrco.totalPoints) return null

  const anneeDepart = input.dateDepartRetraite
    ? new Date(input.dateDepartRetraite).getFullYear()
    : new Date().getFullYear()

  const valeurPoint = getValeurPointAA(anneeDepart) ?? getValeurPointAA(2025) ?? 1.4386
  const c = CONSTANTES.agirc_arrco

  // ── Total points ──
  const totalPoints = agircArrco.totalPoints

  // ── Pension annuelle ──
  const pensionAnnuelle = totalPoints * valeurPoint
  const pensionMensuelle = pensionAnnuelle / 12

  // ── Malus / Coefficient de solidarite ──
  let malus = { actif: false, dateFin: undefined as string | undefined, impact: 0 }
  if (agircArrco.malus && input.dateDepartRetraite) {
    const dateDepart = new Date(input.dateDepartRetraite)
    const dateFin = new Date(dateDepart)
    dateFin.setMonth(dateFin.getMonth() + c.malus_duree_mois)

    const now = new Date()
    if (now < dateFin) {
      malus = {
        actif: true,
        dateFin: dateFin.toISOString().split('T')[0],
        impact: Math.round(pensionMensuelle * c.malus_taux / 100 * 100) / 100,
      }
    }
    // Si 3 ans passes et malus toujours mentionne → anomalie N2_MALUS_NON_LEVE
    if (now >= dateFin && agircArrco.malus) {
      malus = {
        actif: true, // toujours actif alors qu'il ne devrait plus l'etre
        dateFin: dateFin.toISOString().split('T')[0],
        impact: Math.round(pensionMensuelle * c.malus_taux / 100 * 100) / 100,
      }
    }
  }

  // ── Majoration enfants ──
  const nbEnfants = formulaire.enfants.nombreEnfants
  let majorationEnfants = undefined
  if (nbEnfants >= 3) {
    majorationEnfants = {
      applicable: true,
      montant: Math.round(pensionMensuelle * 0.10 * 100) / 100, // +10% plafonne
    }
  }

  // ── Verification GMP (cadres avant 2019) ──
  let gmpVerification = undefined
  if (formulaire.carriere.cadreAvant2019 && agircArrco.pointsParAnnee) {
    const gmpAnnees: number[] = []
    let pointsManquants = 0
    for (const p of agircArrco.pointsParAnnee) {
      if (p.annee >= 2012 && p.annee <= 2018 && p.type === 'cotises') {
        // GMP = 120 points minimum par an pour les cadres
        if (p.points < 120) {
          gmpAnnees.push(p.annee)
          pointsManquants += (120 - p.points)
        }
      }
    }
    if (gmpAnnees.length > 0) {
      gmpVerification = { anneesConcernees: gmpAnnees, pointsManquants: Math.round(pointsManquants) }
    }
  }

  return {
    totalPoints: vc(totalPoints, 'HAUTE_CONFIANCE', `${totalPoints} points x ${valeurPoint}EUR/point`),
    valeurPoint,
    pensionAnnuelle: vc(Math.round(pensionAnnuelle * 100) / 100, 'HAUTE_CONFIANCE', 'Points x valeur de service'),
    pensionMensuelle: vc(Math.round(pensionMensuelle * 100) / 100, 'HAUTE_CONFIANCE', 'Pension annuelle / 12'),
    majorationEnfants,
    malus,
    gmpVerification,
  }
}
