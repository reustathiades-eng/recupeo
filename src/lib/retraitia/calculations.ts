// ============================================================
// RETRAITIA — Calculs purs (déterministes, pas d'IA)
// ============================================================
import type { RetraitiaFormData, RetraitiaCalculations } from './types'
import {
  getRequirements,
  AGE_TAUX_PLEIN_AUTO,
  TAUX_PLEIN,
  DECOTE_PAR_TRIMESTRE,
  MAX_TRIMESTRES_DECOTE,
  MINIMUM_CONTRIBUTIF,
  MAJORATION_ENFANTS,
  ESPERANCE_VIE,
} from './constants'

/**
 * Effectue tous les calculs RETRAITIA à partir des données du formulaire.
 * Ces calculs sont 100% déterministes (pas d'IA).
 */
export function computeRetraitiaCalculations(data: RetraitiaFormData): RetraitiaCalculations {
  const birthDate = new Date(data.birthDate)
  const birthYear = birthDate.getFullYear()
  const birthMonth = birthDate.getMonth() + 1

  // ─── 1. Trimestres requis et âge légal ───
  const requirements = getRequirements(birthYear, birthMonth)
  const trimestresRequis = requirements.trimestres
  const ageLegalMois = requirements.ageLegalMois
  const ageLegal = ageLegalMois / 12 // ex: 64.0 ou 63.25

  // ─── 2. Trimestres manquants pour le taux plein ───
  const trimestresManquants = Math.max(0, trimestresRequis - data.totalTrimesters)

  // ─── 3. Taux théorique de la pension ───
  // Si taux plein : 50%. Sinon décote.
  // La décote est le minimum entre :
  // - nombre de trimestres manquants (vs durée requise)
  // - nombre de trimestres entre l'âge de départ et 67 ans
  // Plafonnée à 20 trimestres
  let decoteTrimestres = 0
  if (trimestresManquants > 0 && data.status === 'retired') {
    // Calcul de l'écart en trimestres par rapport à 67 ans
    const retirementDate = data.retirementDate ? new Date(data.retirementDate) : new Date()
    const ageAtRetirementMonths =
      (retirementDate.getFullYear() - birthYear) * 12 +
      (retirementDate.getMonth() - birthDate.getMonth())
    const ageAtRetirement67Diff = Math.max(0, (67 * 12 - ageAtRetirementMonths) / 3) // trimestres
    decoteTrimestres = Math.min(trimestresManquants, Math.ceil(ageAtRetirement67Diff), MAX_TRIMESTRES_DECOTE)
  } else if (trimestresManquants > 0) {
    // Actif : on estime la décote potentielle
    decoteTrimestres = Math.min(trimestresManquants, MAX_TRIMESTRES_DECOTE)
  }

  const tauxTheorique = TAUX_PLEIN - (decoteTrimestres * DECOTE_PAR_TRIMESTRE)

  // ─── 4. Estimation du montant de décote ───
  const pensionBase = data.status === 'retired'
    ? (data.basePension || 0)
    : (data.estimatedBasePension || 0)

  // La décote s'applique sur le taux → impact proportionnel
  const decoteMontant = pensionBase > 0 && decoteTrimestres > 0
    ? Math.round(pensionBase * (decoteTrimestres * DECOTE_PAR_TRIMESTRE / TAUX_PLEIN) * 100) / 100
    : 0

  // ─── 5. Majoration enfants ───
  const majorationEnfants = data.childrenCount >= MAJORATION_ENFANTS.seuilEnfants

  const pensionComplementaire = data.status === 'retired'
    ? (data.complementaryPension || 0)
    : (data.estimatedComplementaryPension || 0)

  let majorationMontant = 0
  if (majorationEnfants) {
    // +10% sur la pension de base
    const majBase = Math.round(pensionBase * MAJORATION_ENFANTS.tauxBase / 100 * 100) / 100
    // +10% plafonné sur Agirc-Arrco (simplifié)
    const majCompl = Math.round(
      pensionComplementaire * Math.min(
        MAJORATION_ENFANTS.tauxComplementaireParEnfant * (data.childrenCount - 2),
        MAJORATION_ENFANTS.plafondComplementaire
      ) / 100 * 100
    ) / 100
    majorationMontant = majBase + majCompl
  }

  // ─── 6. Minimum contributif ───
  const pensionTotaleDeclaree = pensionBase + pensionComplementaire
  const minimumContributifEligible =
    data.totalTrimesters >= trimestresRequis && // taux plein requis
    pensionBase < MINIMUM_CONTRIBUTIF.majore &&
    pensionTotaleDeclaree < MINIMUM_CONTRIBUTIF.plafond

  // ─── 7. Espérance de vie ───
  // On utilise l'âge légal pour estimer (simplifié)
  const esperanceBase = data.sex === 'M'
    ? (ageLegal >= 64 ? ESPERANCE_VIE.homme64 : ESPERANCE_VIE.homme62)
    : (ageLegal >= 64 ? ESPERANCE_VIE.femme64 : ESPERANCE_VIE.femme62)
  const esperanceVieRetraite = esperanceBase

  return {
    birthYear,
    trimestresRequis,
    ageLegal: Math.round(ageLegal * 100) / 100,
    ageTauxPlein: AGE_TAUX_PLEIN_AUTO,
    trimestresManquants,
    tauxTheorique: Math.round(tauxTheorique * 1000) / 1000,
    decoteParTrimestre: DECOTE_PAR_TRIMESTRE,
    decoteMontant,
    majorationEnfants,
    majorationMontant,
    minimumContributifEligible,
    esperanceVieRetraite,
    pensionTotaleDeclaree,
  }
}
