// ============================================================
// MONCHOMAGE — Validation Zod du formulaire
// ============================================================
import { z } from 'zod'

export const monchomageSchema = z.object({
  // Situation
  ageFinContrat: z.number().int().min(16).max(67),
  dateFinContrat: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
  typeRupture: z.enum(['licenciement', 'rupture_conv', 'fin_cdd', 'demission', 'autre']),
  typeContrat: z.enum(['cdi', 'cdd', 'interim', 'autre']),

  // Rémunérations
  salaireBrutMoyen: z.number().min(1, 'Le salaire doit être supérieur à 0').max(50000),
  hasPrimes: z.boolean(),
  primesTotal: z.number().min(0).max(500000).default(0),
  hasMaladie: z.boolean(),
  maladieDuree: z.number().int().min(0).max(1100).default(0),
  hasActivitePartielle: z.boolean(),
  apDuree: z.number().int().min(0).max(1100).default(0),
  multiEmployeurs: z.boolean(),

  // Notification France Travail
  ajBrute: z.number().min(0.01, 'Montant requis').max(500),
  dureeIndemnisation: z.number().int().min(1).max(1100),
  sjrNotification: z.number().positive().nullable(),
  degressiviteAppliquee: z.enum(['yes', 'no', 'unknown']),

  // Contact
  email: z.string().email('Email invalide'),
})

export type MonchomageSchemaType = z.infer<typeof monchomageSchema>
