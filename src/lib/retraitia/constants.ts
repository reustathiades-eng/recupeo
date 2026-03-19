// ============================================================
// RETRAITIA — Constantes de référence retraite
// ============================================================
// Sources : CNAV, Agirc-Arrco, réforme 2023 (loi 2023-270 du 14/04/2023)
// ============================================================

/**
 * Trimestres requis et âge légal par année de naissance (post-réforme 2023).
 * Format : [trimestresRequis, ageLegalEnMois]
 */
export const TRIMESTRES_REQUIS: Record<string, { trimestres: number; ageLegalMois: number }> = {
  // Avant 1961 : non concerné par la réforme 2023
  '1958':  { trimestres: 167, ageLegalMois: 744 },  // 62 ans
  '1959':  { trimestres: 167, ageLegalMois: 744 },
  '1960':  { trimestres: 167, ageLegalMois: 744 },
  // Transition réforme 2023
  '1961-1': { trimestres: 168, ageLegalMois: 747 },  // 62 ans 3 mois (janv-août 1961)
  '1961-2': { trimestres: 169, ageLegalMois: 750 },  // 62 ans 6 mois (sept-déc 1961)
  '1962':  { trimestres: 169, ageLegalMois: 753 },   // 62 ans 9 mois
  '1963':  { trimestres: 170, ageLegalMois: 756 },   // 63 ans
  '1964':  { trimestres: 171, ageLegalMois: 759 },   // 63 ans 3 mois
  '1965':  { trimestres: 172, ageLegalMois: 762 },   // 63 ans 6 mois
  '1966':  { trimestres: 172, ageLegalMois: 765 },   // 63 ans 9 mois
  '1967':  { trimestres: 172, ageLegalMois: 768 },   // 64 ans
}

/**
 * Retourne trimestres requis et âge légal pour une année de naissance.
 * Pour 1967+, on applique la règle définitive : 172 trimestres, 64 ans.
 * Pour les générations avant 1958, on utilise 167 trimestres / 62 ans.
 */
export function getRequirements(birthYear: number, birthMonth?: number): { trimestres: number; ageLegalMois: number } {
  if (birthYear >= 1967) return { trimestres: 172, ageLegalMois: 768 }
  if (birthYear <= 1957) return { trimestres: 166, ageLegalMois: 744 }
  if (birthYear === 1961) {
    // Distinction janv-août vs sept-déc
    if (birthMonth && birthMonth >= 9) return TRIMESTRES_REQUIS['1961-2']
    return TRIMESTRES_REQUIS['1961-1']
  }
  const key = String(birthYear)
  return TRIMESTRES_REQUIS[key] || { trimestres: 172, ageLegalMois: 768 }
}

/** Âge du taux plein automatique (inchangé par la réforme) */
export const AGE_TAUX_PLEIN_AUTO = 67

/** Taux plein de la pension de base CNAV */
export const TAUX_PLEIN = 50 // %

/** Décote par trimestre manquant */
export const DECOTE_PAR_TRIMESTRE = 0.625 // %

/** Surcote par trimestre supplémentaire */
export const SURCOTE_PAR_TRIMESTRE = 1.25 // %

/** Maximum de trimestres de décote */
export const MAX_TRIMESTRES_DECOTE = 20

// ─────────────────────────────────────────────
// Minimum contributif (valeurs au 1er janvier 2025)
// ─────────────────────────────────────────────
export const MINIMUM_CONTRIBUTIF = {
  /** Minimum contributif de base (€/mois) */
  base: 756.29,
  /** Minimum contributif majoré (120+ trimestres cotisés) */
  majore: 903.94,
  /** Plafond toutes pensions confondues (€/mois) */
  plafond: 1410.89,
  /** Seuil de trimestres cotisés pour le majoré */
  seuilTrimestresCotises: 120,
}

// ─────────────────────────────────────────────
// Majoration pour enfants
// ─────────────────────────────────────────────
export const MAJORATION_ENFANTS = {
  /** Seuil : 3 enfants élevés minimum */
  seuilEnfants: 3,
  /** +10% sur la pension de base CNAV */
  tauxBase: 10, // %
  /** +5% par enfant sur l'Agirc-Arrco (pour chaque enfant au-delà du 2e, plafonné) */
  tauxComplementaireParEnfant: 5, // %
  /** Plafond Agirc-Arrco : +10% max pour 3 enfants */
  plafondComplementaire: 10, // %
}

// ─────────────────────────────────────────────
// Espérance de vie à la retraite (INSEE 2023)
// ─────────────────────────────────────────────
export const ESPERANCE_VIE = {
  /** Espérance de vie résiduelle homme à 62 ans */
  homme62: 23,
  /** Espérance de vie résiduelle femme à 62 ans */
  femme62: 27,
  /** Espérance de vie résiduelle homme à 64 ans */
  homme64: 21,
  /** Espérance de vie résiduelle femme à 64 ans */
  femme64: 25,
}

