// ============================================================
// RETRAITIA V2 — Anonymisation avant appel Claude
// ============================================================
// Remplace N° SS et noms par des placeholders avant l'envoi à Claude.
// Désanonymise les résultats après.
// ============================================================

export class AnonymizationSession {
  private mappings: Map<string, string> = new Map()
  private counter = 0

  /** Anonymise un texte en remplaçant les données sensibles */
  anonymize(text: string): string {
    let result = text

    // N° de sécurité sociale (13 ou 15 chiffres avec espaces/points possibles)
    result = result.replace(
      /\b([12]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}(?:\s?\d{2})?)\b/g,
      (match) => this.replace(match.replace(/\s/g, ''), '[NIR_ANONYME]')
    )

    // Noms propres en majuscules (2+ mots consécutifs en majuscules)
    result = result.replace(
      /\b([A-ZÉÈÊËÀÂÔÎÏÙÛÇ]{2,}(?:\s+[A-ZÉÈÊËÀÂÔÎÏÙÛÇ]{2,})+)\b/g,
      (match) => this.replace(match, '[NOM_ANONYME]')
    )

    return result
  }

  /** Désanonymise les résultats */
  deanonymize<T>(data: T): T {
    const json = JSON.stringify(data)
    let result = json

    for (const [original, placeholder] of this.mappings) {
      result = result.replace(new RegExp(escapeRegex(placeholder), 'g'), original)
    }

    return JSON.parse(result)
  }

  private replace(original: string, template: string): string {
    const existing = Array.from(this.mappings.entries()).find(([k]) => k === original)
    if (existing) return existing[1]

    this.counter++
    const placeholder = `${template}_${this.counter}`
    this.mappings.set(original, placeholder)
    return placeholder
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
