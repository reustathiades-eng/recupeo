// ============================================================
// RETRAITIA V2 — Logique du mini-diagnostic flash
// ============================================================
// Source : BRIEF_DIAGNOSTIC_GRATUIT.md §2.6 + §2.7
// 4 questions → score de risque → facteurs personnalisés
// ============================================================

import type { FlashInput, FlashResult, FlashRiskLevel, FlashRiskFactor } from './types'

// ─────────────────────────────────────────────
// Facteurs de risque avec textes personnalisés
// ─────────────────────────────────────────────

interface FactorDef {
  id: string
  label: string
  getText: (input: FlashInput) => string
}

const FACTOR_DEFS: Record<string, FactorDef> = {
  trimestres_enfants: {
    id: 'trimestres_enfants',
    label: 'Trimestres enfants',
    getText: (input) =>
      `Vous avez ${input.childrenCount} enfant${input.childrenCount > 1 ? 's' : ''}. Les trimestres maternité et éducation (jusqu'à ${input.childrenCount * 8} trimestres) sont souvent absents du relevé de carrière officiel. C'est l'anomalie la plus fréquente.`,
  },
  majoration_enfants: {
    id: 'majoration_enfants',
    label: 'Majoration enfants',
    getText: () =>
      `Avec 3 enfants ou plus, votre pension de base ET votre complémentaire doivent être majorées de 10%. Cette majoration n'est pas toujours appliquée automatiquement.`,
  },
  carriere_mixte: {
    id: 'carriere_mixte',
    label: 'Carrière mixte',
    getText: () =>
      `Vous avez travaillé dans plusieurs régimes. La coordination entre les régimes est une source fréquente d'erreurs (trimestres comptés en double ou oubliés).`,
  },
  migration_rsi: {
    id: 'migration_rsi',
    label: 'Migration RSI',
    getText: () =>
      `En tant qu'ancien indépendant, votre dossier a été transféré du RSI vers le régime général en 2020. Cette migration a généré de nombreuses erreurs.`,
  },
  generation_ancienne: {
    id: 'generation_ancienne',
    label: 'Génération ancienne',
    getText: () =>
      `Les carrières antérieures à l'informatisation (avant ~1985) sont souvent mal enregistrées. Plus la carrière est longue, plus le risque d'erreur augmente.`,
  },
  bonifications_fp: {
    id: 'bonifications_fp',
    label: 'Bonifications FP',
    getText: () =>
      'Les bonifications de la fonction publique (enfants, services outre-mer, catégorie active) sont fréquemment mal comptabilisées.',
  },
  revalorisation_agricole: {
    id: 'revalorisation_agricole',
    label: 'Revalorisation agricole',
    getText: () =>
      `Les petites pensions agricoles ont été revalorisées récemment (loi Chassaigne). Beaucoup de retraités agricoles n'ont pas encore bénéficié de cette revalorisation.`,
  },
  liberal_sections: {
    id: 'liberal_sections',
    label: 'Professions libérales',
    getText: () =>
      `Les professions libérales cotisent auprès de sections spécifiques (CARMF, CIPAV, CARPIMKO…). La complexité de ces régimes augmente le risque d'erreurs.`,
  },
  reversion: {
    id: 'reversion',
    label: 'Pension de réversion',
    getText: () =>
      'La pension de réversion doit être demandée à chaque régime séparément. La réversion complémentaire (Agirc-Arrco, 60%) est très souvent oubliée.',
  },
}

// ─────────────────────────────────────────────
// Calcul du score de risque
// ─────────────────────────────────────────────

export function computeFlashRisk(input: FlashInput): FlashResult {
  let score = 0
  const factors: FlashRiskFactor[] = []

  const add = (id: string, weight: number) => {
    const def = FACTOR_DEFS[id]
    if (!def) return
    score += weight
    factors.push({ id, label: def.label, weight })
  }

  // Facteur 1 : enfants (le plus gros facteur pour les femmes)
  if (input.childrenCount >= 3) {
    add('trimestres_enfants', 25)
    add('majoration_enfants', 15)
  } else if (input.childrenCount >= 1) {
    add('trimestres_enfants', 15)
  }

  // Facteur 2 : carrière mixte (polypensionné)
  if (input.careerType === 'mixte') {
    add('carriere_mixte', 25)
  }

  // Facteur 3 : indépendant (migration RSI)
  if (input.careerType === 'independant') {
    add('migration_rsi', 20)
  }

  // Facteur 4 : fonctionnaire (bonifications)
  if (input.careerType === 'simple_public') {
    add('bonifications_fp', 10)
  }

  // Facteur 5 : agriculteur (revalorisation Chassaigne)
  if (input.careerType === 'agricole') {
    add('revalorisation_agricole', 15)
  }

  // Facteur 6 : profession libérale (sections complexes)
  if (input.careerType === 'liberal') {
    add('liberal_sections', 15)
  }

  // Facteur 7 : génération ancienne
  if (input.birthYear < 1955) {
    add('generation_ancienne', 15)
  } else if (input.birthYear < 1965) {
    score += 8 // pas de facteur visible, juste un boost du score
  }

  // Facteur 8 : parcours réversion
  if (input.status === 'surviving') {
    add('reversion', 20)
  }

  // Cap à 100
  score = Math.min(100, score)

  // Niveau de risque
  let riskLevel: FlashRiskLevel
  if (score >= 50) riskLevel = 'TRES_ELEVE'
  else if (score >= 30) riskLevel = 'ELEVE'
  else if (score >= 15) riskLevel = 'MODERE'
  else riskLevel = 'FAIBLE'

  // Headline + subline
  const headlines: Record<FlashRiskLevel, string> = {
    TRES_ELEVE: `Votre profil présente un risque très élevé d'erreurs`,
    ELEVE: `Votre profil présente un risque élevé d'erreurs`,
    MODERE: `Votre profil présente un risque modéré d'erreurs`,
    FAIBLE: `Votre profil présente un risque faible d'erreurs`,
  }

  const sublines: Record<FlashRiskLevel, string> = {
    TRES_ELEVE: `${factors.length} facteurs de risque identifiés sur votre profil`,
    ELEVE: `${factors.length} facteurs de risque identifiés`,
    MODERE: `${factors.length} facteur${factors.length > 1 ? 's' : ''} de risque identifié${factors.length > 1 ? 's' : ''}`,
    FAIBLE: `La vérification reste recommandée : 1 pension sur 7 contient une erreur, tous profils confondus.`,
  }

  return {
    riskLevel,
    riskScore: score,
    factors,
    headline: headlines[riskLevel],
    subline: sublines[riskLevel],
  }
}

/**
 * Génère les textes personnalisés des facteurs pour l'affichage.
 */
export function getFactorTexts(factors: FlashRiskFactor[], input: FlashInput): Array<{ id: string; label: string; text: string }> {
  return factors.map(f => {
    const def = FACTOR_DEFS[f.id]
    return {
      id: f.id,
      label: def?.label ?? f.id,
      text: def?.getText(input) ?? '',
    }
  }).filter(f => f.text)
}
