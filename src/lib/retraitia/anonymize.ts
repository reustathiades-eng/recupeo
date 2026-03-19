// ============================================================
// RETRAITIA — Anonymisation spécifique à la brique
// ============================================================
// Pour le MVP RETRAITIA, les données personnelles sont limitées :
// - Email uniquement (pas de n° de Sécurité Sociale au MVP)
// - Les dates, montants, trimestres ne sont PAS des PII
// ============================================================
import { AnonymizationSession } from '@/lib/anonymizer'
import type { RetraitiaFormData } from './types'

/**
 * Crée une session d'anonymisation pré-remplie avec les données
 * personnelles du formulaire RETRAITIA.
 *
 * Données anonymisées :
 * - email
 *
 * Données NON anonymisées (nécessaires pour les calculs IA) :
 * - dates (naissance, départ) → nécessaires pour les calculs
 * - montants (pensions) → nécessaires pour l'analyse
 * - trimestres, régimes → nécessaires pour l'analyse
 * - sexe, enfants → nécessaires pour majorations
 *
 * NOTE : En Phase 2 (upload RIS), il faudra aussi anonymiser :
 * - Nom / prénom (présent sur le RIS)
 * - N° de Sécurité Sociale (présent sur le RIS)
 * - Noms d'employeurs (présents sur le RIS)
 */
export function createRetraitiaAnonymizer(data: RetraitiaFormData): AnonymizationSession {
  const session = new AnonymizationSession()

  // Email — toujours anonymiser
  if (data.email) {
    session.register('email', data.email)
  }

  return session
}
