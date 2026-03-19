// ============================================================
// MATAXE — Détection d'anomalies en JS pur (avant appel Claude)
// V2 : confidence + confirmableWith par anomalie
// ============================================================
import type { MataxeFormData, MataxeCalculations, MataxeAnomaly, AnomalySeverity } from './types'
import { EXONERATION } from './constants'

/**
 * Détecte les anomalies potentielles à partir du formulaire et des calculs.
 * Chaque anomalie a un score de confiance (0-100) et indique
 * ce qui permettrait de la confirmer.
 */
export function detectAnomalies(
  data: MataxeFormData,
  calc: MataxeCalculations
): MataxeAnomaly[] {
  const anomalies: MataxeAnomaly[] = []

  anomalies.push(...checkCoefficientEntretien(data, calc))
  anomalies.push(...checkEquipementsSupprimes(data, calc))
  anomalies.push(...checkSurfacePonderee(data, calc))
  anomalies.push(...checkCategorieSurevaluee(data, calc))
  anomalies.push(...checkDependancesFictives(data, calc))
  anomalies.push(...checkExonerationManquante(data, calc))

  return anomalies
}

// ─── Helpers ───

/** Le taux utilisé pour chiffrer l'impact : réel si dispo, sinon proportionnel à la taxe */
function computeImpactFromPct(pct: number, data: MataxeFormData): { min: number; max: number } {
  // On applique le % directement à la taxe payée
  // C'est plus fiable que de recalculer via un taux moyen
  return {
    min: Math.round(data.taxAmount * pct * 0.5),
    max: Math.round(data.taxAmount * pct),
  }
}

/** Bonus de confiance si la base nette est disponible */
function baseNetteBonus(calc: MataxeCalculations): number {
  return calc.baseNetteDisponible ? 15 : 0
}

// ─── Règle 1 : Coefficient d'entretien ───

function checkCoefficientEntretien(
  data: MataxeFormData,
  calc: MataxeCalculations
): MataxeAnomaly[] {
  const conditionsAnomalie = ['passable', 'mediocre', 'mauvais']
  if (!conditionsAnomalie.includes(data.propertyCondition)) return []

  const coeffReel = calc.coeffEntretien
  const coeffProbableAdmin = 1.10

  if (coeffReel >= coeffProbableAdmin) return []

  const ecartCoeff = coeffProbableAdmin - coeffReel
  const impactPct = ecartCoeff / coeffProbableAdmin
  const impact = computeImpactFromPct(impactPct, data)

  if (impact.min < 10) return []

  let severity: AnomalySeverity = 'to_verify'
  let confidence = 55
  if (data.propertyCondition === 'mauvais') {
    severity = 'probable'
    confidence = 75
  } else if (data.propertyCondition === 'mediocre') {
    severity = 'probable'
    confidence = 65
  }

  confidence += baseNetteBonus(calc)

  return [{
    type: 'coefficient_entretien',
    severity,
    title: 'Coefficient d\'entretien probablement surévalué',
    summary: `Votre logement est en état ${calc.coeffEntretienLabel.toLowerCase()} (coeff. ${coeffReel}), mais l'administration applique souvent un coefficient plus élevé (1,10 ou 1,20). Cet écart peut représenter ${impact.min}–${impact.max}€/an.`,
    detail: `L'état réel de votre logement (${calc.coeffEntretienLabel.toLowerCase()}) correspond à un coefficient d'entretien de ${coeffReel}, alors que l'administration utilise fréquemment un coefficient de ${coeffProbableAdmin} par défaut. Cette surévaluation de ${Math.round(ecartCoeff * 100)}% se répercute directement sur la valeur locative cadastrale et donc sur votre taxe foncière. L'écart estimé est de ${impact.min} à ${impact.max}€ par an.`,
    impactAnnualMin: impact.min,
    impactAnnualMax: impact.max,
    confidence: Math.min(confidence, 90),
    confirmableWith: 'Formulaire 6675-M (coefficient d\'entretien exact retenu par l\'administration)',
    legalReference: 'CGI art. 1496, BOI-IF-TFB-20-10-50',
  }]
}

// ─── Règle 2 : Équipements supprimés ───

