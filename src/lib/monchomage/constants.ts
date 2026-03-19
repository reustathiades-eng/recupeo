// ============================================================
// MONCHOMAGE — Constantes ARE (valeurs au 01/07/2025)
// ============================================================

export const ARE_PARAMS = {
  // Allocation journalière
  partieFixe: 13.18,                  // € (revalorisée chaque 1er juillet)
  tauxProportionnel: 0.404,           // 40,4%
  tauxMinimum: 0.57,                  // 57%
  plafondSJR: 0.75,                   // 75% du SJR maximum
  allocationMinimale: 32.13,          // €/jour
  allocationMaximale: 294.21,         // €/jour brut

  // Dégressivité
  degressiviteSeuil: 159.68,          // SJR seuil (€/jour) → ~4 857€ brut/mois
  degressiviteCoeff: 0.70,            // réduction de 30% → coeff 0,70
  degressiviteMois: 7,                // à partir du 7ème mois
  degressiviteAgeExemption: 55,       // pas de dégressivité si ≥ 55 ans

  // Plafond mensuel du salaire de référence
  plafondMensuelSR: 16020,            // €/mois (4× PMSS)

  // Durées maximales (jours)
  dureeMax: {
    moins53: 730,                     // 24 mois
    de53a54: 913,                     // 30,5 mois
    plus55: 822,                      // 27 mois
  } as const,
  dureeMinimale: 182,                 // 6 mois

  // Plafonnement intercontrat
  plafondJoursNonTravailles: 0.70,    // 70% des jours travaillés

  // Prélèvements sociaux
  cotisationRetraite: 0.03,           // 3%
  CSG: 0.062,                         // 6,2% (si AJ > seuil)
  CRDS: 0.005,                        // 0,5%
  seuilCSG: 61,                       // € brut/jour

  // Mensualisation
  joursParMois: 30,                   // depuis 01/04/2025

  // Conditions d'éligibilité
  joursMinTravailles: 130,            // 130 jours ou 910 heures
  periodeRefMois: { moins55: 24, plus55: 36 },

  // Prescription
  prescriptionAns: 2,                 // contestation sous 2 ans
} as const

// ─── Types de rupture éligibles ───

export const RUPTURES_ELIGIBLES = [
  'licenciement',
  'rupture_conv',
  'fin_cdd',
] as const

export const RUPTURE_LABELS: Record<string, string> = {
  licenciement: 'Licenciement',
  rupture_conv: 'Rupture conventionnelle',
  fin_cdd: 'Fin de CDD',
  demission: 'Démission',
  autre: 'Autre',
}

export const CONTRAT_LABELS: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  interim: 'Intérim',
  autre: 'Autre',
}
