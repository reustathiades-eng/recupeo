// ============================================================
// MACAUTION — Grille de vétusté FNAIM (référence)
// ============================================================

export interface VetusteGridItem {
  /** Nom de l'élément */
  element: string
  /** Catégorie pour mapping avec les motifs du formulaire */
  category: string
  /** Durée de vie en années */
  lifespanYears: number
  /** Franchise en années (pas de vétusté pendant cette période) */
  franchiseYears: number
  /** Taux annuel de vétusté (%) après franchise */
  annualRate: number
}

/**
 * Grille de vétusté FNAIM — La plus utilisée par les tribunaux français.
 * Source : Convention FNAIM (Fédération Nationale de l'Immobilier)
 */
export const VETUSTE_GRID: VetusteGridItem[] = [
  // ─── Peintures / Revêtements muraux ───
  { element: 'Peintures / Papiers peints', category: 'peintures_murs', lifespanYears: 9, franchiseYears: 2, annualRate: 15 },

  // ─── Sols ───
  { element: 'Moquette', category: 'sols', lifespanYears: 7, franchiseYears: 2, annualRate: 14 },
  { element: 'Parquet vitrifié', category: 'sols', lifespanYears: 15, franchiseYears: 5, annualRate: 10 },
  { element: 'Carrelage sol', category: 'sols', lifespanYears: 20, franchiseYears: 5, annualRate: 7 },

  // ─── Sanitaires / Plomberie ───
  { element: 'Équipements sanitaires (WC, lavabo, baignoire)', category: 'sanitaires_plomberie', lifespanYears: 20, franchiseYears: 5, annualRate: 7 },
  { element: 'Robinetterie', category: 'sanitaires_plomberie', lifespanYears: 10, franchiseYears: 2, annualRate: 12 },
  { element: 'VMC', category: 'sanitaires_plomberie', lifespanYears: 20, franchiseYears: 5, annualRate: 7 },
  { element: 'Chaudière', category: 'sanitaires_plomberie', lifespanYears: 15, franchiseYears: 5, annualRate: 10 },
  { element: 'Faïence murale', category: 'sanitaires_plomberie', lifespanYears: 20, franchiseYears: 5, annualRate: 7 },

  // ─── Équipements cuisine ───
  { element: 'Plaques de cuisson', category: 'equipements_cuisine', lifespanYears: 10, franchiseYears: 2, annualRate: 12 },
  { element: 'Four', category: 'equipements_cuisine', lifespanYears: 10, franchiseYears: 2, annualRate: 12 },
  { element: 'Réfrigérateur', category: 'equipements_cuisine', lifespanYears: 10, franchiseYears: 2, annualRate: 12 },
  { element: 'Lave-linge / Lave-vaisselle', category: 'equipements_cuisine', lifespanYears: 8, franchiseYears: 2, annualRate: 15 },

  // ─── Menuiseries / Portes ───
  { element: 'Menuiseries intérieures (portes)', category: 'menuiseries_portes', lifespanYears: 20, franchiseYears: 5, annualRate: 7 },
  { element: 'Volets / Stores', category: 'menuiseries_portes', lifespanYears: 20, franchiseYears: 5, annualRate: 7 },

  // ─── Électricité ───
  { element: 'Électricité (prises, interrupteurs)', category: 'autre', lifespanYears: 25, franchiseYears: 5, annualRate: 5 },
]

/**
 * Calcule le taux de vétusté pour un élément donné.
 *
 * @param occupationYears Durée d'occupation du logement (en années)
 * @param item Élément de la grille de vétusté
 * @returns Pourcentage de vétusté (0 à 100)
 */
export function calculateVetuste(occupationYears: number, item: VetusteGridItem): number {
  if (occupationYears <= item.franchiseYears) {
    return 0 // Pendant la franchise, le locataire paie 100%
  }
  const yearsAfterFranchise = occupationYears - item.franchiseYears
  const vetuste = yearsAfterFranchise * item.annualRate
  return Math.min(100, vetuste) // Plafond à 100%
}

/**
 * Calcule la part locataire après application de la vétusté.
 *
 * @param repairCost Coût de la réparation / remplacement
 * @param vetustePercent Taux de vétusté (0-100)
 * @returns Part que le locataire doit réellement payer
 */
export function tenantShareAfterVetuste(repairCost: number, vetustePercent: number): number {
  return Math.round(repairCost * (1 - vetustePercent / 100) * 100) / 100
}

/**
 * Récupère les éléments de la grille correspondant à une catégorie de motif.
 */
export function getGridItemsByCategory(category: string): VetusteGridItem[] {
  return VETUSTE_GRID.filter(item => item.category === category)
}

/**
 * Renvoie l'élément le plus représentatif pour une catégorie
 * (celui avec la durée de vie la plus courte = le plus favorable au locataire).
 */
export function getMostFavorableItem(category: string): VetusteGridItem | undefined {
  const items = getGridItemsByCategory(category)
  if (items.length === 0) return undefined
  return items.reduce((best, item) =>
    item.lifespanYears < best.lifespanYears ? item : best
  )
}
