// ============================================================
// RÉCUPÉO — Module d'anonymisation / désanonymisation
// ============================================================
// Principe :
//   1. Avant envoi à l'API Claude → anonymise les données personnelles
//   2. Mapping stocké localement en mémoire (jamais envoyé à l'API)
//   3. Au retour de Claude → désanonymise la réponse
//
// Usage :
//   const session = new AnonymizationSession()
//   session.register('email', 'jean.dupont@gmail.com')
//   session.register('nom', 'Dupont')
//   const safeText = session.anonymize(textToSend)
//   // envoyer safeText à Claude...
//   const realText = session.deanonymize(claudeResponse)
// ============================================================

/** Catégories de données personnelles */
export type PIICategory =
  | 'email'
  | 'nom'
  | 'prenom'
  | 'adresse'
  | 'telephone'
  | 'date_naissance'
  | 'num_secu'        // Numéro de sécurité sociale
  | 'iban'
  | 'num_fiscal'      // Numéro fiscal
  | 'nom_bailleur'    // Nom du bailleur / propriétaire
  | 'nom_agence'      // Nom de l'agence immobilière
  | 'adresse_logement'
  | 'nom_employeur'
  | 'num_contrat'
  | 'custom'          // Champ libre

/** Entrée dans le mapping d'anonymisation */
interface PIIEntry {
  category: PIICategory
  realValue: string
  token: string
}

/**
 * Session d'anonymisation.
 * Chaque appel API a sa propre session → pas de fuite entre requêtes.
 */
export class AnonymizationSession {
  private entries: PIIEntry[] = []
  private counters: Record<string, number> = {}

  /**
   * Enregistre une donnée personnelle à anonymiser.
   * Retourne le token de remplacement.
   *
   * @param category Catégorie de la donnée
   * @param realValue Valeur réelle (ex: "jean.dupont@gmail.com")
   * @param customLabel Label custom (pour category='custom')
   * @returns Token (ex: "[EMAIL_1]")
   */
  register(category: PIICategory, realValue: string, customLabel?: string): string {
    if (!realValue || realValue.trim() === '') return ''

    // Vérifier si cette valeur est déjà enregistrée
    const existing = this.entries.find(
      e => e.category === category && e.realValue === realValue
    )
    if (existing) return existing.token

    // Générer le token
    const label = customLabel || category.toUpperCase()
    if (!this.counters[label]) this.counters[label] = 0
    this.counters[label]++
    const token = `[${label}_${this.counters[label]}]`

    this.entries.push({ category, realValue, token })
    return token
  }

  /**
   * Enregistre plusieurs données d'un coup.
   *
   * @param fields Objet { category: realValue }
   * @returns Objet { category: token }
   */
  registerMany(fields: Record<string, { category: PIICategory; value: string }>): Record<string, string> {
    const tokens: Record<string, string> = {}
    for (const [key, { category, value }] of Object.entries(fields)) {
      tokens[key] = this.register(category, value)
    }
    return tokens
  }

  /**
   * Anonymise un texte en remplaçant toutes les valeurs réelles par leurs tokens.
   * Effectue les remplacements du plus long au plus court (éviter les sous-chaînes).
   */
  anonymize(text: string): string {
    if (!text) return text

    // Trier par longueur décroissante pour éviter les remplacements partiels
    const sorted = [...this.entries].sort(
      (a, b) => b.realValue.length - a.realValue.length
    )

    let result = text
    for (const entry of sorted) {
      // Remplacement global, case-insensitive pour les noms/prénoms
      const flags = ['nom', 'prenom', 'nom_bailleur', 'nom_agence', 'nom_employeur'].includes(entry.category)
        ? 'gi'
        : 'g'
      result = result.replace(new RegExp(escapeRegExp(entry.realValue), flags), entry.token)
    }

    return result
  }

  /**
   * Anonymise un objet JSON (récursif).
   * Remplace les valeurs string qui matchent des données enregistrées.
   */
  anonymizeObject<T>(obj: T): T {
    if (typeof obj === 'string') {
      return this.anonymize(obj) as T
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.anonymizeObject(item)) as T
    }
    if (obj && typeof obj === 'object') {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        result[key] = this.anonymizeObject(value)
      }
      return result as T
    }
    return obj
  }

  /**
   * Désanonymise un texte en remplaçant les tokens par les valeurs réelles.
   */
  deanonymize(text: string): string {
    if (!text) return text

    let result = text
    for (const entry of this.entries) {
      result = result.replaceAll(entry.token, entry.realValue)
    }
    return result
  }

  /**
   * Désanonymise un objet JSON (récursif).
   */
  deanonymizeObject<T>(obj: T): T {
    if (typeof obj === 'string') {
      return this.deanonymize(obj) as T
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.deanonymizeObject(item)) as T
    }
    if (obj && typeof obj === 'object') {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        result[key] = this.deanonymizeObject(value)
      }
      return result as T
    }
    return obj
  }

  /** Retourne le nombre de données enregistrées */
  get count(): number {
    return this.entries.length
  }

  /** Retourne le mapping complet (pour debug, JAMAIS l'envoyer à l'API !) */
  getMapping(): Array<{ category: PIICategory; token: string; preview: string }> {
    return this.entries.map(e => ({
      category: e.category,
      token: e.token,
      preview: e.realValue.substring(0, 3) + '***',
    }))
  }
}

/** Échappe les caractères spéciaux pour une utilisation dans un RegExp */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
