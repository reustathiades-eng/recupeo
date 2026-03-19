// ============================================================
// MATAXE — Score de fiabilité du diagnostic
// ============================================================
// Bronze (40%) : caractéristiques du bien seules
// Argent (60%) : + montant de la taxe foncière
// Or (80%)     : + base nette d'imposition (taux réel déduit)
// Platine (95%): + formulaire 6675-M (données admin exactes)
// ============================================================
import type { MataxeFormData } from './types'

export type ReliabilityLevel = 'bronze' | 'argent' | 'or' | 'platine'

export interface ReliabilityInfo {
  level: ReliabilityLevel
  score: number                // 0-100
  label: string
  color: string                // tailwind color token
  description: string
  whatWeKnow: string[]         // ce qu'on peut affirmer
  whatWeDontKnow: string[]     // ce qu'on ne peut pas savoir
  nextStep: string | null      // comment améliorer
  nextStepGain: number | null  // score après amélioration
}

const LEVELS: Record<ReliabilityLevel, { min: number; label: string; color: string }> = {
  bronze:  { min: 0,  label: 'Estimation indicative', color: 'amber' },
  argent:  { min: 50, label: 'Estimation raisonnable', color: 'slate' },
  or:      { min: 68, label: 'Estimation précise', color: 'yellow' },
  platine: { min: 90, label: 'Audit quasi-exact', color: 'emerald' },
}

/**
 * Calcule le niveau de fiabilité en fonction des données fournies.
 */
export function computeReliability(data: MataxeFormData): ReliabilityInfo {
  const whatWeKnow: string[] = []
  const whatWeDontKnow: string[] = []
  let score = 0

  // ─── Caractéristiques du bien (toujours présentes) ───
  // Surface habitable → surface pondérée estimée
  score += 15
  whatWeKnow.push('Surface pondérée estimée (basée sur vos déclarations)')

  // Équipements → m² fictifs
  score += 10
  whatWeKnow.push('Équipements comptabilisés en m² fictifs (sanitaires, chauffage...)')

  // État du bien → coefficient d'entretien estimé
  score += 8
  whatWeKnow.push(`Coefficient d'entretien estimé (état ${data.propertyCondition})`)

  // Exonérations → critères objectifs
  if (data.ownerAge >= 65 || data.beneficiaryAspaAah) {
    score += 7
    whatWeKnow.push('Éligibilité aux exonérations/dégrèvements (âge, ASPA/AAH)')
  }

  // ─── Montant de la taxe (champ obligatoire) ───
  if (data.taxAmount > 0) {
    score += 15
    whatWeKnow.push(`Montant réel de votre taxe foncière (${data.taxAmount}€)`)
  }

  // ─── Base nette d'imposition (optionnel, GROS gain) ───
  if (data.baseNette && data.baseNette > 0) {
    score += 20
    whatWeKnow.push('Taux réel de votre commune (déduit de la base nette)')
    whatWeKnow.push('VLC retenue par l\'administration (base nette × 2)')
  } else {
    whatWeDontKnow.push('Le taux d\'imposition exact de votre commune (on utilise une moyenne nationale)')
    whatWeDontKnow.push('La VLC exacte retenue par l\'administration')
  }

  // ─── Données 6675-M (futur) ───
  if (data.has6675M) {
    score += 15
    whatWeKnow.push('Données exactes de l\'administration (formulaire 6675-M)')
  } else {
    whatWeDontKnow.push('Le tarif au m² exact de votre commune (fixé en 1970, variable localement)')
    whatWeDontKnow.push('Le coefficient de situation de votre rue')
    whatWeDontKnow.push('La catégorie cadastrale exacte retenue par l\'administration')
    whatWeDontKnow.push('La liste précise des équipements comptés par l\'administration')
  }

  // ─── Bonus petits : données supplémentaires qui affinent ───
  if (data.removedEquipment === 'oui' && data.removedEquipmentDetail) {
    score += 3
    whatWeKnow.push('Équipements supprimés identifiés')
  }

  if (data.vlcKnown && data.vlcAmount && data.vlcAmount > 0) {
    score += 5
    whatWeKnow.push('VLC connue par le propriétaire')
  }

  // Plafonner à 95 (100% impossible sans visite physique)
  score = Math.min(score, data.has6675M ? 95 : 80)

  // Déterminer le niveau
  let level: ReliabilityLevel = 'bronze'
  if (score >= 90) level = 'platine'
  else if (score >= 68) level = 'or'
  else if (score >= 50) level = 'argent'

  // Prochaine étape pour améliorer
  let nextStep: string | null = null
  let nextStepGain: number | null = null

  if (level === 'bronze') {
    nextStep = 'Renseignez le montant de votre taxe foncière pour améliorer la précision'
    nextStepGain = 60
  } else if (level === 'argent' && (!data.baseNette || data.baseNette <= 0)) {
    nextStep = 'Renseignez la "base nette" de votre avis de taxe foncière pour passer à 80% de fiabilité'
    nextStepGain = 80
  } else if (level === 'or' || (level === 'argent' && data.baseNette && data.baseNette > 0)) {
    nextStep = 'Demandez votre formulaire 6675-M aux impôts pour atteindre 95% de fiabilité'
    nextStepGain = 95
  }

  const info = LEVELS[level]

  return {
    level,
    score,
    label: info.label,
    color: info.color,
    description: getDescription(level),
    whatWeKnow,
    whatWeDontKnow,
    nextStep,
    nextStepGain,
  }
}

function getDescription(level: ReliabilityLevel): string {
  switch (level) {
    case 'bronze':
      return 'Nous détectons des indices d\'anomalies, mais l\'estimation financière est très approximative sans le montant de votre taxe.'
    case 'argent':
      return 'Nous estimons le pourcentage de réduction par anomalie. Le montant reste une fourchette car nous ne connaissons pas le taux exact de votre commune.'
    case 'or':
      return 'Avec le vrai taux de votre commune, notre estimation est précise à ±15-20%. Seul le formulaire 6675-M permettrait d\'affiner davantage.'
    case 'platine':
      return 'Nous comparons paramètre par paramètre avec les données exactes de l\'administration. Diagnostic fiable à ~95%.'
  }
}
