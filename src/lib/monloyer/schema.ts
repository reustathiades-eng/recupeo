// ============================================================
// MONLOYER — Schéma Zod de validation du formulaire
// ============================================================
import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const monloyerSchema = z.object({
  // Ville (doit être parmi les 69 communes éligibles — validée côté API)
  city: z
    .string({ message: 'Veuillez sélectionner votre ville' })
    .min(2, 'Nom de ville trop court'),

  // Adresse complète
  address: z
    .string({ message: 'Veuillez saisir votre adresse' })
    .min(5, 'Adresse trop courte')
    .max(300, 'Adresse trop longue'),

  // Type de location
  locationType: z.enum(['vide', 'meuble'], {
    message: 'Veuillez sélectionner le type de location',
  }),

  // Nombre de pièces
  rooms: z
    .number({ message: 'Veuillez indiquer le nombre de pièces' })
    .int()
    .min(1, 'Minimum 1 pièce')
    .max(4, 'Maximum 4 pièces (4 = 4 et plus)') as z.ZodType<1 | 2 | 3 | 4>,

  // Époque de construction
  constructionEra: z.enum(['before_1946', '1946_1970', '1971_1990', 'after_1990'], {
    message: 'Veuillez sélectionner la période de construction',
  }),

  // Surface en m²
  surface: z
    .number({ message: 'Veuillez saisir la surface' })
    .min(5, 'Surface minimum 5 m²')
    .max(500, 'Surface maximum 500 m²'),

  // Loyer HC actuel
  currentRent: z
    .number({ message: 'Veuillez saisir votre loyer hors charges' })
    .min(50, 'Le loyer semble trop bas')
    .max(20000, 'Le loyer semble trop élevé'),

  // Complément de loyer
  hasComplement: z.enum(['yes', 'no', 'unknown'], {
    message: 'Veuillez indiquer si un complément de loyer est appliqué',
  }),

  complementAmount: z
    .number()
    .min(0, 'Le montant doit être positif')
    .max(10000, 'Montant trop élevé')
    .optional(),

  // Date de signature du bail
  bailDate: z
    .string({ message: 'Veuillez saisir la date de signature du bail' })
    .regex(dateRegex, 'Format de date invalide (AAAA-MM-JJ)'),

  // DPE
  dpe: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'unknown'], {
    message: 'Veuillez sélectionner le DPE',
  }),

  // Loyer de référence majoré (saisi par l'utilisateur depuis le simulateur officiel)
  referenceRentMajore: z
    .number({ message: 'Veuillez saisir le loyer de référence majoré' })
    .min(1, 'Le loyer de référence doit être supérieur à 0')
    .max(100000, 'Montant trop élevé'),

  // Email
  email: z
    .string({ message: 'Veuillez saisir votre email' })
    .email('Adresse email invalide'),
}).refine(
  (data) => {
    // Si complément = oui, montant obligatoire
    if (data.hasComplement === 'yes' && (!data.complementAmount || data.complementAmount <= 0)) {
      return false
    }
    return true
  },
  { message: 'Veuillez indiquer le montant du complément de loyer', path: ['complementAmount'] }
).refine(
  (data) => {
    // La date du bail ne peut pas être dans le futur
    const bailDate = new Date(data.bailDate)
    const today = new Date()
    return bailDate <= today
  },
  { message: 'La date du bail ne peut pas être dans le futur', path: ['bailDate'] }
)

export type MonloyerInput = z.infer<typeof monloyerSchema>
