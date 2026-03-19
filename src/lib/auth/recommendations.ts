// ============================================================
// RÉCUPÉO — Cross-sell intelligent
// ============================================================
// Recommande des briques en fonction du profil utilisateur
// et des briques déjà utilisées.
// ============================================================

import type { UserProfile } from './types'

interface Recommendation {
  brique: string
  slug: string
  reason: string
  priority: number
}

const BRIQUE_LABELS: Record<string, string> = {
  macaution: 'MACAUTION — Dépôt de garantie',
  monloyer: 'MONLOYER — Encadrement des loyers',
  retraitia: 'RETRAITIA — Audit retraite',
  mataxe: 'MATAXE — Taxe foncière',
  mapension: 'MAPENSION — Pension alimentaire',
  mabanque: 'MABANQUE — Frais bancaires',
  monimpot: 'MONIMPOT — Déclaration revenus',
  monchomage: 'MONCHOMAGE — Allocations chômage',
}

/**
 * Retourne les briques recommandées pour un utilisateur,
 * triées par priorité décroissante.
 */
export function getRecommendations(
  usedBriques: string[],
  profile?: UserProfile
): Recommendation[] {
  const recommendations: Recommendation[] = []
  const used = new Set(usedBriques)

  // Règles basées sur les briques déjà utilisées
  const crossSellRules: Record<string, Array<{ brique: string; reason: string; priority: number }>> = {
    mataxe: [
      { brique: 'macaution', reason: 'Propriétaire ? Vérifiez aussi votre caution', priority: 8 },
      { brique: 'monloyer', reason: 'Bailleur ? Vérifiez l\'encadrement des loyers', priority: 7 },
    ],
    monloyer: [
      { brique: 'macaution', reason: 'Locataire ? Récupérez votre dépôt de garantie', priority: 9 },
      { brique: 'mabanque', reason: 'Vérifiez aussi vos frais bancaires', priority: 6 },
    ],
    retraitia: [
      { brique: 'mapension', reason: 'Retraité ? Vérifiez aussi votre pension alimentaire', priority: 8 },
      { brique: 'mabanque', reason: 'Vérifiez vos frais bancaires accumulés', priority: 6 },
    ],
    monchomage: [
      { brique: 'mabanque', reason: 'Demandeur d\'emploi ? Réduisez vos frais bancaires', priority: 8 },
      { brique: 'monloyer', reason: 'Vérifiez si votre loyer est conforme', priority: 7 },
    ],
    mabanque: [
      { brique: 'mataxe', reason: 'Propriétaire ? Vérifiez votre taxe foncière', priority: 7 },
      { brique: 'monloyer', reason: 'Locataire ? Vérifiez l\'encadrement des loyers', priority: 7 },
    ],
    macaution: [
      { brique: 'monloyer', reason: 'Vérifiez aussi l\'encadrement de votre loyer', priority: 8 },
      { brique: 'mabanque', reason: 'Optimisez vos frais bancaires', priority: 5 },
    ],
    monimpot: [
      { brique: 'mataxe', reason: 'Propriétaire ? Vérifiez aussi votre taxe foncière', priority: 7 },
      { brique: 'mabanque', reason: 'Vérifiez aussi vos frais bancaires', priority: 5 },
    ],
    mapension: [
      { brique: 'retraitia', reason: 'Vérifiez votre pension de retraite', priority: 7 },
      { brique: 'mataxe', reason: 'Propriétaire ? Vérifiez votre taxe foncière', priority: 6 },
    ],
  }

  // Appliquer les règles de cross-sell
  for (const usedBrique of usedBriques) {
    const rules = crossSellRules[usedBrique] || []
    for (const rule of rules) {
      if (!used.has(rule.brique)) {
        const exists = recommendations.find(r => r.brique === rule.brique)
        if (!exists) {
          recommendations.push({
            brique: BRIQUE_LABELS[rule.brique] || rule.brique,
            slug: rule.brique,
            reason: rule.reason,
            priority: rule.priority,
          })
        }
      }
    }
  }

  // Règles basées sur le profil
  if (profile) {
    if (profile.isRetired && !used.has('retraitia')) {
      recommendations.push({ brique: BRIQUE_LABELS.retraitia, slug: 'retraitia', reason: 'Retraité ? Vérifiez votre pension', priority: 9 })
    }
    if (profile.isTenant && !used.has('monloyer')) {
      recommendations.push({ brique: BRIQUE_LABELS.monloyer, slug: 'monloyer', reason: 'Locataire ? Vérifiez l\'encadrement', priority: 9 })
    }
    if (profile.isOwner && !used.has('mataxe')) {
      recommendations.push({ brique: BRIQUE_LABELS.mataxe, slug: 'mataxe', reason: 'Propriétaire ? Vérifiez votre taxe foncière', priority: 9 })
    }
    if (profile.isDivorced && !used.has('mapension')) {
      recommendations.push({ brique: BRIQUE_LABELS.mapension, slug: 'mapension', reason: 'Divorcé(e) ? Vérifiez votre pension', priority: 9 })
    }
    if (profile.isJobSeeker && !used.has('monchomage')) {
      recommendations.push({ brique: BRIQUE_LABELS.monchomage, slug: 'monchomage', reason: 'En recherche d\'emploi ? Vérifiez vos allocations', priority: 9 })
    }
  }

  // Si aucune brique utilisée, recommander les plus populaires
  if (usedBriques.length === 0 && recommendations.length === 0) {
    const defaults = ['mataxe', 'monloyer', 'mabanque']
    for (const b of defaults) {
      recommendations.push({
        brique: BRIQUE_LABELS[b],
        slug: b,
        reason: 'Commencez votre premier diagnostic',
        priority: 5,
      })
    }
  }

  // Trier par priorité décroissante, dédupliquer
  const seen = new Set<string>()
  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .filter(r => {
      if (seen.has(r.slug)) return false
      seen.add(r.slug)
      return true
    })
    .slice(0, 3)
}
