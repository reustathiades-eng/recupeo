// ============================================================
// MONCHOMAGE — Détection d'anomalies ARE
// ============================================================
import { ARE_PARAMS } from './constants'
import type { MonchomageFormData, MonchomageCalculations, Anomaly } from './types'

export function detectAnomalies(data: MonchomageFormData, calc: MonchomageCalculations): Anomaly[] {
  const anomalies: Anomaly[] = []

  // ─── 1. SJR sous-estimé (écart significatif) ───
  if (calc.ecartSJR !== null && calc.ecartSJR > 2) {
    anomalies.push({
      type: 'sjr_sous_estime',
      severity: calc.ecartSJR > 10 ? 'high' : 'medium',
      label: 'SJR possiblement sous-estimé',
      detail: `Le SJR théorique (${calc.sjrTheorique.toFixed(2)}€) est supérieur au SJR notifié (${data.sjrNotification}€). Écart : +${calc.ecartSJR.toFixed(2)}€/jour.`,
      impact: calc.ecartAJ,
    })
  }

  // ─── 2. Primes potentiellement omises ───
  if (data.hasPrimes && data.primesTotal > 0 && calc.ecartAJ > 1) {
    anomalies.push({
      type: 'primes_omises',
      severity: 'medium',
      label: 'Primes possiblement non intégrées',
      detail: `Vous avez déclaré ${data.primesTotal}€ de primes/13ème mois. Si France Travail ne les a pas incluses dans le salaire de référence, votre SJR est artificiellement abaissé.`,
      impact: Math.round((data.primesTotal / calc.joursCalendaires) * ARE_PARAMS.tauxMinimum * 100) / 100,
    })
  }

  // ─── 3. Neutralisation maladie/maternité ───
  if (data.hasMaladie && data.maladieDuree > 0) {
    // Si l'écart est positif, les jours n'ont peut-être pas été neutralisés
    if (calc.ecartAJ > 0.5) {
      anomalies.push({
        type: 'neutralisation_maladie',
        severity: 'high',
        label: 'Neutralisation des arrêts maladie à vérifier',
        detail: `Vous avez eu ${data.maladieDuree} jours d'arrêt maladie/maternité. Si France Travail les a inclus dans le dénominateur du SJR au lieu de les neutraliser, votre allocation est sous-estimée.`,
        impact: calc.ecartAJ > 0 ? calc.ecartAJ : 0,
      })
    }
  }

  // ─── 4. Dégressivité appliquée à tort ───
  if (data.degressiviteAppliquee === 'yes') {
    // Vérifier si la dégressivité est justifiée
    if (calc.degressiviteExemptAge) {
      anomalies.push({
        type: 'degressivite_injustifiee',
        severity: 'high',
        label: 'Dégressivité potentiellement injustifiée (critère d\'âge)',
        detail: `Vous aviez ${data.ageFinContrat} ans à la fin de votre contrat. Les allocataires de 55 ans ou plus sont exemptés de dégressivité.`,
        impact: Math.round(calc.ajTheorique * 0.30 * 100) / 100,
      })
    }
    if (!calc.degressiviteApplicable && !calc.degressiviteExemptAge) {
      anomalies.push({
        type: 'degressivite_injustifiee',
        severity: 'high',
        label: 'Dégressivité potentiellement injustifiée (sous le seuil)',
        detail: `Votre SJR théorique (${calc.sjrTheorique.toFixed(2)}€) est inférieur au seuil de dégressivité (${ARE_PARAMS.degressiviteSeuil}€). La dégressivité ne devrait pas s'appliquer.`,
        impact: Math.round(calc.ajTheorique * 0.30 * 100) / 100,
      })
    }
  }

  // ─── 5. Durée sous-estimée ───
  if (data.dureeIndemnisation < calc.dureeTheoriqueMax && data.dureeIndemnisation < ARE_PARAMS.dureeMax.moins53) {
    // La durée notifiée semble courte
    const ecartJours = calc.dureeTheoriqueMax - data.dureeIndemnisation
    if (ecartJours > 30) {
      anomalies.push({
        type: 'duree_sous_estimee',
        severity: 'medium',
        label: 'Durée d\'indemnisation possiblement sous-estimée',
        detail: `Durée notifiée : ${data.dureeIndemnisation} jours. Durée max pour votre tranche d'âge : ${calc.dureeTheoriqueMax} jours. Vérifiez que tous les jours travaillés ont été correctement comptés.`,
        impact: 0,
      })
    }
  }

  // ─── 6. Multi-contrats ───
  if (data.multiEmployeurs) {
    anomalies.push({
      type: 'multi_contrats_agregation',
      severity: 'low',
      label: 'Vérification multi-employeurs recommandée',
      detail: 'Avec plusieurs employeurs sur la période de référence, les salaires doivent être correctement agrégés. Vérifiez que tous les contrats figurent sur l\'attestation.',
      impact: 0,
    })
  }

  // ─── 7. Attestation employeur ───
  if (calc.ecartAJ > 2 || (calc.ecartSJR !== null && calc.ecartSJR > 5)) {
    anomalies.push({
      type: 'attestation_a_verifier',
      severity: 'medium',
      label: 'Attestation employeur à vérifier en priorité',
      detail: 'L\'écart détecté peut provenir d\'une attestation employeur erronée (salaires mal reportés, primes oubliées, dates incorrectes). Comparez avec vos bulletins de paie.',
      impact: 0,
    })
  }

  // ─── 8. Trop-perçu possible (ARE > théorique) ───
  if (calc.ecartAJ < -2) {
    anomalies.push({
      type: 'trop_percu_possible',
      severity: 'info',
      label: 'Attention : votre ARE semble plus élevée que le calcul théorique',
      detail: `L'allocation notifiée (${data.ajBrute}€/jour) est supérieure à notre calcul théorique (${calc.ajTheorique.toFixed(2)}€/jour). Cela peut être normal (éléments non déclarés dans le formulaire) ou indiquer un risque de trop-perçu à régulariser.`,
      impact: calc.ecartAJ,
    })
  }

  return anomalies
}
