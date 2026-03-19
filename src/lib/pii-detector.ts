// ============================================================
// RÉCUPÉO — Détecteur de PII (données personnelles) dans du texte
// ============================================================
// Analyse un texte OCR français pour détecter automatiquement :
//   - Noms propres (patterns contextuels : "M./Mme", "né(e) à"...)
//   - Adresses postales
//   - Emails, téléphones
//   - Numéros de sécu, IBAN, numéros fiscaux
//   - Noms de bailleurs, agences
//
// Retourne les PII détectées prêtes pour AnonymizationSession.
// ============================================================
import { AnonymizationSession, type PIICategory } from '@/lib/anonymizer'

/** PII détectée dans le texte */
export interface DetectedPII {
  category: PIICategory
  value: string
  context: string  // Extrait du texte autour de la détection
}

/**
 * Détecte les données personnelles dans un texte OCR.
 * Retourne une liste de PII triées par catégorie.
 */
export function detectPII(text: string): DetectedPII[] {
  const results: DetectedPII[] = []
  const seen = new Set<string>()  // Éviter les doublons

  const addPII = (category: PIICategory, value: string, context: string) => {
    const key = `${category}:${value.toLowerCase().trim()}`
    if (!seen.has(key) && value.trim().length > 1) {
      seen.add(key)
      results.push({ category, value: value.trim(), context })
    }
  }

  // --- EMAILS ---
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  for (const match of text.matchAll(emailRegex)) {
    addPII('email', match[0], getContext(text, match.index!, 40))
  }

  // --- TÉLÉPHONES FRANÇAIS ---
  // 06 12 34 56 78 / 06.12.34.56.78 / +33 6 12 34 56 78 / 0033612345678
  const phoneRegex = /(?:(?:\+33|0033)\s*[1-9](?:[\s.-]*\d{2}){4})|(?:0\s*[1-9](?:[\s.-]*\d{2}){4})/g
  for (const match of text.matchAll(phoneRegex)) {
    addPII('telephone', match[0], getContext(text, match.index!, 30))
  }

  // --- NUMÉROS DE SÉCURITÉ SOCIALE ---
  // 1 85 12 75 116 005 42 ou avec espaces/tirets
  const secuRegex = /[12]\s*\d{2}\s*(?:0[1-9]|1[0-2]|[2-9]\d)\s*\d{2,3}\s*\d{3}\s*\d{3}\s*\d{2}/g
  for (const match of text.matchAll(secuRegex)) {
    addPII('num_secu', match[0], getContext(text, match.index!, 30))
  }

  // --- IBAN ---
  const ibanRegex = /FR\s*\d{2}\s*(?:\d{4}\s*){5}\d{3}/gi
  for (const match of text.matchAll(ibanRegex)) {
    addPII('iban', match[0], getContext(text, match.index!, 30))
  }

  // --- NUMÉRO FISCAL ---
  // 13 chiffres commençant par 0, 1, 2 ou 3
  const fiscalRegex = /(?:numéro\s*fiscal|n°\s*fiscal|SPI|identifiant\s*fiscal)[^\d]*(\d{13})/gi
  for (const match of text.matchAll(fiscalRegex)) {
    addPII('num_fiscal', match[1], getContext(text, match.index!, 40))
  }

  // --- ADRESSES POSTALES ---
  // Pattern : numéro + type de voie + nom + code postal + ville
  const adresseRegex = /\d{1,4}\s*,?\s*(?:rue|avenue|boulevard|impasse|place|allée|chemin|cours|passage|résidence|square|voie|route)\s+[A-ZÀ-Ÿa-zà-ÿ\s'-]{3,60}(?:\s*,?\s*\d{5}\s+[A-ZÀ-Ÿa-zà-ÿ\s'-]+)?/gi
  for (const match of text.matchAll(adresseRegex)) {
    addPII('adresse', match[0], getContext(text, match.index!, 20))
  }

  // Adresse avec code postal seul
  const cpVilleRegex = /\d{5}\s+[A-ZÀ-Ÿ][a-zà-ÿ]+(?:[- ][A-ZÀ-Ÿa-zà-ÿ]+)*/g
  for (const match of text.matchAll(cpVilleRegex)) {
    // Vérifier que ce n'est pas un faux positif (date, montant...)
    const val = match[0].trim()
    if (!isCommonFalsePositive(val)) {
      addPII('adresse', val, getContext(text, match.index!, 20))
    }
  }

  // --- NOMS PROPRES (contextuels) ---
  // "M." / "Mme" / "Monsieur" / "Madame" suivi d'un nom
  const civiliteRegex = /(?:M\.|Mme\.?|Monsieur|Madame|Mademoiselle)\s+([A-ZÀ-Ÿ][a-zà-ÿA-ZÀ-Ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿA-ZÀ-Ÿ]+){0,2})/g
  for (const match of text.matchAll(civiliteRegex)) {
    const fullName = match[1].trim()
    const parts = fullName.split(/\s+/)
    for (const part of parts) {
      if (part.length > 2 && !COMMON_FRENCH_WORDS.has(part) && !COMMON_FRENCH_WORDS.has(part.toLowerCase()) && !COMMON_FRENCH_WORDS.has(part.charAt(0) + part.slice(1).toLowerCase())) {
        addPII('nom', part, getContext(text, match.index!, 40))
      }
    }
    if (parts.length >= 2) {
      addPII('nom', fullName, getContext(text, match.index!, 40))
    }
  }

  // "entre ... (le bailleur)" / "et ... (le locataire)"
  const partieRegex = /(?:entre|et)\s+(?:M\.|Mme\.?|Monsieur|Madame)?\s*([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+){0,3})\s*[,(]?\s*(?:ci-après|le\s+bailleur|la\s+bailleresse|le\s+locataire|le\s+preneur|la\s+preneuse|propriétaire|bailleur|locataire)/gi
  for (const match of text.matchAll(partieRegex)) {
    const name = match[1].trim()
    if (name.length > 2 && !isGenericTerm(name)) {
      addPII('nom_bailleur', name, getContext(text, match.index!, 50))
    }
  }

  // "Agence" / "Cabinet" / "SCI" / "SARL" suivi d'un nom
  const agenceRegex = /(?:Agence|Cabinet|SCI|SARL|SAS|EURL|Régie|Groupe|Société)\s+([A-ZÀ-Ÿ][a-zà-ÿA-ZÀ-Ÿ\s&'-]{2,40})/g
  for (const match of text.matchAll(agenceRegex)) {
    const name = match[1].trim()
    if (name.length > 2) {
      addPII('nom_agence', name, getContext(text, match.index!, 40))
    }
  }

  // --- NOM DE L'ADRESSE DU LOGEMENT ---
  // "situé(e) au / à" suivi d'une adresse
  const situéRegex = /situ[ée]+\s+(?:au|à|a)\s+([\d].*?)(?:\.|,|\n|$)/gi
  for (const match of text.matchAll(situéRegex)) {
    const addr = match[1].trim()
    if (addr.length > 5) {
      addPII('adresse_logement', addr, getContext(text, match.index!, 40))
    }
  }

  return results
}

/**
 * Crée une AnonymizationSession pré-remplie avec les PII détectées.
 */
export function createSessionFromDetectedPII(piis: DetectedPII[]): AnonymizationSession {
  const session = new AnonymizationSession()
  for (const pii of piis) {
    session.register(pii.category, pii.value)
  }
  return session
}

/**
 * Pipeline complet : détecte les PII dans un texte et retourne
 * le texte anonymisé + la session (pour dé-anonymiser plus tard).
 */
export function anonymizeText(text: string): {
  anonymizedText: string
  session: AnonymizationSession
  detectedCount: number
} {
  const piis = detectPII(text)
  const session = createSessionFromDetectedPII(piis)
  const anonymizedText = session.anonymize(text)
  return { anonymizedText, session, detectedCount: piis.length }
}

// --- Helpers ---

function getContext(text: string, index: number, radius: number): string {
  const start = Math.max(0, index - radius)
  const end = Math.min(text.length, index + radius)
  return text.substring(start, end).replace(/\n/g, ' ').trim()
}

function isCommonFalsePositive(value: string): boolean {
  // "75000 euros", "12000 €", etc.
  if (/\d{5}\s*€/.test(value)) return true
  if (/\d{5}\s*euros?/i.test(value)) return true
  return false
}

function isGenericTerm(name: string): boolean {
  const generic = new Set([
    'Bail', 'Location', 'Logement', 'Contrat', 'État', 'Lieux',
    'Entrée', 'Sortie', 'Article', 'Alinéa', 'Chapitre',
  ])
  return generic.has(name)
}

/** Mots français courants (pas des noms propres) */
const COMMON_FRENCH_WORDS = new Set([
  'Le', 'La', 'Les', 'Un', 'Une', 'Des', 'Du', 'De', 'Au', 'Aux',
  'Ce', 'Cette', 'Ces', 'Mon', 'Ma', 'Mes', 'Son', 'Sa', 'Ses',
  'Notre', 'Nos', 'Votre', 'Vos', 'Leur', 'Leurs',
  'En', 'Par', 'Pour', 'Sur', 'Dans', 'Avec', 'Sans', 'Sous',
  'Bail', 'Location', 'Logement', 'Loyer', 'Dépôt', 'Garantie',
  'Caution', 'Propriétaire', 'Locataire', 'Bailleur',
  'État', 'Lieux', 'Entrée', 'Sortie', 'Chambre', 'Salon',
  'Cuisine', 'Salle', 'Couloir', 'Mur', 'Sol', 'Plafond',
  'Bon', 'Mauvais', 'Neuf', 'Usé', 'Propre', 'Sale',
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  'Article', 'Alinéa', 'Code', 'Civil', 'Loi',
])
