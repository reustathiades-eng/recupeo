import type { ConventionCode } from './types/index'
import type { ConventionHeureSup, ConventionRule } from './types/convention'
import { SMIC_MENSUEL_2026, MAJORATION_HS_TRANCHE1, MAJORATION_HS_TRANCHE2, CONTINGENT_ANNUEL_LEGAL, SEUIL_TRANCHE1_MAX } from './constants'

export interface ConventionCollective {
  idcc: string
  code: ConventionCode
  libelle: string
  secteur: string
  salariesEstimes: number
  salaireMinimum: number
  heuresSup: ConventionHeureSup
  treizeMois: { obligatoire: boolean; condition?: string; baseCalcul?: string }
  primeAnciennete: { applicable: boolean; paliers?: { annees: number; taux: number }[] }
  primeVacances: { applicable: boolean; montant?: number; condition?: string }
  classifications: { type: string; grille: string; niveaux: number }
  majorations: { nuit: number; dimanche: number; jourFerie: number }
  avantagesNature: string[]
  reglesSpecifiques: ConventionRule[]
}

const HS_LEGAL: ConventionHeureSup = {
  seuilDeclenchement: 35, tranche1Max: SEUIL_TRANCHE1_MAX, tranche1Majoration: MAJORATION_HS_TRANCHE1,
  tranche2Majoration: MAJORATION_HS_TRANCHE2, contingentAnnuel: CONTINGENT_ANNUEL_LEGAL,
  reposCompensateurObligatoire: true, seuilReposCompensateur: CONTINGENT_ANNUEL_LEGAL,
}

const NO_13: ConventionCollective['treizeMois'] = { obligatoire: false }
const NO_ANC: ConventionCollective['primeAnciennete'] = { applicable: false }
const NO_VAC: ConventionCollective['primeVacances'] = { applicable: false }
const MAJ_DEF: ConventionCollective['majorations'] = { nuit: 0.25, dimanche: 0, jourFerie: 0 }