function checkEquipementsSupprimes(
  data: MataxeFormData,
  calc: MataxeCalculations
): MataxeAnomaly[] {
  if (data.removedEquipment !== 'oui') return []

  const impact = computeImpactFromPct(0.04, data) // ~4% impact typique
  const detail = data.removedEquipmentDetail
    ? `Équipements déclarés comme supprimés : ${data.removedEquipmentDetail}. `
    : ''

  return [{
    type: 'equipements_supprimes',
    severity: 'probable',
    title: 'Équipements supprimés encore comptabilisés',
    summary: `Des équipements ont été supprimés de votre logement mais sont probablement encore pris en compte dans le calcul des m² fictifs. Impact estimé : ${impact.min}–${impact.max}€/an.`,
    detail: `${detail}Lorsqu'un équipement est supprimé (salle de bain, baignoire, cheminée...), les m² fictifs correspondants doivent être retirés de la surface pondérée. Une baignoire supprimée = -3m², une douche = -2m², un WC = -1m². L'administration ne met jamais à jour ces données automatiquement.`,
    impactAnnualMin: impact.min,
    impactAnnualMax: impact.max,
    confidence: 70 + baseNetteBonus(calc),
    confirmableWith: 'Formulaire 6675-M (liste exacte des équipements comptés)',
    legalReference: 'CGI art. 1496-I, BOI-IF-TFB-20-10-50-20',
  }]
}

// ─── Règle 3 : Surface pondérée ───

function checkSurfacePonderee(
  data: MataxeFormData,
  calc: MataxeCalculations
): MataxeAnomaly[] {
  // On peut vérifier si on a la VLC admin (via base nette ou saisie)
  if (!calc.vlcDeclaree || !calc.ecartVlc) return []
  if (calc.ecartVlc < 15) return []

  const impactPct = Math.min(calc.ecartVlc / 100, 0.50)
  const impact = computeImpactFromPct(impactPct * 0.6, data)

  // Confiance plus haute si base nette dispo (VLC admin certaine)
  let confidence = calc.baseNetteDisponible ? 80 : 55

  return [{
    type: 'surface_ponderee',
    severity: calc.ecartVlc > 30 ? 'probable' : 'to_verify',
    title: 'Surface pondérée potentiellement incorrecte',
    summary: `La VLC de l'administration (${calc.vlcDeclaree}€) dépasse notre estimation de ${calc.ecartVlc}%. ${calc.baseNetteDisponible ? 'Cet écart est confirmé par votre base nette.' : 'Cet écart reste à confirmer avec le 6675-M.'}`,
    detail: `Notre estimation de la valeur locative cadastrale est de ${calc.vlcEstimee}€, basée sur une surface pondérée de ${calc.surfacePondereeEstimee} m². L'administration retient une VLC de ${calc.vlcDeclaree}€, soit un écart de +${calc.ecartVlc}%. ${calc.baseNetteDisponible ? 'Ce chiffre est fiable car déduit de votre base nette d\'imposition réelle.' : 'Ce chiffre est basé sur des moyennes nationales et devrait être confirmé avec le formulaire 6675-M.'}`,
    impactAnnualMin: impact.min,
    impactAnnualMax: impact.max,
    confidence: Math.min(confidence, 90),
    confirmableWith: calc.baseNetteDisponible
      ? 'Formulaire 6675-M (détail surface pondérée vs notre estimation)'
      : 'Base nette de votre avis TF (pour confirmer la VLC) + formulaire 6675-M (pour le détail)',
    legalReference: 'CGI art. 1496, BOI-IF-TFB-20-10-50-10',
  }]
}

// ─── Règle 4 : Catégorie surévaluée ───

function checkCategorieSurevaluee(
  data: MataxeFormData,
  calc: MataxeCalculations
): MataxeAnomaly[] {
  if (calc.ecartTaxePct < 25) return []
  if (data.constructionYear > 1985) return []

  const impact = computeImpactFromPct(0.25, data)

  return [{
    type: 'categorie_surevaluee',
    severity: data.constructionYear < 1960 ? 'probable' : 'to_verify',
    title: 'Catégorie cadastrale potentiellement surévaluée',
    summary: `Votre bien date de ${data.constructionYear}. Les catégories cadastrales n'ont pas été révisées depuis 1970 et ne reflètent souvent plus la réalité.`,
    detail: `Les catégories cadastrales ont été fixées lors de la révision générale de 1970. Notre estimation situe votre bien en catégorie ${calc.categorieEstimee} (${calc.categorieLabel}). Si l'administration applique une catégorie supérieure, le tarif au m² est plus élevé, gonflant la VLC et donc la taxe.`,
    impactAnnualMin: impact.min,
    impactAnnualMax: impact.max,
    confidence: 40 + baseNetteBonus(calc),
    confirmableWith: 'Formulaire 6675-M (catégorie exacte retenue par l\'administration)',
    legalReference: 'CGI art. 1497-1498, BOI-IF-TFB-20-10-40',
  }]
}

