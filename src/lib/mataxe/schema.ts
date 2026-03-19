// ============================================================
// MATAXE — Schéma Zod de validation (23 champs, 4 sections)
// ============================================================
import { z } from 'zod'

export const mataxeSchema = z.object({
  // ─── Section 1 — Votre bien ───

  propertyType: z.enum(['appartement', 'maison', 'autre'], {
    message: 'Veuillez sélectionner le type de bien',
  }),

  constructionYear: z
    .number({ message: 'Veuillez indiquer l\'année de construction' })
    .int()
    .min(1800, 'L\'année doit être postérieure à 1800')
    .max(new Date().getFullYear(), 'L\'année ne peut pas être dans le futur'),

  surfaceHabitable: z
    .number({ message: 'Veuillez indiquer la surface habitable' })
    .min(5, 'Surface minimum 5 m²')
    .max(1000, 'Surface maximum 1 000 m²'),

  roomCount: z
    .number({ message: 'Veuillez indiquer le nombre de pièces principales' })
    .int()
    .min(1, 'Minimum 1 pièce')
    .max(30, 'Maximum 30 pièces'),

  floor: z
    .number()
    .int()
    .min(0, 'L\'étage doit être positif')
    .max(50, 'Étage trop élevé')
    .nullable(),

  elevator: z.enum(['oui', 'non', 'na'], {
    message: 'Veuillez indiquer si l\'immeuble a un ascenseur',
  }),

  bathroomCount: z
    .number({ message: 'Veuillez indiquer le nombre de salles de bain' })
    .int()
    .min(0, 'Minimum 0')
    .max(10, 'Maximum 10'),

  wcCount: z
    .number({ message: 'Veuillez indiquer le nombre de WC' })
    .int()
    .min(0, 'Minimum 0')
    .max(10, 'Maximum 10'),

  heating: z.enum(['central_collectif', 'central_individuel', 'individuel', 'aucun'], {
    message: 'Veuillez sélectionner le type de chauffage',
  }),

  hasGarage: z.boolean({ message: 'Veuillez indiquer si vous avez un garage' }),

  hasCave: z.boolean({ message: 'Veuillez indiquer si vous avez une cave' }),

  hasBalcony: z.boolean({ message: 'Veuillez indiquer si vous avez un balcon/terrasse' }),

  balconySurface: z
    .number()
    .min(0, 'La surface doit être positive')
    .max(200, 'Surface trop grande')
    .nullable(),

  // ─── Section 2 — État du bien ───

  buildingCondition: z.enum(['tres_bon', 'bon', 'passable', 'mediocre', 'mauvais', 'na'], {
    message: 'Veuillez évaluer l\'état de l\'immeuble',
  }),

  propertyCondition: z.enum(['tres_bon', 'bon', 'passable', 'mediocre', 'mauvais'], {
    message: 'Veuillez évaluer l\'état du logement',
  }),

  removedEquipment: z.enum(['oui', 'non', 'ne_sais_pas'], {
    message: 'Veuillez indiquer si des équipements ont été supprimés',
  }),

  removedEquipmentDetail: z
    .string()
    .max(500, 'Description trop longue')
    .nullable(),

  // ─── Section 3 — Taxe foncière ───

  taxAmount: z
    .number({ message: 'Veuillez saisir le montant de votre taxe foncière' })
    .min(10, 'Le montant semble trop bas')
    .max(100000, 'Le montant semble trop élevé'),

  commune: z
    .string({ message: 'Veuillez saisir votre commune' })
    .min(2, 'Nom de commune trop court')
    .max(100, 'Nom de commune trop long'),

  vlcKnown: z.boolean({ message: 'Indiquez si vous connaissez votre VLC' }),

  vlcAmount: z
    .number()
    .min(0, 'La VLC doit être positive')
    .max(500000, 'VLC trop élevée')
    .nullable(),

  has6675M: z.boolean({ message: 'Indiquez si vous disposez du formulaire 6675-M' }),

  baseNette: z
    .number()
    .min(0, 'La base nette doit être positive')
    .max(500000, 'Montant trop élevé')
    .nullable(),

  // ─── Section 4 — Situation personnelle ───

  ownerAge: z
    .number({ message: 'Veuillez indiquer votre âge' })
    .int()
    .min(18, 'Vous devez avoir au moins 18 ans')
    .max(120, 'Âge trop élevé'),

  beneficiaryAspaAah: z.boolean({
    message: 'Indiquez si vous êtes bénéficiaire ASPA/AAH/ASI',
  }),

  isMainResidence: z.boolean({
    message: 'Indiquez s\'il s\'agit de votre résidence principale',
  }),

  email: z
    .string({ message: 'Veuillez saisir votre email' })
    .email('Adresse email invalide'),

}).refine(
  (data) => {
    // Si balcon = oui, surface obligatoire et > 0
    if (data.hasBalcony && (!data.balconySurface || data.balconySurface <= 0)) {
      return false
    }
    return true
  },
  { message: 'Veuillez indiquer la surface du balcon/terrasse', path: ['balconySurface'] }
).refine(
  (data) => {
    // Si VLC connue, montant obligatoire
    if (data.vlcKnown && (!data.vlcAmount || data.vlcAmount <= 0)) {
      return false
    }
    return true
  },
  { message: 'Veuillez indiquer le montant de la VLC', path: ['vlcAmount'] }
).refine(
  (data) => {
    // Si équipements supprimés = oui, détail recommandé
    if (data.removedEquipment === 'oui' && (!data.removedEquipmentDetail || data.removedEquipmentDetail.trim().length < 3)) {
      return false
    }
    return true
  },
  { message: 'Veuillez préciser quels équipements ont été supprimés', path: ['removedEquipmentDetail'] }
)

export type MataxeInput = z.infer<typeof mataxeSchema>
