// ============================================================
// MATAXE — Calculs purs JS (surface pondérée, VLC, exonérations)
// ============================================================
// V2 : quand la base nette est fournie, on déduit le taux réel
//       et la VLC admin → diagnostic beaucoup plus précis
// ============================================================
import type { MataxeFormData, MataxeCalculations, CadastralCategory, ConditionRating } from './types'
import {
  EQUIPMENT_SQMETERS,
  DEPENDENCY_WEIGHTS,
  getCategoryInfo,
  getEntretienInfo,
  DEFAULT_COEFF_SITUATION,
  TAUX_MOYEN_COMMUNES,
  EXONERATION,
  RETROACTIVITE_ANNEES,
} from './constants'

// ─── Estimation de la catégorie cadastrale ───

function estimateCategory(data: MataxeFormData): CadastralCategory {
  let score = 0

  if (data.constructionYear >= 2010) score += 3
  else if (data.constructionYear >= 1990) score += 2
  else if (data.constructionYear >= 1970) score += 1
  else if (data.constructionYear < 1950) score -= 1

  const surfaceParPiece = data.roomCount > 0 ? data.surfaceHabitable / data.roomCount : data.surfaceHabitable
  if (surfaceParPiece > 25) score += 2
  else if (surfaceParPiece > 18) score += 1
  else if (surfaceParPiece < 12) score -= 1

  if (data.bathroomCount >= 2) score += 2
  else if (data.bathroomCount === 1) score += 1

  if (data.heating === 'central_collectif' || data.heating === 'central_individuel') score += 1
  if (data.elevator === 'oui') score += 1
  if (data.hasGarage) score += 1

  if (data.propertyCondition === 'tres_bon') score += 2
  else if (data.propertyCondition === 'bon') score += 1
  else if (data.propertyCondition === 'mediocre') score -= 1
  else if (data.propertyCondition === 'mauvais') score -= 2

  if (score >= 10) return 3
  if (score >= 7) return 4
  if (score >= 4) return 5
  if (score >= 1) return 6
  if (score >= -2) return 7
  return 8
}

// ─── Calcul des m² fictifs d'équipements ───

function computeEquipmentSqMeters(data: MataxeFormData): number {
  let sqm = 0

  sqm += data.bathroomCount * EQUIPMENT_SQMETERS.baignoire
  sqm += data.bathroomCount * EQUIPMENT_SQMETERS.lavabo
  sqm += data.wcCount * EQUIPMENT_SQMETERS.wc
  sqm += EQUIPMENT_SQMETERS.evier

  if (data.heating === 'central_collectif' || data.heating === 'central_individuel') {
    sqm += data.roomCount * EQUIPMENT_SQMETERS.chauffage_central_par_piece
  }

  if (data.elevator === 'oui') {
    sqm += data.roomCount * EQUIPMENT_SQMETERS.ascenseur_par_piece
  }

  sqm += EQUIPMENT_SQMETERS.electricite
  sqm += EQUIPMENT_SQMETERS.eau_courante
  sqm += EQUIPMENT_SQMETERS.tout_a_legout

  if (data.heating !== 'aucun' && data.heating !== 'individuel') {
    sqm += data.roomCount * EQUIPMENT_SQMETERS.gaz_par_piece
  }

  return sqm
}

// ─── Calcul des m² pondérés des dépendances ───

function computeDependencySqMeters(data: MataxeFormData): number {
  let sqm = 0

  if (data.hasGarage) {
    sqm += DEPENDENCY_WEIGHTS.garage.defaultSurface * DEPENDENCY_WEIGHTS.garage.coeff
  }

  if (data.hasCave) {
    sqm += DEPENDENCY_WEIGHTS.cave.defaultSurface * DEPENDENCY_WEIGHTS.cave.coeff
  }

  if (data.hasBalcony && data.balconySurface && data.balconySurface > 0) {
    sqm += data.balconySurface * DEPENDENCY_WEIGHTS.balcon.coeff
  }

  return Math.round(sqm * 100) / 100
}

// ─── Détection exonérations ───

function checkExonerations(data: MataxeFormData): {
  eligibleTotale: boolean
  eligiblePartielle: boolean
  motif: string | null
} {
  if (data.beneficiaryAspaAah && data.isMainResidence) {
    return {
      eligibleTotale: true,
      eligiblePartielle: false,
      motif: 'Bénéficiaire ASPA/AAH/ASI en résidence principale',
    }
  }

  if (data.ownerAge >= EXONERATION.ageTotale && data.isMainResidence) {
    return {
      eligibleTotale: true,
      eligiblePartielle: false,
      motif: `Propriétaire de ${data.ownerAge} ans (≥75 ans) en résidence principale`,
    }
  }

  if (data.ownerAge >= EXONERATION.agePartielleMin && data.ownerAge <= EXONERATION.agePartielleMax && data.isMainResidence) {
    return {
      eligibleTotale: false,
      eligiblePartielle: true,
      motif: `Propriétaire de ${data.ownerAge} ans (65-74 ans) en résidence principale — dégrèvement de ${EXONERATION.degrevementPartiel}€`,
    }
  }

  return { eligibleTotale: false, eligiblePartielle: false, motif: null }
}

