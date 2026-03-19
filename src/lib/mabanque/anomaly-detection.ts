// ============================================================
// MABANQUE — Détection d'anomalies (7 types d'abus)
// ============================================================
import { PLAFONDS } from './constants'
import { isFragileEligible, isFragileApplied, getProfilPlafond, getPlafondCommission } from './calculations'
import type { MabanqueFormData, Anomaly, AnomalyType } from './types'

export function detectAnomalies(data: MabanqueFormData): Anomaly[] {
  const anomalies: Anomaly[] = []
  const profil = getProfilPlafond(data)
  const plafondCommission = getPlafondCommission(profil)

  // ─── 1. Dépassement commission par opération ───
  if (data.commissionsNombre > 0 && data.commissionsIntervention > 0) {
    const moyenneParOp = data.commissionsIntervention / data.commissionsNombre
    if (moyenneParOp > plafondCommission.parOperation) {
      const exces = (moyenneParOp - plafondCommission.parOperation) * data.commissionsNombre
      anomalies.push({
        type: 'depassement_commission_operation',
        severity: 'high',
        label: 'Commission d\'intervention excessive',
        detail: `Moyenne de ${moyenneParOp.toFixed(2)}€/opération, au-dessus du plafond légal de ${plafondCommission.parOperation}€.`,
        montantExces: Math.round(exces * 100) / 100,
      })
    }
  }

  // ─── 2. Dépassement commission mensuel ───
  if (data.commissionsIntervention > plafondCommission.parMois) {
    const exces = data.commissionsIntervention - plafondCommission.parMois
    anomalies.push({
      type: 'depassement_commission_mensuel',
      severity: 'high',
      label: 'Plafond mensuel des commissions dépassé',
      detail: `${data.commissionsIntervention}€ facturés ce mois, plafond légal : ${plafondCommission.parMois}€/mois.`,
      montantExces: Math.round(exces * 100) / 100,
    })
  }

  // ─── 3. Dépassement rejet de prélèvement ───
  if (data.rejetsPrelevementNombre > 0 && data.rejetsPrelevement > 0) {
    const moyenneRejet = data.rejetsPrelevement / data.rejetsPrelevementNombre
    if (moyenneRejet > PLAFONDS.rejetPrelevement) {
      const exces = (moyenneRejet - PLAFONDS.rejetPrelevement) * data.rejetsPrelevementNombre
      anomalies.push({
        type: 'depassement_rejet_prelevement',
        severity: 'high',
        label: 'Rejet de prélèvement au-dessus du plafond',
        detail: `Moyenne de ${moyenneRejet.toFixed(2)}€ par rejet, plafond légal : ${PLAFONDS.rejetPrelevement}€.`,
        montantExces: Math.round(exces * 100) / 100,
      })
    }
  }

  // ─── 4. Client fragile non identifié ───
  if (isFragileEligible(data) && !isFragileApplied(data)) {
    // Calculer l'excès par rapport aux plafonds fragiles
    const excesCommission = Math.max(0, data.commissionsIntervention - PLAFONDS.commissionIntervention.fragile.parMois)
    anomalies.push({
      type: 'fragile_non_identifie',
      severity: 'high',
      label: 'Statut client fragile non appliqué',
      detail: 'Vous remplissez les critères de fragilité financière mais votre banque ne semble pas appliquer les plafonds réduits (4€/op, 20€/mois).',
      montantExces: Math.round(excesCommission * 100) / 100,
    })
  }

  // ─── 5. Offre spécifique absente ───
  if (isFragileApplied(data) && data.offreSpecifique !== 'yes') {
    anomalies.push({
      type: 'offre_specifique_absente',
      severity: 'medium',
      label: 'Offre spécifique non proposée',
      detail: 'Client identifié comme fragile mais l\'offre spécifique à 3€/mois (avec plafond 200€/an) n\'est pas souscrite. Votre banque doit vous la proposer.',
      montantExces: 0,
    })
  }

  // ─── 6. Double facturation probable ───
  // Heuristique : si commissions ET rejets ET (agios OU lettres) pour des volumes faibles
  if (data.commissionsIntervention > 0 && data.rejetsPrelevement > 0 && (data.agios > 0 || data.lettresInformation > 0)) {
    const nbIncidentsEstimes = Math.max(data.commissionsNombre, data.rejetsPrelevementNombre)
    if (nbIncidentsEstimes > 0 && nbIncidentsEstimes <= 5) {
      // Peu d'incidents mais beaucoup de types de frais = suspicion
      const fraisParIncident = data.totalFraisMois / nbIncidentsEstimes
      if (fraisParIncident > 40) {
        anomalies.push({
          type: 'double_facturation_probable',
          severity: 'medium',
          label: 'Suspicion de double facturation',
          detail: `Plusieurs types de frais (commission + rejet + agios/lettre) pour un nombre limité d'incidents (${nbIncidentsEstimes}). Vérifiez que chaque incident n'est pas facturé plusieurs fois.`,
          montantExces: Math.round(Math.max(0, data.agios + data.lettresInformation) * 100) / 100,
        })
      }
    }
  }

  // ─── 7. Frais non justifiés ───
  if (data.autresFrais > 0) {
    anomalies.push({
      type: 'frais_non_justifies',
      severity: 'medium',
      label: 'Frais inexpliqués déclarés',
      detail: data.autresFraisDescription
        ? `${data.autresFrais}€ de frais non identifiés : "${data.autresFraisDescription}".`
        : `${data.autresFrais}€ de frais sans explication claire.`,
      montantExces: data.autresFrais,
    })
  }

  // ─── 8. Virement instantané facturé (illégal depuis jan 2025) ───
  const descLower = (data.autresFraisDescription || '').toLowerCase()
  if (descLower.includes('virement instantan') || descLower.includes('instant payment') || descLower.includes('vir. inst')) {
    anomalies.push({
      type: 'virement_instantane_facture',
      severity: 'high',
      label: 'Virement instantané facturé (illégal)',
      detail: 'Les virements instantanés sont gratuits depuis le 9 janvier 2025. Toute facturation est contraire à la réglementation européenne.',
      montantExces: data.autresFrais,
    })
  }

  return anomalies
}
