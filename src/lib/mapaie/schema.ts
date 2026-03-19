import { z } from 'zod'

const CURRENT_YEAR = new Date().getFullYear()

export const ConventionCodeSchema = z.enum([
  'IDCC_2216',
  'IDCC_1979',
  'IDCC_1596',
  'IDCC_3248',
  'IDCC_0573',
  'AUTRE',
])

export const AuditPeriodSchema = z.enum(['THREE_MONTHS', 'TWELVE_MONTHS'])

export const EmploiSchema = z
  .object({
    intitulePoste: z.string().min(2, 'Intitule de poste requis').max(120),
    conventionCollective: ConventionCodeSchema,
    conventionLibelle: z.string().max(200).optional(),
    dateEntree: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD requis'),
    coefficient: z.number().positive().max(9999).nullable().optional(),
    classification: z.string().max(100).nullable().optional(),
    qualification: z.string().max(100).nullable().optional(),
    tempsPartiel: z.boolean().default(false),
    dureeHebdomadaire: z.number().min(1).max(60).default(35),
    forfaitJours: z.boolean().default(false),
    nombreJoursForfait: z.number().min(100).max(282).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tempsPartiel && data.dureeHebdomadaire >= 35) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dureeHebdomadaire'],
        message: 'Un temps partiel implique moins de 35h hebdomadaires',
      })
    }
    if (data.forfaitJours && !data.nombreJoursForfait) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nombreJoursForfait'],
        message: 'Nombre de jours requis pour un forfait jours',
      })
    }
    if (data.conventionCollective === 'AUTRE' && !data.conventionLibelle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['conventionLibelle'],
        message: 'Precisez le nom de votre convention collective',
      })
    }
  })

export const RemunerationSchema = z
  .object({
    salaireBrutMensuel: z.number().min(1, 'Salaire brut requis').max(999_999),
    salaireNetMensuel: z.number().min(1, 'Salaire net requis').max(999_999),
    tauxHoraireBrut: z.number().positive().max(9999).nullable().optional(),
    heuresSupMensuelles: z.number().min(0).max(200).default(0),
    primes: z.array(
      z.object({
        libelle: z.string().min(1, 'Libelle de prime requis').max(120),
        montant: z.number().positive('Le montant doit etre positif'),
        periodicite: z.enum(['MENSUELLE', 'TRIMESTRIELLE', 'ANNUELLE']),
      })
    ).default([]),
    avantagesNature: z.array(
      z.object({
        type: z.enum(['LOGEMENT', 'VEHICULE', 'REPAS', 'TELEPHONE', 'AUTRE']),
        montantMensuel: z.number().min(0),
        libelle: z.string().max(120).optional(),
      })
    ).default([]),
    ancienneteAnnees: z.number().int().min(0).max(50).default(0),
  })
  .superRefine((data, ctx) => {
    if (data.salaireNetMensuel >= data.salaireBrutMensuel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['salaireNetMensuel'],
        message: 'Le salaire net doit etre inferieur au brut',
      })
    }
  })

export const DocumentUploadSchema = z.object({
  fichiers: z
    .array(
      z.object({
        nom: z.string().min(1),
        taille: z.number().max(20 * 1024 * 1024, 'Fichier trop volumineux (max 20 Mo)'),
        type: z.string().refine(
          (t) => ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(t),
          'Format accepte : PDF, JPEG, PNG ou WebP'
        ),
        mois: z.number().int().min(1).max(12),
        annee: z.number().int().min(CURRENT_YEAR - 4).max(CURRENT_YEAR),
      })
    )
    .min(1, 'Televersez au moins un bulletin de paie')
    .max(36, '36 bulletins maximum'),
})

export const PreDiagnosticSchema = z.object({
  emploi: EmploiSchema,
  remuneration: RemunerationSchema,
  periodeAudit: AuditPeriodSchema,
  consentementTraitement: z.literal(true).refine(v => v === true, {
    message: 'Vous devez accepter le traitement de vos donnees',
  }),
})

export type EmploiInput = z.infer<typeof EmploiSchema>
export type RemunerationInput = z.infer<typeof RemunerationSchema>
export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>
export type PreDiagnosticInput = z.infer<typeof PreDiagnosticSchema>
