// ============================================================
// MONIMPÔT V2 — Séparation données sensibles / données IA
// ============================================================

import type { AvisImpositionExtracted } from './extract-types'

export interface SensitiveData {
  numeroFiscal?: string
  numeroAvis?: string
  adresseCentre?: string
}

/**
 * Sépare les données sensibles (n° fiscal, adresse centre) du reste.
 * Les données sanitisées peuvent être envoyées à l'IA pour l'analyse.
 * Les données sensibles sont stockées séparément pour la réclamation.
 */
export function separateSensitiveData(extraction: AvisImpositionExtracted): {
  sanitized: AvisImpositionExtracted
  sensitive: SensitiveData
} {
  const sensitive: SensitiveData = {
    numeroFiscal: extraction.numeroFiscal,
    numeroAvis: extraction.numeroAvis,
    adresseCentre: extraction.adresseCentre,
  }

  const sanitized: AvisImpositionExtracted = {
    ...extraction,
    numeroFiscal: undefined,
    numeroAvis: undefined,
    adresseCentre: undefined,
  }

  return { sanitized, sensitive }
}

/**
 * Ré-injecte les données sensibles dans un objet extraction sanitisé.
 * Utilisé juste avant de générer la réclamation.
 */
export function rehydrateSensitiveData(
  sanitized: AvisImpositionExtracted,
  sensitive: SensitiveData
): AvisImpositionExtracted {
  return {
    ...sanitized,
    numeroFiscal: sensitive.numeroFiscal,
    numeroAvis: sensitive.numeroAvis,
    adresseCentre: sensitive.adresseCentre,
  }
}