// ─── Mapping état → coefficient d'entretien ───

function mapConditionToCoeff(propertyCondition: ConditionRating, buildingCondition: string): ConditionRating {
  if (buildingCondition === 'na' || buildingCondition === propertyCondition) {
    return propertyCondition
  }

  const order: ConditionRating[] = ['tres_bon', 'bon', 'passable', 'mediocre', 'mauvais']
  const propIdx = order.indexOf(propertyCondition)
  const buildIdx = buildingCondition === 'na' ? propIdx : order.indexOf(buildingCondition as ConditionRating)

  const avgIdx = Math.round(propIdx * 0.7 + buildIdx * 0.3)
  return order[Math.min(avgIdx, order.length - 1)]
}

// ─── Calcul principal ───

export function computeMataxeCalculations(data: MataxeFormData): MataxeCalculations {
  // 1. Surface pondérée
  const surfacePrincipale = data.surfaceHabitable
  const surfaceEquipements = computeEquipmentSqMeters(data)
  const surfaceDependances = computeDependencySqMeters(data)
  const surfacePondereeEstimee = Math.round((surfacePrincipale + surfaceEquipements + surfaceDependances) * 100) / 100

  // 2. Catégorie estimée
  const categorieEstimee = estimateCategory(data)
  const catInfo = getCategoryInfo(categorieEstimee)

  // 3. Coefficient d'entretien
  const conditionEffective = mapConditionToCoeff(data.propertyCondition, data.buildingCondition)
  const entretienInfo = getEntretienInfo(conditionEffective)

  // 4. VLC estimée (notre calcul théorique)
  const tarifCategorie = catInfo.tarifMoyenM2
  const vlcEstimee = Math.round(
    surfacePondereeEstimee * tarifCategorie * entretienInfo.coefficient * DEFAULT_COEFF_SITUATION
  )
  const baseImposition = Math.round(vlcEstimee * 0.50)

  // ─── 5. BASE NETTE : taux réel + VLC admin ───
  const baseNetteDisponible = !!(data.baseNette && data.baseNette > 0)
  let tauxReelCommune: number | null = null
  let vlcAdminDeduite: number | null = null
  let ecartVlcPrecis: number | null = null

  if (baseNetteDisponible && data.baseNette && data.taxAmount > 0) {
    // Taux réel = taxe / base nette
    tauxReelCommune = Math.round((data.taxAmount / data.baseNette) * 10000) / 10000
    // VLC admin = base nette × 2 (car base = VLC × 50%)
    vlcAdminDeduite = Math.round(data.baseNette * 2)
    // Écart précis entre notre estimation et la VLC admin
    if (vlcEstimee > 0) {
      ecartVlcPrecis = Math.round(((vlcAdminDeduite - vlcEstimee) / vlcEstimee) * 100 * 10) / 10
    }
  }

  // 6. Comparaison VLC si saisie manuellement
  const vlcDeclaree = data.vlcKnown && data.vlcAmount ? data.vlcAmount : vlcAdminDeduite
  let ecartVlc: number | null = ecartVlcPrecis
  if (!ecartVlc && vlcDeclaree && vlcEstimee > 0) {
    ecartVlc = Math.round(((vlcDeclaree - vlcEstimee) / vlcEstimee) * 100 * 10) / 10
  }

  // 7. Exonérations
  const exo = checkExonerations(data)

  // ─── 8. Estimation de la taxe théorique ───
  // Si on a le taux réel → calcul précis
  // Sinon → moyenne nationale (moins fiable)
  const tauxUtilise = tauxReelCommune || TAUX_MOYEN_COMMUNES
  let taxeEstimee = Math.round(baseImposition * tauxUtilise)

  // Appliquer exonérations
  if (exo.eligibleTotale) {
    taxeEstimee = 0
  } else if (exo.eligiblePartielle) {
    taxeEstimee = Math.max(0, taxeEstimee - EXONERATION.degrevementPartiel)
  }

  // 9. Écart avec la taxe payée
  const ecartTaxe = Math.round(data.taxAmount - taxeEstimee)
  const ecartTaxePct = taxeEstimee > 0
    ? Math.round((ecartTaxe / taxeEstimee) * 100 * 10) / 10
    : (ecartTaxe > 0 ? 100 : 0)
  const remboursement4ans = Math.max(0, ecartTaxe * RETROACTIVITE_ANNEES)

  return {
    surfacePrincipale,
    surfaceEquipements,
    surfaceDependances,
    surfacePondereeEstimee,
    categorieEstimee,
    categorieLabel: catInfo.label,
    coeffEntretien: entretienInfo.coefficient,
    coeffEntretienLabel: entretienInfo.label,
    tarifCategorie,
    vlcEstimee,
    baseImposition,
    vlcDeclaree,
    ecartVlc,
    eligibleExonerationTotale: exo.eligibleTotale,
    eligibleExonerationPartielle: exo.eligiblePartielle,
    exonerationMotif: exo.motif,
    taxeEstimee,
    ecartTaxe,
    ecartTaxePct,
    remboursement4ans,

    // V2 — Données déduites de la base nette
    baseNetteDisponible,
    tauxReelCommune,
    vlcAdminDeduite,
    ecartVlcPrecis,
  }
}