const CORE_CONVENTIONS: ConventionCollective[] = [
  { idcc: '2216', code: 'IDCC_2216', libelle: 'Commerce de détail et de gros à prédominance alimentaire', secteur: 'Commerce alimentaire', salariesEstimes: 500000, salaireMinimum: SMIC_MENSUEL_2026, heuresSup: { ...HS_LEGAL, contingentAnnuel: 180 }, treizeMois: { obligatoire: true, condition: '1 an ancienneté', baseCalcul: 'Salaire de base décembre' }, primeAnciennete: { applicable: true, paliers: [{ annees: 3, taux: 0.03 }, { annees: 6, taux: 0.06 }, { annees: 9, taux: 0.09 }, { annees: 12, taux: 0.12 }, { annees: 15, taux: 0.15 }] }, primeVacances: { applicable: true, montant: 0, condition: 'Selon niveau et ancienneté' }, classifications: { type: 'Niveaux-Échelons', grille: '1A à 9C', niveaux: 27 }, majorations: { nuit: 0.25, dimanche: 0.20, jourFerie: 1.0 }, avantagesNature: ['Remise sur achats 10%'], reglesSpecifiques: [] },
  { idcc: '1979', code: 'IDCC_1979', libelle: 'Hôtels, cafés, restaurants (HCR)', secteur: 'Hôtellerie-Restauration', salariesEstimes: 800000, salaireMinimum: SMIC_MENSUEL_2026, heuresSup: { ...HS_LEGAL, tranche1Majoration: 0.10, tranche2Majoration: 0.20, contingentAnnuel: 360, majorationNuit: 0.25, majorationDimanche: 0, majorationJourFerie: 1.0 }, treizeMois: NO_13, primeAnciennete: { applicable: true, paliers: [{ annees: 5, taux: 0.02 }, { annees: 10, taux: 0.05 }, { annees: 15, taux: 0.08 }, { annees: 20, taux: 0.10 }] }, primeVacances: NO_VAC, classifications: { type: 'Niveaux-Échelons', grille: 'I-1 à V-3', niveaux: 15 }, majorations: { nuit: 0.25, dimanche: 0, jourFerie: 1.0 }, avantagesNature: ['Repas : 1 par service (évaluation URSSAF)', 'Logement (évaluation URSSAF)'], reglesSpecifiques: [{ code: 'HCR_AVANTAGE_REPAS', libelle: 'Avantage en nature repas', valeur: 4.15, unite: 'EUR', dateApplication: '2026-01-01', legalReference: 'Art. D.3231-13 CT + arrêté URSSAF', source: 'DECRET' }] },
  { idcc: '1596', code: 'IDCC_1596', libelle: 'Bâtiment — Ouvriers (≤ 10 salariés)', secteur: 'BTP', salariesEstimes: 900000, salaireMinimum: SMIC_MENSUEL_2026, heuresSup: { ...HS_LEGAL, contingentAnnuel: 180 }, treizeMois: NO_13, primeAnciennete: { applicable: true, paliers: [{ annees: 3, taux: 0.03 }, { annees: 8, taux: 0.06 }, { annees: 13, taux: 0.09 }, { annees: 18, taux: 0.12 }] }, primeVacances: { applicable: true, montant: 30, condition: 'Prime de vacances BTP 30% indemnité CP' }, classifications: { type: 'Niveaux-Positions-Coefficients', grille: 'N1P1(150) à N4P2(270)', niveaux: 8 }, majorations: { nuit: 0.25, dimanche: 0.50, jourFerie: 1.0 }, avantagesNature: ['Indemnité trajet', 'Indemnité panier', 'Indemnité intempéries'], reglesSpecifiques: [{ code: 'BTP_PANIER', libelle: 'Indemnité de panier', valeur: 10.80, unite: 'EUR', dateApplication: '2026-01-01', legalReference: 'CCN BTP art. 8.17', source: 'CCN' }, { code: 'BTP_TRAJET', libelle: 'Indemnité de trajet (zone 1-5)', valeur: 3.20, unite: 'EUR', dateApplication: '2026-01-01', legalReference: 'CCN BTP art. 8.17', source: 'CCN' }] },
  { idcc: '3248', code: 'IDCC_3248', libelle: 'Métallurgie', secteur: 'Industrie métallurgique', salariesEstimes: 1500000, salaireMinimum: SMIC_MENSUEL_2026, heuresSup: HS_LEGAL, treizeMois: { obligatoire: true, condition: 'Selon accord entreprise (fréquent)', baseCalcul: 'Salaire mensuel de base' }, primeAnciennete: { applicable: true, paliers: [{ annees: 3, taux: 0.03 }, { annees: 6, taux: 0.06 }, { annees: 9, taux: 0.09 }, { annees: 12, taux: 0.12 }, { annees: 15, taux: 0.15 }, { annees: 18, taux: 0.18 }] }, primeVacances: { applicable: true, condition: 'Prime de vacances ≥ 460 EUR (cadres)' }, classifications: { type: 'Classification unique 18 groupes-emplois', grille: 'A1 à I18', niveaux: 18 }, majorations: { nuit: 0.30, dimanche: 0.50, jourFerie: 1.0 }, avantagesNature: [], reglesSpecifiques: [] },
  { idcc: '0573', code: 'IDCC_0573', libelle: 'Commerce de gros', secteur: 'Commerce de gros', salariesEstimes: 350000, salaireMinimum: SMIC_MENSUEL_2026, heuresSup: HS_LEGAL, treizeMois: { obligatoire: true, condition: '1 an ancienneté', baseCalcul: 'Salaire mensuel brut' }, primeAnciennete: { applicable: true, paliers: [{ annees: 3, taux: 0.03 }, { annees: 6, taux: 0.06 }, { annees: 9, taux: 0.09 }, { annees: 12, taux: 0.12 }, { annees: 15, taux: 0.15 }] }, primeVacances: NO_VAC, classifications: { type: 'Niveaux-Échelons', grille: 'I à IX', niveaux: 9 }, majorations: MAJ_DEF, avantagesNature: [], reglesSpecifiques: [] },
]

