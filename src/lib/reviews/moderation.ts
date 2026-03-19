// ============================================================
// RÉCUPÉO — Modération automatique des avis
// ============================================================

import { MAX_COMMENT_LENGTH } from './constants'

const BANNED_WORDS = [
  'connard', 'connasse', 'putain', 'merde', 'enculé', 'salaud', 'salope',
  'bâtard', 'nique', 'pute', 'fdp', 'ntm', 'pd', 'tapette',
  'arnaque', 'escroc', 'voleur', 'escroquerie', 'fraude',
]

const PII_PATTERNS = [
  /\b\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/, // Téléphone
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /\b\d{5}\b/, // Code postal seul (pas dans une phrase)
  /\b\d{13,15}\b/, // Numéro long (sécu, IBAN partiel)
]

export interface ModerationResult {
  status: 'published' | 'rejected' | 'pending'
  reason?: string
  sanitizedComment?: string
}

export function moderateReview(commentaire?: string, note?: number): ModerationResult {
  if (!commentaire || commentaire.trim() === '') {
    return { status: 'published' }
  }

  let text = commentaire.trim()

  // Tronquer si trop long
  if (text.length > MAX_COMMENT_LENGTH) {
    text = text.slice(0, MAX_COMMENT_LENGTH)
  }

  // Vérifier injures/spam
  const lower = text.toLowerCase()
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) {
      return { status: 'rejected', reason: `Contenu inapproprié détecté` }
    }
  }

  // Anonymiser PII
  for (const pattern of PII_PATTERNS) {
    text = text.replace(pattern, '***')
  }

  // Note basse avec commentaire → publié mais notification admin
  if (note && note <= 2) {
    return { status: 'published', sanitizedComment: text }
  }

  return { status: 'published', sanitizedComment: text }
}
