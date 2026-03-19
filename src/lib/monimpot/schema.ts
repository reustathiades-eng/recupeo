import { z } from 'zod'

export const monimpotSchema = z.object({
  situation: z.enum(['celibataire', 'marie_pacse', 'divorce_separe', 'veuf']),
  vivezSeul: z.boolean(),
  enfantsMineurs: z.number().min(0).max(15),
  enfantsMajeurs: z.number().min(0).max(10),
  eleveSeul5ans: z.boolean(),
  age: z.number().min(16).max(120),
  invalidite: z.boolean(),

  revenuNetImposable: z.number().min(0).max(10000000),
  nbParts: z.number().min(1).max(20),
  impotPaye: z.number().min(0),
  typeRevenus: z.enum(['salaires', 'retraite', 'mixte', 'independant']),

  fraisReels: z.boolean(),
  distanceTravail: z.number().min(0).max(200).optional(),
  puissanceFiscale: z.number().min(3).max(7).optional(),
  teletravail: z.boolean().optional(),
  joursTeletravail: z.number().min(0).max(5).optional(),

  pensionAlimentaire: z.boolean(),
  pensionMontantMois: z.number().min(0).optional(),

  dons: z.boolean(),
  donsMontantAn: z.number().min(0).optional(),

  emploiDomicile: z.boolean(),
  emploiDomicileMontantAn: z.number().min(0).optional(),

  gardeEnfant: z.boolean(),
  gardeMontantAn: z.number().min(0).optional(),

  ehpad: z.boolean(),
  ehpadMontantAn: z.number().min(0).optional(),

  per: z.boolean(),
  perMontantAn: z.number().min(0).optional(),

  revenusCapitaux: z.boolean(),
  case2op: z.boolean().nullable().optional(),

  // Phase 3 fields
  enfantsCollege: z.number().min(0).max(10).optional(),
  enfantsLycee: z.number().min(0).max(10).optional(),
  enfantsSuperieur: z.number().min(0).max(10).optional(),
  cotisationsSyndicales: z.number().min(0).optional(),
  pinelMontant: z.number().min(0).optional(),
  outreMerMontant: z.number().min(0).optional(),
  investForestier: z.number().min(0).optional(),
  renovationEnergetique: z.number().min(0).optional(),
  borneElectriqueMontant: z.number().min(0).max(4).optional(),
  pretEtudiantMontant: z.number().min(0).optional(),
  loyersBruts: z.number().min(0).optional(),
  chargesLocatives: z.number().min(0).optional(),
  locationMeubleeCA: z.number().min(0).optional(),
  csgDeductibleMontant: z.number().min(0).optional(),
  prestationCompensatoireMontant: z.number().min(0).optional(),
  domTom: z.boolean().optional(),
  deficitsFonciersAnterieurs: z.number().min(0).optional(),

  email: z.string().email('Email invalide').optional().or(z.literal('')),

  // ─── Champs V2 (extraction) ───
  rfr: z.number().min(0).optional(),
  isFromExtraction: z.boolean().optional(),
  extractedCases: z.record(z.string(), z.union([z.number(), z.boolean()])).optional(),
  extractedRevenusCapitaux: z.number().min(0).optional(), // O5 — montant exact des revenus de capitaux (V2 extraction)
  multiAvis: z.array(z.any()).optional(),
})
