// ============================================================
// MAPENSION — Validation Zod du formulaire
// ============================================================
import { z } from 'zod'

export const mapensionSchema = z.object({
  // Pension
  initialAmount: z.number()
    .min(1, 'Le montant initial doit être supérieur à 0')
    .max(50000, 'Le montant semble trop élevé'),
  judgmentDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide')
    .refine(d => {
      const date = new Date(d)
      return date <= new Date() && date >= new Date('1970-01-01')
    }, 'La date doit être dans le passé'),
  childrenCount: z.number()
    .int()
    .min(1, 'Au moins 1 enfant')
    .max(20, 'Maximum 20 enfants'),
  indexType: z.enum([
    'ensemble_hors_tabac',
    'ouvriers_hors_tabac',
    'ensemble_tabac',
    'ouvriers_tabac',
  ]),
  referenceIndex: z.number().positive().nullable(),
  revaluationMonth: z.number().int().min(1).max(12),

  // Historique
  alreadyRevalued: z.enum(['yes', 'no', 'unknown']),
  lastRevaluedAmount: z.number().positive().nullable(),
  lastRevaluedDate: z.string().nullable(),
  currentAmountPaid: z.number()
    .min(0, 'Le montant versé doit être positif')
    .max(50000, 'Le montant semble trop élevé'),

  // Situation
  userRole: z.enum(['creditor', 'debtor']),
  usesARIPA: z.enum(['yes', 'no', 'unknown']),

  // Contact
  email: z.string().email('Email invalide'),
})

export type MapensionSchemaType = z.infer<typeof mapensionSchema>
