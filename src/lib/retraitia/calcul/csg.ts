// ============================================================
// RETRAITIA V2 — Vérification CSG
// ============================================================

import type { CalculCSG, ExtractionAvisImposition, ExtractionMensualites } from '../types'
import { getTauxCSG } from '../data'

interface CSGInput {
  avisImposition?: ExtractionAvisImposition
  avisImpositionN1?: ExtractionAvisImposition
  mensualites?: ExtractionMensualites
}

export function verifierCSG(input: CSGInput): CalculCSG | null {
  const { avisImposition, mensualites } = input
  if (!avisImposition || !avisImposition.rfr || !avisImposition.nombreParts) return null

  const { rfr, nombreParts, annee } = avisImposition

  // Taux theorique selon le RFR et les parts
  const theorique = getTauxCSG(rfr, nombreParts, annee ?? 2025)

  const result: CalculCSG = {
    rfr,
    nombreParts,
    tauxTheorique: theorique.taux,
  }

  // Comparer avec le taux applique (releve de mensualites)
  if (mensualites && mensualites.mois.length > 0) {
    // Prendre le dernier mois disponible
    const dernierMois = mensualites.mois[mensualites.mois.length - 1]
    result.tauxApplique = dernierMois.tauxCSG

    if (dernierMois.tauxCSG > theorique.taux) {
      result.ecart = Math.round((dernierMois.tauxCSG - theorique.taux) * 100) / 100
      // Calculer l'impact mensuel
      const pensionBrute = dernierMois.montantBrut
      result.impactMensuel = Math.round(pensionBrute * (result.ecart / 100) * 100) / 100
    }
  }

  return result
}

/**
 * Detecte si le taux CSG n'a pas ete retabli apres une variation ponctuelle du RFR.
 * Necessite 2 avis d'imposition (N et N-1).
 */
export function detecterCSGPostVariation(
  avisN: ExtractionAvisImposition | undefined,
  avisN1: ExtractionAvisImposition | undefined,
  mensualites: ExtractionMensualites | undefined,
): { detected: boolean; detail?: string } {
  if (!avisN || !avisN1 || !mensualites) return { detected: false }
  if (!avisN.rfr || !avisN1.rfr || !avisN.nombreParts || !avisN1.nombreParts) return { detected: false }

  const tauxN = getTauxCSG(avisN.rfr, avisN.nombreParts)
  const tauxN1 = getTauxCSG(avisN1.rfr, avisN1.nombreParts)

  // Le RFR N-1 etait plus eleve → taux CSG monte
  // Le RFR N est redescendu → le taux devrait redescendre
  if (tauxN1.taux > tauxN.taux) {
    // Verifier si le taux applique est encore celui de N-1
    const dernierMois = mensualites.mois[mensualites.mois.length - 1]
    if (dernierMois && dernierMois.tauxCSG >= tauxN1.taux) {
      return {
        detected: true,
        detail: `RFR ${avisN1.annee ?? 'N-1'}: ${avisN1.rfr}EUR (taux ${tauxN1.taux}%) → RFR ${avisN.annee ?? 'N'}: ${avisN.rfr}EUR (taux theorique ${tauxN.taux}%) mais taux applique: ${dernierMois.tauxCSG}%`,
      }
    }
  }

  return { detected: false }
}