// ─── Règle 5 : Dépendances fictives ───

function checkDependancesFictives(
  data: MataxeFormData,
  calc: MataxeCalculations
): MataxeAnomaly[] {
  if (data.propertyType !== 'appartement') return []
  if (data.hasGarage || data.hasCave) return []
  if (calc.ecartTaxePct < 20) return []

  return [{
    type: 'dependances_fictives',
    severity: 'to_verify',
    title: 'Dépendances éventuellement comptées à tort',
    summary: `Vous déclarez n'avoir ni garage ni cave, mais l'écart de taxe (${calc.ecartTaxePct}%) suggère que l'administration pourrait compter des dépendances inexistantes.`,
    detail: `Dans les immeubles en copropriété, il arrive que l'administration attribue par erreur des dépendances à des lots qui n'en disposent pas, suite à des erreurs de numérotation. L'écart de ${calc.ecartTaxePct}% pourrait indiquer que des m² de dépendances sont comptés à tort.`,
    impactAnnualMin: 50,
    impactAnnualMax: 200,
    confidence: 35 + baseNetteBonus(calc),
    confirmableWith: 'Formulaire 6675-M (liste des dépendances rattachées à votre lot)',
    legalReference: 'CGI art. 1496-II, BOI-IF-TFB-20-10-50-30',
  }]
}

// ─── Règle 6 : Exonération non appliquée ───

function checkExonerationManquante(
  data: MataxeFormData,
  calc: MataxeCalculations
): MataxeAnomaly[] {
  if (!calc.eligibleExonerationTotale && !calc.eligibleExonerationPartielle) return []
  if (data.taxAmount <= 0) return []

  if (calc.eligibleExonerationTotale) {
    return [{
      type: 'exoneration_manquante',
      severity: 'probable',
      title: 'Exonération totale potentiellement non appliquée',
      summary: `${calc.exonerationMotif}. Vous pourriez être totalement exonéré de taxe foncière (sous condition de revenu fiscal).`,
      detail: `En tant que ${calc.exonerationMotif?.toLowerCase()}, vous pouvez bénéficier d'une exonération totale de taxe foncière, sous condition que votre revenu fiscal de référence (RFR) ne dépasse pas ${EXONERATION.plafondRfr1Part}€ pour 1 part. Si votre RFR est sous ce plafond, l'exonération n'est pas appliquée et vous pouvez réclamer le remboursement.`,
      impactAnnualMin: Math.round(data.taxAmount * 0.80),
      impactAnnualMax: data.taxAmount,
      confidence: 85, // critères objectifs, seul le RFR manque
      confirmableWith: 'Votre avis d\'impôt sur le revenu (pour vérifier le RFR)',
      legalReference: 'CGI art. 1390-1391, BOI-IF-TFB-10-50',
    }]
  }

  if (calc.eligibleExonerationPartielle) {
    return [{
      type: 'exoneration_manquante',
      severity: 'to_verify',
      title: 'Dégrèvement partiel potentiellement non appliqué',
      summary: `${calc.exonerationMotif}. Un dégrèvement de ${EXONERATION.degrevementPartiel}€ pourrait ne pas être appliqué.`,
      detail: `En tant que propriétaire de ${data.ownerAge} ans en résidence principale, vous avez droit à un dégrèvement d'office de ${EXONERATION.degrevementPartiel}€ sur votre taxe foncière (sous condition de revenu fiscal). Vérifiez sur votre avis si la mention "dégrèvement" apparaît.`,
      impactAnnualMin: EXONERATION.degrevementPartiel,
      impactAnnualMax: EXONERATION.degrevementPartiel,
      confidence: 80,
      confirmableWith: 'Votre avis de taxe foncière (vérifier si le dégrèvement est mentionné)',
      legalReference: 'CGI art. 1391, BOI-IF-TFB-10-50-20',
    }]
  }

  return []
}
