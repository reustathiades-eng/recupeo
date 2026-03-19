// ============================================================
// MABANQUE — Validation Zod du formulaire
// ============================================================
import { z } from 'zod'

export const mabanqueSchema = z.object({
  // Banque
  banque: z.string().min(1, 'Sélectionnez votre banque'),
  typeCompte: z.enum(['courant', 'joint']),

  // Frais
  commissionsIntervention: z.number().min(0).max(10000),
  commissionsNombre: z.number().int().min(0).max(200),
  rejetsPrelevement: z.number().min(0).max(10000),
  rejetsPrelevementNombre: z.number().int().min(0).max(100),
  rejetsCheque: z.number().min(0).max(10000),
  agios: z.number().min(0).max(10000),
  lettresInformation: z.number().min(0).max(5000),
  fraisTenueCompte: z.number().min(0).max(500),
  autresFrais: z.number().min(0).max(10000),
  autresFraisDescription: z.string().max(500).default(''),
  totalFraisMois: z.number().min(0).max(50000),
  estimationAnnuelle: z.number().min(0).max(500000).nullable(),

  // Situation
  clientFragile: z.enum(['yes', 'no', 'unknown']),
  offreSpecifique: z.enum(['yes', 'no', 'unknown']),
  surendettement: z.enum(['yes', 'no', 'unknown']),
  incidentsMultiples: z.enum(['yes', 'no', 'unknown']),
  inscritFCC: z.enum(['yes', 'no', 'unknown']),

  // Contact
  email: z.string().email('Email invalide'),
})

export type MabanqueSchemaType = z.infer<typeof mabanqueSchema>
