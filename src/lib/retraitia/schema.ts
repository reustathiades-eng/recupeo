// ============================================================
// RETRAITIA — Schéma Zod de validation du formulaire (Zod v4)
// ============================================================
import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const retirementRegimes = [
  // Salariés du privé
  'cnav', 'agirc_arrco',
  // Fonction publique
  'sre', 'cnracl', 'ircantec', 'rafp',
  // Indépendants
  'ssi',
  // Agriculture
  'msa_salarie', 'msa_exploitant',
  // Professions libérales
  'cnavpl', 'cipav', 'carmf', 'carpimko', 'carcdsf', 'cavp', 'cnbf', 'crn', 'cavec', 'cavom', 'carpv', 'cprn',
  // Régimes spéciaux
  'cnieg', 'crpcen', 'ratp', 'sncf', 'enim', 'canssm', 'fspoeie', 'banque_france', 'autre_special',
] as const

export const retraitiaSchema = z.object({
  // ─── Étape 1 — Profil personnel ───
  birthDate: z
    .string({ message: 'Veuillez saisir votre date de naissance' })
    .regex(dateRegex, 'Format de date invalide (AAAA-MM-JJ)'),

  sex: z.enum(['M', 'F'], {
    message: 'Veuillez sélectionner votre sexe',
  }),

  childrenCount: z
    .number({ message: "Veuillez indiquer le nombre d'enfants" })
    .int()
    .min(0, 'Le nombre doit être positif')
    .max(20, 'Le nombre semble trop élevé'),

  status: z.enum(['retired', 'active', 'liquidating'], {
    message: 'Veuillez sélectionner votre situation',
  }),

  // ─── Étape 2 — Carrière ───
  regimes: z
    .array(z.enum(retirementRegimes))
    .min(1, 'Veuillez sélectionner au moins un régime'),

  totalTrimesters: z
    .number({ message: 'Veuillez saisir le nombre de trimestres validés' })
    .int()
    .min(0, 'Le nombre doit être positif')
    .max(250, 'Le nombre semble trop élevé'),

  cotisedTrimesters: z
    .number({ message: 'Veuillez saisir le nombre de trimestres cotisés' })
    .int()
    .min(0, 'Le nombre doit être positif')
    .max(250, 'Le nombre semble trop élevé'),

  careerStartAge: z
    .number({ message: "Veuillez saisir l'âge de début de carrière" })
    .int()
    .min(12, "L'âge minimum est 12 ans")
    .max(35, "L'âge semble trop élevé"),

  militaryService: z.enum(['yes', 'no'], {
    message: 'Veuillez indiquer si vous avez effectué un service militaire',
  }),

  militaryDuration: z
    .number()
    .int()
    .min(1, 'La durée doit être supérieure à 0')
    .max(60, 'La durée semble trop élevée')
    .optional(),

  militaryReported: z.enum(['yes', 'no', 'unknown']).optional(),

  unemploymentPeriods: z.enum(['yes', 'no'], {
    message: 'Veuillez indiquer si vous avez eu des périodes de chômage',
  }),

  unemploymentDuration: z
    .number()
    .int()
    .min(1, 'La durée doit être supérieure à 0')
    .max(480, 'La durée semble trop élevée')
    .optional(),

  maternityOrSickness: z.enum(['yes', 'no'], {
    message: 'Veuillez indiquer si vous avez eu des congés maternité/maladie',
  }),

  maternityCount: z
    .number()
    .int()
    .min(1, 'Le nombre doit être supérieur à 0')
    .max(30, 'Le nombre semble trop élevé')
    .optional(),

  // ─── Étape 3 — Pension ───
  basePension: z
    .number()
    .min(0, 'Le montant doit être positif')
    .max(50000, 'Le montant semble trop élevé')
    .optional(),

  complementaryPension: z
    .number()
    .min(0, 'Le montant doit être positif')
    .max(50000, 'Le montant semble trop élevé')
    .optional(),

  retirementDate: z
    .string()
    .regex(dateRegex, 'Format de date invalide')
    .optional(),

  hasChildrenBonus: z.enum(['yes', 'no', 'unknown'], {
    message: 'Veuillez indiquer si la majoration enfants est appliquée',
  }),

  hasDecote: z.enum(['yes', 'no', 'unknown'], {
    message: 'Veuillez indiquer si une décote est appliquée',
  }),

  estimatedBasePension: z
    .number()
    .min(0)
    .max(50000)
    .optional(),

  estimatedComplementaryPension: z
    .number()
    .min(0)
    .max(50000)
    .optional(),

  plannedRetirementDate: z
    .string()
    .regex(dateRegex, 'Format de date invalide')
    .optional(),

  // ─── Étape 4 — Documents ───
  hasRIS: z.boolean(),
  hasEIG: z.boolean(),
  hasAgircArrco: z.boolean(),

  // ─── Étape 5 — Contact ───
  email: z
    .string({ message: 'Veuillez saisir votre email' })
    .email('Adresse email invalide'),
}).refine(
  (data) => {
    // Si retraité, pension base obligatoire
    if (data.status === 'retired' && (data.basePension === undefined || data.basePension === null)) {
      return false
    }
    return true
  },
  { message: 'Veuillez saisir votre pension de base', path: ['basePension'] }
).refine(
  (data) => {
    // Si service militaire = oui, durée obligatoire
    if (data.militaryService === 'yes' && !data.militaryDuration) {
      return false
    }
    return true
  },
  { message: 'Veuillez indiquer la durée du service militaire', path: ['militaryDuration'] }
).refine(
  (data) => {
    // Si chômage = oui, durée obligatoire
    if (data.unemploymentPeriods === 'yes' && !data.unemploymentDuration) {
      return false
    }
    return true
  },
  { message: 'Veuillez indiquer la durée totale de chômage', path: ['unemploymentDuration'] }
).refine(
  (data) => {
    // Trimestres cotisés <= trimestres validés
    if (data.cotisedTrimesters > data.totalTrimesters) {
      return false
    }
    return true
  },
  { message: 'Les trimestres cotisés ne peuvent pas dépasser les trimestres validés', path: ['cotisedTrimesters'] }
)

export type RetraitiaInput = z.infer<typeof retraitiaSchema>
