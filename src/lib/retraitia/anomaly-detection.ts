// ============================================================
// RETRAITIA — Détection d'anomalies en JS pur (avant appel Claude)
// ============================================================
import type { RetraitiaFormData, RetraitiaCalculations, RetraitiaAnomaly } from './types'
import { MINIMUM_CONTRIBUTIF, MAJORATION_ENFANTS } from './constants'

/**
 * Détecte les anomalies potentielles à partir du formulaire et des calculs.
 * Exécuté AVANT l'appel Claude (pré-filtrage + fallback).
 */
export function detectAnomalies(
  data: RetraitiaFormData,
  calc: RetraitiaCalculations
): RetraitiaAnomaly[] {
  const anomalies: RetraitiaAnomaly[] = []

  // ─── 1. Trimestres manquants ───
  // Si la durée théorique de carrière (depuis l'âge de début) devrait donner plus de trimestres
  const currentYear = new Date().getFullYear()
  const ageActuel = currentYear - calc.birthYear
  const anneesTravailTheorique = Math.max(0, ageActuel - data.careerStartAge)
  const trimestresTheorique = anneesTravailTheorique * 4

  if (data.totalTrimesters < trimestresTheorique * 0.85 && anneesTravailTheorique > 5) {
    const ecart = trimestresTheorique - data.totalTrimesters
    // Impact : chaque trimestre manquant peut réduire la pension
    const impactParTrimestre = calc.pensionTotaleDeclaree > 0
      ? calc.pensionTotaleDeclaree / calc.trimestresRequis
      : 5 // estimation par défaut €/mois/trimestre
    anomalies.push({
      type: 'trimestres_manquants',
      severity: 'probable',
      title: 'Trimestres cotisés potentiellement manquants',
      summary: `Avec ${anneesTravailTheorique} ans de carrière, vous devriez avoir ~${trimestresTheorique} trimestres, mais vous n'en déclarez que ${data.totalTrimesters}. Des périodes d'emploi pourraient ne pas être reportées.`,
      detail: `Écart de ~${ecart} trimestres entre la durée théorique de carrière et les trimestres validés. Ce type d'anomalie est fréquent : emplois saisonniers, CDD courts, multi-employeurs, erreurs de report des caisses.`,
      impactMonthlyMin: Math.round(impactParTrimestre * Math.floor(ecart * 0.3)),
      impactMonthlyMax: Math.round(impactParTrimestre * ecart),
      documentsNeeded: ['Relevé Individuel de Situation (RIS)', 'Bulletins de salaire des périodes concernées'],
      legalReference: 'Art. L351-1 Code de la Sécurité Sociale',
    })
  }

  // ─── 2. Service militaire non comptabilisé ───
  if (data.militaryService === 'yes' && data.militaryReported !== 'yes') {
    const trimestresMilitaires = Math.ceil((data.militaryDuration || 12) / 3)
    const impactParTrimestre = calc.pensionTotaleDeclaree > 0
      ? calc.pensionTotaleDeclaree / calc.trimestresRequis
      : 5
    anomalies.push({
      type: 'service_militaire',
      severity: data.militaryReported === 'no' ? 'confirmed' : 'to_verify',
      title: 'Service militaire non comptabilisé',
      summary: `Votre service militaire de ${data.militaryDuration || 12} mois (= ${trimestresMilitaires} trimestres) pourrait ne pas être reporté sur votre relevé de carrière.`,
      detail: `Le service national donne droit à des trimestres assimilés (1 trimestre par 90 jours). ${trimestresMilitaires} trimestre(s) pour ${data.militaryDuration || 12} mois. Ces trimestres sont souvent absents du relevé si la demande n'a pas été faite.`,
      impactMonthlyMin: Math.round(impactParTrimestre * trimestresMilitaires * 0.5),
      impactMonthlyMax: Math.round(impactParTrimestre * trimestresMilitaires),
      documentsNeeded: ['État signalétique et des services (ESS)', 'Livret militaire'],
      legalReference: 'Art. L351-3 2° Code de la Sécurité Sociale',
    })
  }

  // ─── 3. Chômage / maladie non reportés ───
  if (data.unemploymentPeriods === 'yes' && data.unemploymentDuration && data.unemploymentDuration > 6) {
    const trimestresChomage = Math.floor(data.unemploymentDuration / 3) // 1 par 50j indemnisés ≈ 1/trimestre
    anomalies.push({
      type: 'chomage_maladie',
      severity: 'to_verify',
      title: 'Périodes de chômage / maladie à vérifier',
      summary: `${data.unemploymentDuration} mois de chômage déclarés. Ces périodes donnent droit à des trimestres assimilés qui sont parfois oubliés.`,
      detail: `Le chômage indemnisé donne 1 trimestre par période de 50 jours d'indemnisation. Sur ${data.unemploymentDuration} mois, vous pourriez avoir droit à ~${trimestresChomage} trimestres assimilés. Vérifiez qu'ils figurent sur votre RIS.`,
      impactMonthlyMin: 10,
      impactMonthlyMax: Math.round(trimestresChomage * 8),
      documentsNeeded: ['Attestations Pôle Emploi / France Travail', 'Relevé Individuel de Situation (RIS)'],
      legalReference: 'Art. L351-3 3° Code de la Sécurité Sociale',
    })
  }

  // Maternité / maladie longue durée
  if (data.maternityOrSickness === 'yes' && data.maternityCount && data.maternityCount > 0) {
    anomalies.push({
      type: 'chomage_maladie',
      severity: 'to_verify',
      title: 'Congés maternité / maladie longue durée à vérifier',
      summary: `${data.maternityCount} période(s) de congé maternité ou maladie longue durée déclarée(s). Ces périodes donnent droit à des trimestres assimilés.`,
      detail: `Chaque congé maternité donne 1 trimestre assimilé par période de 90 jours d'indemnisation. Les congés maladie longue durée (>60 jours consécutifs) aussi. À vérifier sur le RIS.`,
      impactMonthlyMin: 5,
      impactMonthlyMax: Math.round(data.maternityCount * 10),
      documentsNeeded: ['Relevé Individuel de Situation (RIS)', 'Attestations CPAM'],
      legalReference: 'Art. L351-3 4° Code de la Sécurité Sociale',
    })
  }

  // ─── 4. Majoration enfants non appliquée ───
  if (data.childrenCount >= MAJORATION_ENFANTS.seuilEnfants && data.hasChildrenBonus !== 'yes') {
    anomalies.push({
      type: 'majoration_enfants',
      severity: data.hasChildrenBonus === 'no' ? 'confirmed' : 'to_verify',
      title: 'Majoration pour enfants non appliquée',
      summary: `Avec ${data.childrenCount} enfants élevés, vous avez droit à une majoration de +10% sur votre pension de base. ${data.hasChildrenBonus === 'no' ? "Elle n'est pas appliquée." : 'Vérifiez qu\'elle est bien appliquée.'}`,
      detail: `La majoration pour 3 enfants ou plus est de +10% sur la pension de base CNAV (art. L351-12) et jusqu'à +10% sur l'Agirc-Arrco. Impact estimé : ${calc.majorationMontant > 0 ? calc.majorationMontant + '€/mois' : 'à calculer avec les montants exacts'}.`,
      impactMonthlyMin: Math.max(30, Math.round(calc.majorationMontant * 0.5)),
      impactMonthlyMax: Math.max(80, Math.round(calc.majorationMontant * 1.2)),
      documentsNeeded: ['Notification de retraite CNAV', 'Livret de famille'],
      legalReference: 'Art. L351-12 Code de la Sécurité Sociale',
    })
  }

  // ─── 5. Points Agirc-Arrco potentiellement manquants ───
  if (
    data.regimes.includes('cnav') &&
    data.status === 'retired' &&
    data.complementaryPension !== undefined &&
    data.basePension !== undefined &&
    data.basePension > 0
  ) {
    // Ratio complémentaire / base typique : 40-60%. Si < 30%, anomalie probable.
    const ratio = data.complementaryPension / data.basePension
    if (ratio < 0.30) {
      anomalies.push({
        type: 'points_complementaire',
        severity: 'probable',
        title: 'Pension complémentaire anormalement basse',
        summary: `Votre pension complémentaire (${data.complementaryPension}€) représente ${Math.round(ratio * 100)}% de votre pension de base, contre 40-60% en moyenne. Des points pourraient manquer.`,
        detail: `Le ratio pension complémentaire / pension de base est inhabituellement bas (${Math.round(ratio * 100)}% vs 40-60% habituels). Cela peut indiquer des points Agirc-Arrco non reportés (changement d'employeur, fusion de caisses, erreur de report).`,
        impactMonthlyMin: Math.round(data.basePension * 0.10),
        impactMonthlyMax: Math.round(data.basePension * 0.25),
        documentsNeeded: ['Relevé de points Agirc-Arrco', 'Bulletins de salaire'],
        legalReference: 'Accord National Interprofessionnel du 17/11/2017',
      })
    }
  }

  // ─── 6. Décote potentiellement erronée ───
  if (data.hasDecote === 'yes' && calc.trimestresManquants === 0) {
    anomalies.push({
      type: 'decote_erreur',
      severity: 'probable',
      title: 'Décote potentiellement injustifiée',
      summary: `Vous déclarez avoir une décote, mais avec ${data.totalTrimesters} trimestres validés, vous semblez remplir les conditions du taux plein (${calc.trimestresRequis} requis).`,
      detail: `Attention : si vous avez cotisé dans plusieurs régimes, les trimestres de tous les régimes se cumulent pour le taux plein. Vérifiez que la CNAV a bien pris en compte les trimestres des autres régimes (polypensionné).`,
      impactMonthlyMin: Math.round(calc.decoteMontant * 0.5),
      impactMonthlyMax: Math.round(calc.decoteMontant),
      documentsNeeded: ['Notification de retraite CNAV', 'RIS tous régimes'],
      legalReference: 'Art. L351-1-1 Code de la Sécurité Sociale',
    })
  }

  // ─── 7. Minimum contributif non appliqué ───
  if (calc.minimumContributifEligible && data.status === 'retired') {
    const pensionBase = data.basePension || 0
    const minimumApplicable = data.cotisedTrimesters >= MINIMUM_CONTRIBUTIF.seuilTrimestresCotises
      ? MINIMUM_CONTRIBUTIF.majore
      : MINIMUM_CONTRIBUTIF.base
    const ecart = Math.max(0, minimumApplicable - pensionBase)
    if (ecart > 10) {
      anomalies.push({
        type: 'minimum_contributif',
        severity: 'probable',
        title: 'Minimum contributif potentiellement non appliqué',
        summary: `Votre pension de base (${pensionBase}€) est inférieure au minimum contributif${data.cotisedTrimesters >= 120 ? ' majoré' : ''} (${minimumApplicable}€). Un complément de ${Math.round(ecart)}€/mois pourrait vous être dû.`,
        detail: `Le minimum contributif porte la pension au minimum de ${MINIMUM_CONTRIBUTIF.base}€ (base) ou ${MINIMUM_CONTRIBUTIF.majore}€ (majoré si 120+ trimestres cotisés), sous condition que le total des pensions ne dépasse pas ${MINIMUM_CONTRIBUTIF.plafond}€/mois.`,
        impactMonthlyMin: Math.round(ecart * 0.5),
        impactMonthlyMax: Math.round(ecart),
        documentsNeeded: ['Notification de retraite CNAV'],
        legalReference: 'Art. L351-10 Code de la Sécurité Sociale',
      })
    }
  }

  // ─── 8. Optimisation de la date de départ (actifs uniquement) ───
  if (data.status === 'active' && calc.trimestresManquants > 0 && calc.trimestresManquants <= 8) {
    anomalies.push({
      type: 'optimisation_depart',
      severity: 'to_verify',
      title: 'Date de départ optimisable',
      summary: `Il vous manque ${calc.trimestresManquants} trimestre(s) pour le taux plein. Reporter votre départ de ${calc.trimestresManquants} trimestre(s) (~${Math.ceil(calc.trimestresManquants / 4)} an(s)) éviterait la décote.`,
      detail: `Avec ${data.totalTrimesters} trimestres sur ${calc.trimestresRequis} requis, un report de ${calc.trimestresManquants} trimestre(s) permettrait d'obtenir le taux plein (50%) et potentiellement une surcote si vous continuez au-delà (+1,25%/trimestre).`,
      impactMonthlyMin: Math.round(calc.decoteMontant * 0.8),
      impactMonthlyMax: Math.round(calc.decoteMontant * 1.5),
      documentsNeeded: ['Estimation Indicative Globale (EIG)'],
      legalReference: 'Art. L351-1 et L351-6 Code de la Sécurité Sociale',
    })
  }

  return anomalies
}

/**
 * Calcule l'impact total sur l'espérance de vie.
 */
export function computeLifetimeImpact(
  impactMonthly: number,
  esperanceVieRetraite: number
): number {
  return Math.round(impactMonthly * 12 * esperanceVieRetraite)
}
