// ============================================================
// MACAUTION — Schéma Zod de validation du formulaire (Zod v4)
// ============================================================
import { z } from 'zod'

export const deductionReasons = [
  'peintures_murs',
  'sols',
  'sanitaires_plomberie',
  'equipements_cuisine',
  'menuiseries_portes',
  'nettoyage',
  'loyers_impayes',
  'charges_impayees',
  'autre',
] as const

export const deductionLabels: Record<string, string> = {
  peintures_murs: 'Dégradation des peintures / murs',
  sols: 'Dégradation des sols',
  sanitaires_plomberie: 'Dégradation sanitaires / plomberie',
  equipements_cuisine: 'Dégradation équipements cuisine',
  menuiseries_portes: 'Dégradation menuiseries / portes',
  nettoyage: 'Nettoyage',
  loyers_impayes: 'Loyers impayés',
  charges_impayees: 'Charges impayées',
  autre: 'Autre',
}

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const macautionSchema = z.object({
  locationType: z.enum(['vide', 'meuble'], {
    message: 'Veuillez sélectionner le type de location',
  }),

  rentAmount: z
    .number({ message: 'Veuillez saisir le loyer mensuel' })
    .min(1, 'Le loyer doit être supérieur à 0€')
    .max(50000, 'Le loyer semble trop élevé'),

  depositAmount: z
    .number({ message: 'Veuillez saisir le montant du dépôt' })
    .min(1, 'Le dépôt doit être supérieur à 0€')
    .max(100000, 'Le montant semble trop élevé'),

  entryDate: z
    .string({ message: "Veuillez saisir la date d'entrée" })
    .regex(dateRegex, 'Format de date invalide (AAAA-MM-JJ)'),

  exitDate: z
    .string({ message: 'Veuillez saisir la date de sortie' })
    .regex(dateRegex, 'Format de date invalide (AAAA-MM-JJ)'),

  depositReturned: z.enum(['total', 'partial', 'none'], {
    message: 'Veuillez indiquer si le dépôt a été restitué',
  }),

  returnedAmount: z
    .number()
    .min(0, 'Le montant doit être positif')
    .optional(),

  returnDate: z
    .string()
    .regex(dateRegex, 'Format de date invalide')
    .optional(),

  deductions: z
    .array(z.enum(deductionReasons))
    .min(0),

  deductionAmount: z
    .number({ message: 'Veuillez saisir le montant des retenues' })
    .min(0, 'Le montant doit être positif'),

  hasInvoices: z.enum(['yes', 'no', 'partial'], {
    message: 'Veuillez indiquer si des justificatifs ont été fournis',
  }),

  entryDamages: z.enum(['yes', 'no', 'no_edl'], {
    message: "Veuillez indiquer l'état de l'EDL d'entrée",
  }),

  email: z
    .string({ message: 'Veuillez saisir votre email' })
    .email('Adresse email invalide'),

  otherDeduction: z.string().optional(),
}).refine(
  (data) => {
    const entry = new Date(data.entryDate)
    const exit = new Date(data.exitDate)
    return exit > entry
  },
  { message: "La date de sortie doit être postérieure à la date d'entrée", path: ['exitDate'] }
).refine(
  (data) => {
    if (data.depositReturned === 'partial' && (data.returnedAmount === undefined || data.returnedAmount === null)) {
      return false
    }
    return true
  },
  { message: 'Veuillez saisir le montant restitué', path: ['returnedAmount'] }
)

export type MacautionInput = z.infer<typeof macautionSchema>
