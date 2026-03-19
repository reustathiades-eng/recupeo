// ============================================================
// MABANQUE — Constantes (plafonds légaux, banques, tarifs)
// ============================================================

// ─── Plafonds légaux des frais d'incidents (2026) ───

export const PLAFONDS = {
  commissionIntervention: {
    standard: { parOperation: 8, parMois: 80 },
    fragile: { parOperation: 4, parMois: 20 },
  },
  rejetPrelevement: 20,               // € max par rejet
  rejetCheque: {
    inferieur50: 30,                   // € max si chèque ≤ 50€
    superieur50: 50,                   // € max si chèque > 50€
  },
  lettreInformation: 5.36,            // € max par tranche de 7 jours
  fraisFragileGlobal: {
    parMois: 25,                       // plafond global incidents/mois (client fragile identifié)
    offreSpecifiqueMois: 20,           // plafond si offre spécifique souscrite
    offreSpecifiqueAn: 200,            // plafond annuel si offre spécifique
  },
  offreSpecifiquePrix: 3,             // €/mois max pour l'offre spécifique
  saisieSATD: { tauxMax: 0.10, plafond: 100 },
} as const

// ─── Tarifs moyens du marché (pour comparaison) ───

export const TARIFS_MOYENS = {
  commissionIntervention: 6.5,         // € moyen par opération
  rejetPrelevement: 15,                // € moyen
  fraisTenueCompte: 2.5,              // €/mois moyen
  agiosTrimestre: 7,                   // € moyen par trimestre
} as const

// ─── Liste des principales banques françaises ───

export const BANQUES_PRINCIPALES = [
  'BNP Paribas',
  'Société Générale',
  'Crédit Agricole',
  'Crédit Mutuel',
  'Caisse d\'Épargne',
  'Banque Populaire',
  'La Banque Postale',
  'LCL',
  'HSBC France',
  'CIC',
  'Banque Palatine',
  'AXA Banque',
  'Boursorama',
  'Fortuneo',
  'Hello bank!',
  'Orange Bank',
  'N26',
  'Revolut',
  'Monabanq',
  'BforBank',
  'Autre',
] as const

// ─── Critères de fragilité financière ───

export const CRITERES_FRAGILITE = {
  inscritFCC3mois: 'Inscription au Fichier Central des Chèques (FCC) depuis plus de 3 mois',
  surendettement: 'Dossier de surendettement en cours (Banque de France)',
  incidents5parMois: '5 incidents de paiement ou plus en un seul mois',
  revenusFragiles: 'Revenus très faibles (critères internes de chaque banque)',
} as const

// ─── Textes de référence ───

export const REFERENCES_LEGALES = {
  cmfR31241: 'Art. R.312-4-1 CMF — Plafonnement commissions d\'intervention',
  cmfR31242: 'Art. R.312-4-2 CMF — Plafonnement clientèle fragile',
  cmfD1336: 'Art. D.133-6 CMF — Commissions d\'intervention',
  cmfD13125: 'Art. D.131-25 CMF — Frais de rejet de chèque',
  loi2013672: 'Loi n°2013-672 du 26/07/2013 — Séparation et régulation des activités bancaires',
  decret2013931: 'Décret n°2013-931 du 17/10/2013 — Plafonnement commissions d\'intervention',
  prescription5ans: 'Art. 2224 Code civil — Prescription quinquennale (5 ans)',
} as const