// ─────────────────────────────────────────────
// Valeur du point Agirc-Arrco
// ─────────────────────────────────────────────
export const AGIRC_ARRCO = {
  /** Valeur du point de service (€, au 1er novembre 2024) */
  valeurPoint: 1.4159,
  /** Coefficient de minoration temporaire (malus 10% pendant 3 ans) */
  malusCoefficient: 0.90,
}

// ─────────────────────────────────────────────
// PASS (Plafond Annuel de Sécurité Sociale)
// ─────────────────────────────────────────────
export const PASS: Record<number, number> = {
  2000: 27_349,
  2001: 27_984,
  2002: 28_224,
  2003: 29_184,
  2004: 29_712,
  2005: 30_192,
  2006: 31_068,
  2007: 32_184,
  2008: 33_276,
  2009: 34_308,
  2010: 34_620,
  2011: 35_352,
  2012: 36_372,
  2013: 37_032,
  2014: 37_548,
  2015: 38_040,
  2016: 38_616,
  2017: 39_228,
  2018: 39_732,
  2019: 40_524,
  2020: 41_136,
  2021: 41_136,
  2022: 41_136,
  2023: 43_992,
  2024: 46_368,
  2025: 47_100,
  2026: 47_100, // estimation, à mettre à jour
}

// ─────────────────────────────────────────────
// Labels d'affichage
// ─────────────────────────────────────────────
export const REGIME_LABELS: Record<string, string> = {
  // Salariés du privé
  cnav: 'Régime général (CNAV / CARSAT)',
  agirc_arrco: 'Agirc-Arrco (complémentaire salariés)',
  // Fonction publique
  sre: "Fonctionnaires d'État (SRE)",
  cnracl: 'Fonctionnaires territoriaux / hospitaliers (CNRACL)',
  ircantec: 'Contractuels fonction publique (Ircantec)',
  rafp: 'Retraite Additionnelle Fonction Publique (RAFP)',
  // Indépendants
  ssi: 'Artisans / commerçants / micro-entrepreneurs (SSI)',
  // Agriculture
  msa_salarie: 'MSA — Salariés agricoles',
  msa_exploitant: 'MSA — Exploitants agricoles',
  // Professions libérales
  cnavpl: 'Base professions libérales (CNAVPL)',
  cipav: 'CIPAV (architectes, ingénieurs, consultants…)',
  carmf: 'CARMF (médecins)',
  carpimko: 'CARPIMKO (infirmiers, kinés, pédicures…)',
  carcdsf: 'CARCDSF (dentistes, sages-femmes)',
  cavp: 'CAVP (pharmaciens)',
  cnbf: 'CNBF (avocats)',
  crn: 'CRN (notaires)',
  cavec: 'CAVEC (experts-comptables)',
  cavom: 'CAVOM (huissiers, greffiers…)',
  carpv: 'CARPV (vétérinaires)',
  cprn: "CPRN (agents généraux d'assurance)",
  // Régimes spéciaux
  cnieg: 'CNIEG (EDF / GDF / Engie)',
  crpcen: 'CRPCEN (clercs et employés de notaire)',
  ratp: 'RATP',
  sncf: 'SNCF',
  enim: 'ENIM (marins)',
  canssm: 'CANSSM (mines)',
  fspoeie: "Ouvriers de l'État (FSPOEIE)",
  banque_france: 'Banque de France',
  autre_special: 'Autre régime spécial',
}

/** Groupes de régimes pour le formulaire (UX) */
export const REGIME_GROUPS: Array<{ label: string; regimes: string[] }> = [
  {
    label: 'Salariés du privé',
    regimes: ['cnav', 'agirc_arrco'],
  },
  {
    label: 'Fonction publique',
    regimes: ['sre', 'cnracl', 'ircantec', 'rafp'],
  },
  {
    label: 'Indépendants',
    regimes: ['ssi'],
  },
  {
    label: 'Agriculture',
    regimes: ['msa_salarie', 'msa_exploitant'],
  },
  {
    label: 'Professions libérales',
    regimes: ['cnavpl', 'cipav', 'carmf', 'carpimko', 'carcdsf', 'cavp', 'cnbf', 'crn', 'cavec', 'cavom', 'carpv', 'cprn'],
  },
  {
    label: 'Régimes spéciaux',
    regimes: ['cnieg', 'crpcen', 'ratp', 'sncf', 'enim', 'canssm', 'fspoeie', 'banque_france', 'autre_special'],
  },
]

export const ANOMALY_LABELS: Record<string, string> = {
  trimestres_manquants: 'Trimestres cotisés manquants',
  service_militaire: 'Service militaire non comptabilisé',
  chomage_maladie: 'Périodes chômage/maladie non reportées',
  majoration_enfants: 'Majoration pour enfants non appliquée',
  salaires_manquants: 'Salaires sous-déclarés ou manquants',
  points_complementaire: 'Points Agirc-Arrco potentiellement manquants',
  decote_erreur: 'Erreur de calcul de la décote',
  minimum_contributif: 'Minimum contributif non appliqué',
  optimisation_depart: "Date de départ non optimisée",
}
