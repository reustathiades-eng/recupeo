// ============================================================
// MATAXE — Constantes (équivalences m², catégories, coefficients)
// ============================================================
import type { CadastralCategory, ConditionRating } from './types'

// ─── Équivalences superficielles (m² fictifs ajoutés) ───
// Source : CGI art. 1496, BOI-IF-TFB-20-10-50

export const EQUIPMENT_SQMETERS: Record<string, number> = {
  baignoire: 3,
  douche: 2,
  lavabo: 1,
  wc: 1,
  evier: 1,
  chauffage_central_par_piece: 2,    // par pièce chauffée
  ascenseur_par_piece: 2,            // par pièce principale
  gaz_par_piece: 1,                  // par pièce principale
  electricite: 2,                     // forfait
  eau_courante: 4,                    // forfait
  tout_a_legout: 3,                   // forfait
  vide_ordures: 1,                    // forfait
}

// ─── Pondération des dépendances ───

export const DEPENDENCY_WEIGHTS = {
  garage: { coeff: 0.50, defaultSurface: 15 },     // ~15m² × 0.50
  cave: { coeff: 0.30, defaultSurface: 8 },         // ~8m² × 0.30
  balcon: { coeff: 0.20 },                           // surface réelle × 0.20
  terrasse_couverte: { coeff: 0.30 },
}

// ─── Catégories cadastrales ───

export interface CategoryInfo {
  category: CadastralCategory
  label: string
  description: string
  tarifMoyenM2: number   // tarif annuel moyen €/m² pondéré (estimation nationale 2024)
}

export const CATEGORIES: CategoryInfo[] = [
  { category: 1, label: 'Grand luxe', description: 'Propriétés exceptionnelles (châteaux, hôtels particuliers)', tarifMoyenM2: 22.0 },
  { category: 2, label: 'Luxe', description: 'Résidences de standing supérieur', tarifMoyenM2: 17.5 },
  { category: 3, label: 'Très confortable', description: 'Beau quartier, prestations haut de gamme', tarifMoyenM2: 14.0 },
  { category: 4, label: 'Confortable', description: 'Bon standing, équipements complets', tarifMoyenM2: 11.5 },
  { category: 5, label: 'Assez confortable', description: 'Standing moyen, confort correct', tarifMoyenM2: 9.5 },
  { category: 6, label: 'Ordinaire', description: 'Logement standard sans luxe particulier', tarifMoyenM2: 7.5 },
  { category: 7, label: 'Médiocre', description: 'Confort limité, équipements basiques', tarifMoyenM2: 5.5 },
  { category: 8, label: 'Très médiocre', description: 'Vétuste, équipements insuffisants', tarifMoyenM2: 4.0 },
]

export function getCategoryInfo(cat: CadastralCategory): CategoryInfo {
  return CATEGORIES.find(c => c.category === cat) || CATEGORIES[5] // défaut cat 6
}

// ─── Coefficient d'entretien ───

export interface EntretienInfo {
  code: ConditionRating
  label: string
  coefficient: number
}

export const COEFFICIENTS_ENTRETIEN: EntretienInfo[] = [
  { code: 'tres_bon', label: 'Très bon', coefficient: 1.20 },
  { code: 'bon', label: 'Bon', coefficient: 1.10 },
  { code: 'passable', label: 'Passable', coefficient: 1.00 },
  { code: 'mediocre', label: 'Médiocre', coefficient: 0.90 },
  { code: 'mauvais', label: 'Mauvais', coefficient: 0.80 },
]

export function getEntretienInfo(code: ConditionRating): EntretienInfo {
  return COEFFICIENTS_ENTRETIEN.find(c => c.code === code) || COEFFICIENTS_ENTRETIEN[2] // défaut passable
}

// ─── Coefficient de situation (simplifié) ───
// En réalité dépend de la commune et du quartier
// On utilise 1.00 par défaut (moyenne nationale)

export const DEFAULT_COEFF_SITUATION = 1.00

// ─── Taux moyen d'imposition communal ───
// Source : DGFiP — taux moyens nationaux 2024
// Taxe foncière = VLC × 50% × (taux commune + taux intercommunalité + taux départemental si applicable)
// Taux moyen national consolidé ≈ 50-55% selon les communes

export const TAUX_MOYEN_COMMUNES = 0.52  // 52% taux consolidé moyen national

// ─── Seuils d'exonération ───

export const EXONERATION = {
  // Exonération totale : +75 ans sous condition RFR
  ageTotale: 75,
  // Dégrèvement partiel : 65-74 ans → 100€ de dégrèvement
  agePartielleMin: 65,
  agePartielleMax: 74,
  degrevementPartiel: 100, // €

  // Plafond RFR 2024 pour exonération (1 part)
  // Révisé chaque année par la loi de finances
  plafondRfr1Part: 12455,   // 2024
  plafondRfr1_5Part: 15781, // 2024

  // Bénéficiaires automatiques (sans condition de revenu pour certaines)
  // ASPA, AAH, ASI → exonération sous conditions
}

// ─── Prescription et rétroactivité ───

export const RETROACTIVITE_ANNEES = 4   // année en cours + 3 ans antérieurs (en pratique ~4 ans)
export const DATE_LIMITE_RECLAMATION = '31 décembre de l\'année suivant la mise en recouvrement'

// ─── Labels pour affichage ───

export const ANOMALY_LABELS: Record<string, string> = {
  coefficient_entretien: 'Coefficient d\'entretien surévalué',
  equipements_supprimes: 'Équipements supprimés encore comptés',
  surface_ponderee: 'Surface pondérée incorrecte',
  categorie_surevaluee: 'Catégorie cadastrale surévaluée',
  dependances_fictives: 'Dépendances fictives ou surévaluées',
  exoneration_manquante: 'Exonération non appliquée',
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  autre: 'Autre',
}

export const HEATING_LABELS: Record<string, string> = {
  central_collectif: 'Chauffage central collectif',
  central_individuel: 'Chauffage central individuel',
  individuel: 'Chauffage individuel',
  aucun: 'Aucun chauffage',
}

export const CONDITION_LABELS: Record<string, string> = {
  tres_bon: 'Très bon',
  bon: 'Bon',
  passable: 'Passable',
  mediocre: 'Médiocre',
  mauvais: 'Mauvais',
  na: 'Non applicable',
}