const EXTENDED_SECTORS: Array<{ idcc: string; libelle: string; secteur: string; salaries: number }> = [
  { idcc: '0044', libelle: 'Industries chimiques', secteur: 'Chimie', salaries: 220000 },
  { idcc: '0176', libelle: 'Industrie pharmaceutique', secteur: 'Pharmacie', salaries: 100000 },
  { idcc: '1486', libelle: 'Bureaux d\'études techniques (Syntec)', secteur: 'Conseil/IT', salaries: 910000 },
  { idcc: '0016', libelle: 'Transports routiers', secteur: 'Transport', salaries: 700000 },
  { idcc: '2098', libelle: 'Prestataires de services (secteur tertiaire)', secteur: 'Services', salaries: 400000 },
  { idcc: '0029', libelle: 'Hospitalisation privée', secteur: 'Santé', salaries: 300000 },
  { idcc: '0054', libelle: 'Métallurgie — Région parisienne', secteur: 'Industrie', salaries: 200000 },
  { idcc: '1517', libelle: 'Commerce de détail non alimentaire', secteur: 'Commerce', salaries: 180000 },
  { idcc: '2120', libelle: 'Banque', secteur: 'Banque', salaries: 220000 },
  { idcc: '2264', libelle: 'Hospitalisation privée à but non lucratif', secteur: 'Santé', salaries: 250000 },
  { idcc: '3127', libelle: 'Entreprises de propreté', secteur: 'Propreté', salaries: 550000 },
  { idcc: '1518', libelle: 'Animation', secteur: 'Animation', salaries: 130000 },
  { idcc: '0218', libelle: 'Organismes de formation', secteur: 'Formation', salaries: 140000 },
  { idcc: '1501', libelle: 'Restauration rapide', secteur: 'Restauration', salaries: 250000 },
  { idcc: '0086', libelle: 'Publicité', secteur: 'Communication', salaries: 120000 },
  { idcc: '1090', libelle: 'Automobile (services)', secteur: 'Automobile', salaries: 400000 },
  { idcc: '2511', libelle: 'Sport', secteur: 'Sport', salaries: 130000 },
  { idcc: '0953', libelle: 'Charcuterie de détail', secteur: 'Alimentation', salaries: 50000 },
  { idcc: '1527', libelle: 'Immobilier', secteur: 'Immobilier', salaries: 150000 },
  { idcc: '1606', libelle: 'Bricolage', secteur: 'Commerce', salaries: 60000 },
  { idcc: '2148', libelle: 'Télécommunications', secteur: 'Télécoms', salaries: 150000 },
  { idcc: '0275', libelle: 'Transport aérien — Personnel au sol', secteur: 'Aérien', salaries: 80000 },
  { idcc: '0292', libelle: 'Plasturgie', secteur: 'Industrie', salaries: 130000 },
  { idcc: '0650', libelle: 'Métallurgie — Ingénieurs et cadres', secteur: 'Industrie', salaries: 350000 },
  { idcc: '0787', libelle: 'Cabinets d\'experts-comptables', secteur: 'Comptabilité', salaries: 180000 },
  { idcc: '1266', libelle: 'Restauration de collectivités', secteur: 'Restauration', salaries: 120000 },
  { idcc: '1404', libelle: 'Commerce de détail des fruits et légumes', secteur: 'Commerce', salaries: 40000 },
  { idcc: '1516', libelle: 'Organismes de formation (OPCA)', secteur: 'Formation', salaries: 50000 },
  { idcc: '1557', libelle: 'Commerce des articles de sport', secteur: 'Commerce', salaries: 60000 },
  { idcc: '1740', libelle: 'Bâtiment — ETAM', secteur: 'BTP', salaries: 300000 },
  { idcc: '2609', libelle: 'Bâtiment — Ouvriers (> 10 salariés)', secteur: 'BTP', salaries: 500000 },
  { idcc: '2614', libelle: 'Travaux publics — Ouvriers', secteur: 'BTP', salaries: 280000 },
  { idcc: '2691', libelle: 'Enseignement privé hors contrat', secteur: 'Enseignement', salaries: 50000 },
  { idcc: '2941', libelle: 'Aide à domicile', secteur: 'Services à la personne', salaries: 500000 },
  { idcc: '3043', libelle: 'Entreprises de la filière déchet', secteur: 'Environnement', salaries: 60000 },
]

function buildExtendedConvention(e: typeof EXTENDED_SECTORS[number]): ConventionCollective {
  return {
    idcc: e.idcc, code: 'AUTRE' as ConventionCode, libelle: e.libelle, secteur: e.secteur,
    salariesEstimes: e.salaries, salaireMinimum: SMIC_MENSUEL_2026, heuresSup: HS_LEGAL,
    treizeMois: NO_13, primeAnciennete: NO_ANC, primeVacances: NO_VAC,
    classifications: { type: 'Voir convention', grille: 'Voir convention', niveaux: 0 },
    majorations: MAJ_DEF, avantagesNature: [], reglesSpecifiques: [],
  }
}

const ALL_CONVENTIONS: ReadonlyMap<string, ConventionCollective> = new Map([
  ...CORE_CONVENTIONS.map((c) => [c.idcc, c] as const),
  ...EXTENDED_SECTORS.map((e) => [e.idcc, buildExtendedConvention(e)] as const),
])

export function getConventionByIDCC(idcc: string): ConventionCollective | null {
  return ALL_CONVENTIONS.get(idcc.replace(/^0+/, '').padStart(4, '0')) ?? ALL_CONVENTIONS.get(idcc) ?? null
}

export function getConventionByCode(code: ConventionCode): ConventionCollective | null {
  const idccMap: Record<string, string> = { IDCC_2216: '2216', IDCC_1979: '1979', IDCC_1596: '1596', IDCC_3248: '3248', IDCC_0573: '0573' }
  const idcc = idccMap[code]
  return idcc ? ALL_CONVENTIONS.get(idcc) ?? null : null
}

export function searchConventions(query: string): ConventionCollective[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return Array.from(ALL_CONVENTIONS.values()).filter((c) =>
    c.idcc.includes(q) || c.libelle.toLowerCase().includes(q) || c.secteur.toLowerCase().includes(q)
  )
}

export function getAllConventions(): ConventionCollective[] {
  return Array.from(ALL_CONVENTIONS.values())
}

export function getConventionCount(): number {
  return ALL_CONVENTIONS.size
}

export { CORE_CONVENTIONS, EXTENDED_SECTORS, ALL_CONVENTIONS }